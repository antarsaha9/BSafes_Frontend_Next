import { createSlice, current } from '@reduxjs/toolkit';
import { startTransition } from 'react';
const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { debugLog, PostCall, extractHTMLElementText } from '../lib/helper'
import { decryptBinaryString, encryptBinaryString, stringToEncryptedTokens } from '../lib/crypto';
import { createNewItemVersion } from '../lib/bSafesCommonUI';

const debugOn = true;

const initialState = {
    activity: "Done",  //"Done", "Error", "Loading", "Uploading"
    error: null,
    latestVersion: null,
    itemCopy: null,
    id: null,
    isBlankPageItem: true,
    space: null,
    container: null,
    position: null,
    itemKey: null,
    itemIV: null,
    tags: [],
    title: null,
    titleText: null,
    content:null,
    imagePanels:[],
    imagePanelsIndex:{},
    uploadQueue:[],
}

const dataFetchedFunc = (state, action) => {
    const item = action.payload.item;

    state.itemCopy = item;

    state.id = item.id;
    state.isBlankPageItem = false;
    state.space = item.space;
    state.container = item.container;
    state.position = item.position;

    function decryptPageItem(expandedKey) {
        if ((item.keyEnvelope === undefined)) {      
            debugLog(debugOn, "Error: undefined item key");
            state.error = "Undefined item key";
        }
        if(item.envelopeIV && item.ivEnvelope && item.ivEnvelopeIV) { // legacy CBC-mode
            state.itemKey = decryptBinaryString(forge.util.decode64(item.keyEnvelope), expandedKey, forge.util.decode64(item.envelopeIV));
            state.itemIV = decryptBinaryString(forge.util.decode64(item.ivEnvelope), expandedKey, forge.util.decode64(item.ivEnvelopeIV));
        } else {
            const decoded = forge.util.decode64(item.keyEnvelope);
            state.itemKey = decryptBinaryString(decoded, expandedKey);
            state.itemIV = null;
        }
        let itemTags = [];
        if (item.tags && item.tags.length > 1) {
            const encryptedTags = item.tags;
            for (let i = 0; i < (item.tags.length - 1); i++) {
              try {
                let encryptedTag = encryptedTags[i];
                encryptedTag = forge.util.decode64(encryptedTag);
                const encodedTag = decryptBinaryString(encryptedTag, state.itemKey, state.itemIV);
                const tag = forge.util.decodeUtf8(encodedTag);

                itemTags.push(tag);
              } catch (err) {
                state.error = err;
              }
            }
        };
        state.tags = itemTags;

        let titleText = "";
        if (item.title) {
            try {
                const encodedTitle = decryptBinaryString(forge.util.decode64(item.title), state.itemKey, state.itemIV);
                let title = forge.util.decodeUtf8(encodedTitle);
                title = DOMPurify.sanitize(title);
                state.title = title;
                state.titleText = $(title).text();
            } catch (err) {
                state.error = err;
            }
        } else {
            state.title = '<h2></h2>';
            state.titleText = "";
        }

	    if (item.content) {
	        try {
	            const encodedContent = decryptBinaryString(forge.util.decode64(item.content), state.itemKey, state.itemIV);
	            let content = forge.util.decodeUtf8(encodedContent);

	            content = DOMPurify.sanitize(content);
                             
                state.content = content;
	        } catch (err) {
	            state.error = err;
	        }  	                            
	    }
    }

    if (item.space.substring(0, 1) === 'u') {
        decryptPageItem(action.payload.expandedKey);
    } else {

    }
}

const pageSlice = createSlice({
    name: "page",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        dataFetched: (state, action) => {
            dataFetchedFunc(state, action);
        },
        newVersionCreated: (state, action) => {
            const updatedKeys = Object.keys(action.payload);
            for(let i=0; i<updatedKeys.length; i++) {
                let key = updatedKeys[i];
                state[key] = action.payload[key];
            }
        },
        addImages: (state, action) => {
            switch (action.payload.where) {
                case "top":
                    state.imagePanels.unshift(...action.payload.newPanels)
                    break;
                case "bottom":
                    break;
                default:
            }
            let index = {};
            for(let i=0; i< state.imagePanels.length; i++) {
                let key = state.imagePanels[i].key;
                index[key] = i;
            }
            state.imagePanelsIndex = index;
            state.uploadQueue.push(...action.payload.newPanels);
        },
        uploadAnImage: (state, action) => {
            console.log("uploadAnImage");
            console.log("action payload: ", action.payload)
            console.log("imagePanelsIndex: ", current(state.imagePanelsIndex));
            let i = state.imagePanelsIndex[action.payload];
            console.log("index: ", i);
            console.log("imagePanels :", current(state.imagePanels));
            let thisPanel = state.imagePanels[i];
            console.log("This panel: ", current(thisPanel));
            state.imagePanels[i].status = "uploading";
        },
        doneUploadingAnImage: (state, action) => {
            console.log("doneUploadingAnImage");
            console.log("action payload: ", action.payload)
            console.log("imagePanelsIndex: ", current(state.imagePanelsIndex));
            let i = state.imagePanelsIndex[action.payload];
            console.log("index: ", i);
            console.log("imagePanels :", current(state.imagePanels));
            let thisPanel = state.imagePanels[i];
            console.log("This panel: ", current(thisPanel));
            state.uploadQueue.shift();
            console.log("uploadQueue: ", current(state.uploadQueue));
            state.imagePanels[i].status = "displayed";
        }
    }
})

export const { activityChanged, dataFetched, newVersionCreated, addImages, uploadAnImage, doneUploadingAnImage } = pageSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        dispatch(activityChanged("Error"));
    }
}

export const getPageItemThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise((resolve, reject) => {
            PostCall({
                api:'/memberAPI/getPageItem',
                body: {itemId: data.itemId},
            }).then( result => {
                debugLog(debugOn, result);
                if(result.status === 'ok') {                                   
                    if(result.item) {
                        dispatch(dataFetched({item:result.item, expandedKey:data.expandedKey}));
                        resolve();
                    } else {
                        reject("woo... failed to get a page item!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a page item!", data.error);
                    reject("woo... failed to get a page item!");
                }
            }).catch( error => {
                debugLog(debugOn, "woo... failed to get a page item.")
                reject("woo... failed to get a page item!");
            })
        });
    });
}

function createNewItemVersionForPage(dispatch, itemCopy, updatedData) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await createNewItemVersion(itemCopy);
            if (data.status === 'ok') {
                const usage = data.usage;
                itemCopy.usage = usage;
                dispatch(newVersionCreated({
                    itemCopy,
                    ...updatedData
                }));
                resolve();
            } else {
                reject("Could not create a new item version!");
            } 
        } catch (error) {
            debugLog(debugOn, error);
            reject("Could not create a new item version!");
        }
    })
};

export const saveTitleThunk = (title, searchKey, searchIV) => async (dispatch, getState) => {
    newActivity(dispatch, "Uploading", () => {
        return new Promise(async (resolve, reject) => {
            let state, titleText, encodedTitle, encryptedTitle, titleTokens;
            state = getState();
            try {
                titleText = extractHTMLElementText(title);
                encodedTitle = forge.util.encodeUtf8(title);
                encryptedTitle = encryptBinaryString(encodedTitle, state.page.itemKey);
                titleTokens = stringToEncryptedTokens(titleText, searchKey, searchIV);
            
                if (state.isBlankPageItem) {
                } else {
                    let itemCopy = {
                        ...state.page.itemCopy
                    }
        
                    itemCopy.title = forge.util.encode64(encryptedTitle);
                    itemCopy.titleTokens = titleTokens;
                    itemCopy.update = "title";
            
                    await createNewItemVersionForPage(dispatch, itemCopy, {title, titleText});
                    resolve();
                }
            } catch (error) {
                reject();
            }

        });
    })
}

export const addImagesAsyncThunk = (data) => async (dispatch, getState) => {
    const state = getState();
    
    console.log("Timeout");
    let newPanels = data.files.map((file, index) => {
        return {file: file, 
        key: Date.now() + '-' + index,
        status: "waitingForUpload"}
    }) 
    dispatch(addImages({newPanels:newPanels, where: data.where}));

    const uploadAnImageAsync = async () => {
            await new Promise( resolve => setTimeout(resolve, 3000));
    }

    if(state.page.status === "idle") {
        console.log("Page status is idle");

        state = getState();

        while(state.page.uploadQueue.length !== 0) {
            let item = state.page.uploadQueue[0];
            dispatch(uploadAnImage(item.key));
            await uploadAnImageAsync();
            dispatch(doneUploadingAnImage(item.key));
            state = getState();
        } 
    }
}

export const pageReducer = pageSlice.reducer;

export default pageSlice;