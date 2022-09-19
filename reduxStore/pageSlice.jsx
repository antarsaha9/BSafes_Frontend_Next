import { createSlice, current } from '@reduxjs/toolkit';
import { startTransition } from 'react';
const forge = require('node-forge');
const DOMPurify = require('dompurify');
const axios = require('axios');

import { convertBinaryStringToUint8Array, debugLog, PostCall, extractHTMLElementText, Utf8ArrayToStr } from '../lib/helper'
import { decryptBinaryString, encryptBinaryString, encryptLargeBinaryString, decryptLargeBinaryString, stringToEncryptedTokens } from '../lib/crypto';
import { createNewItemVersion } from '../lib/bSafesCommonUI';
import { rotateImage } from '../lib/wnImage';

const debugOn = true;

const initialState = {
    activity: "Done",  //"Done", "Error", "Loading", "Saving", "UploadingImages"
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
    imageUploadQueue:[],
    imageUploadIndex:0,
    imageDownloadQueue:[],
    imageDownloadIndex:0
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
            const files = action.payload.files;
            let newPanels = [];
            for(let i=0; i < files.length; i++) {
                const queueId = 'u' + state.imageUploadQueue.length;
                const newUpload = {file: files[i]};
                state.imageUploadQueue.push(newUpload);
                const newPanel = {
                    queueId: queueId,
                    progress: 0
                }
                newPanels.push(newPanel);
            }
            switch (action.payload.where) {
                case "top":
                    state.imagePanels.unshift(...newPanels);
                    break;
                case "bottom":
                    break;
                default:
            }
        },
        imageUploaded: (state, action) => {
            let panel = state.imagePanels.find((item) => item.queueId === 'u'+state.imageUploadIndex);
            panel.progress = 1;
            state.imageUploadIndex += 1;
        }
/*        uploadAnImage: (state, action) => {
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
*/
    }
})

export const { activityChanged, dataFetched, newVersionCreated, addImages, imageUploaded, doneUploadingAnImage } = pageSlice.actions;

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
    newActivity(dispatch, "Saving", () => {
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

function preProcessEditorContentBeforeSaving(content) {
    var tempElement = document.createElement("div");
    tempElement.innerHTML = content;
    const images = tempElement.querySelectorAll(".bSafesImage");
    let s3ObjectsInContent = [];
	let totalS3ObjectsSize = 0;
    images.forEach((item) => {
        const id = item.id;
        const idParts = id.split('&');
        const s3Key = idParts[0];
        const dimension = idParts[1];
        const size = parseInt(idParts[2]);
        s3ObjectsInContent.push({
            s3Key: s3Key,
            size: size
        });
        totalS3ObjectsSize += size;
        const placeholder = 'https://via.placeholder.com/' + dimension;
        item.src = placeholder;
    });

    images.forEach((item) => { // Clean up any bSafes status class
	    item.classList.remove('bSafesDisplayed');
	    item.classList.remove('bSafesDownloading');
	});

    const videos = tempElement.querySelectorAll('.fr-video');
    videos.forEach((item) => {
        const video = item.querySelector('video');
        video.classList.remove('fr-draggable');
        const videoId = video.id;
        const videoStyle = video.style;
        const videoImg = document.createElement('img');
        if(item.classList.contains('fr-dvb')) videoImg.classList.add('fr-dib');
        if(item.classList.contains('fr-dvi')) videoImg.classList.add('fr-dii');
	    if(item.classList.contains('fr-fvl')) videoImg.classList.add('fr-fil');
	    if(item.classList.contains('fr-fvc')) videoImg.classList.add('fr-fic');
	    if(item.classList.contains('fr-fvr')) videoImg.classList.add('fr-fir');
    
        videoImg,id = videoId;
        videoImg.style = videoStyle;
        const placeholder = 'https://via.placeholder.com/' + '360x200';
        videoImg.src = placeholder;
        item.replaceWith(videoImg);
    });

    const videoImgs = tempElement.querySelectorAll('.bSafesDownloadVideo');
    videoImgs.forEach((item) => {
        const id = item.id;
        const idParts = id.split('&');
	    const s3Key = idParts[0];
	    const size = parseInt(idParts[1]);

        s3ObjectsInContent.push({
            s3Key: s3Key,
            size: size
        });
        totalS3ObjectsSize += size;
    });

    return {
	    content: tempElement.innerHTML,
	    s3ObjectsInContent: s3ObjectsInContent,
	    s3ObjectsSize: totalS3ObjectsSize
	};
};

export const saveContentThunk = (content) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, encodedContent, encryptedContent;
            state = getState();
            const result = preProcessEditorContentBeforeSaving(content);
            const s3ObjectsInContent = result.s3ObjectsInContent;
	        const s3ObjectsSize = result.s3ObjectsSize;
            
            try {
                encodedContent = forge.util.encodeUtf8(content);
                encryptedContent = encryptBinaryString(encodedContent, state.page.itemKey);
            
                if (state.isBlankPageItem) {
                } else {
                    let itemCopy = {
                        ...state.page.itemCopy
                    }
        
                    itemCopy.content = forge.util.encode64(encryptedContent);
                    itemCopy.s3ObjectsInContent = s3ObjectsInContent;
	                itemCopy.s3ObjectsSizeInContent = s3ObjectsSize;
                    itemCopy.update = "content";
            
                    await createNewItemVersionForPage(dispatch, itemCopy, {content});
                    resolve();
                }
            } catch (error) {
                reject();
            }

        });
    })
}

const uploadAnImage = async (dispatch, state, file) => {
    let img;
    let imageDataInBinaryString;
    let s3Key, s3ObjectSize;
    let totalUploadedSize = 0; 
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        const startUploadingAnImage = async ()=> {
            debugLog(debugOn, 'startUploadingAnImage');
            const imageWidth = img.width;
	        const imageHeight = img.height;

            const uploadToS3 = (data) => {
                let signedURL, signedGalleryURL, signedThumbnailURL; 
                debugLog(debugOn, 'uploadToS3');
                return new Promise( async (resolve, reject) => {
                    const preS3Upload = () => {
                        return new Promise( async (resolve, reject) => {
                            PostCall({
                                api:'/memberAPI/preS3Upload',
                            }).then( data => {
                                debugLog(debugOn, data);
                                if(data.status === 'ok') {  
                                    s3Key = data.s3Key;
	                                signedURL = data.signedURL;
	                                signedGalleryURL = data.signedGalleryURL;
	                                signedThumbnailURL = data.signedThumbnailURL;                                 
                                    resolve();
                                } else {
                                    debugLog(debugOn, "preS3Upload failed: ", data.error);
                                    reject(data.error);
                                }
                            }).catch( error => {
                                debugLog(debugOn, "preS3Upload failed: ", error)
                                reject("preS3Upload failed:!");
                            })
                        });
                    };
                   
                    try {
                        await preS3Upload();
                        totalUploadedSize += data.byteLength;
                        
                        const axiosResponse = await axios.put(signedURL, {
                            data: data,
                        }, {
                            headers: {
                              'Content-Type': 'binary/octet-stream'
                        }});
                          
                        debugLog(debugOn, axiosResponse)
                    } catch(error) {
                        debugLog(debugOn, 'uploadToS3 error: ', error)
                        reject(error);
                    }
                });
            };

            const postS3Upload = () => {
                debugLog(debugOn, 'postS3Upload');
            };

            const encryptDataInBinaryString = (data) => {
                const binaryStr = data;
	            debugLog(debugOn, 'encryptDataInBinaryString length: ', binaryStr.length);
	            const encryptedStr = encryptLargeBinaryString(binaryStr, state.itemKey);
	            const uint8Array = convertBinaryStringToUint8Array(encryptedStr);
	            return encryptedStr;
            };

            const encryptedImageData = encryptDataInBinaryString(imageDataInBinaryString);

            //const encryptedImageDataInUint8Array = encryptDataInBinaryString(imageDataInBinaryString);
            //const encrypted_buffer = Utf8ArrayToStr(encryptedImageDataInUint8Array, 1000);
            try {
                await uploadToS3(encryptedImageData);
            } catch(error) {
                debugLog(debugOn, 'uploadToS3 error: ', error);
            }      
        };


        reader.addEventListener('load', async () => {
            const imageData = reader.result;

            const getOrientation = (data) => {
	            var view = new DataView(imageData);

	            if (view.getUint16(0, false) != 0xFFD8) return -2;

	            var length = view.byteLength,
	              offset = 2;
	            while (offset < length) {
	              var marker = view.getUint16(offset, false);
	              offset += 2;
	              if (marker == 0xFFE1) {

	                if (view.getUint32(offset += 2, false) != 0x45786966) return -1;

	                var little = view.getUint16(offset += 6, false) == 0x4949;
	                offset += view.getUint32(offset + 4, little);
	                var tags = view.getUint16(offset, little);
	                offset += 2;
	                for (var i = 0; i < tags; i++)
	                  if (view.getUint16(offset + (i * 12), little) == 0x0112)
	                    return view.getUint16(offset + (i * 12) + 8, little);
	              } else if ((marker & 0xFF00) != 0xFF00) break;
	              else offset += view.getUint16(offset, false);
	            }
	            return -1;
            }

            const exifOrientation = getOrientation(imageData);
            const imageDataInUint8Array = new Uint8Array(imageData);
            const blob = new Blob([imageDataInUint8Array], {
	            type: 'image/jpeg'
	        });
            let link = window.URL.createObjectURL(blob);

            try {
                const result = await rotateImage(link, exifOrientation);
                debugLog(debugOn, 'Rotation done');
                imageDataInBinaryString = result.byteString;
                link = window.URL.createObjectURL(result.blob);

                img = new Image();
                img.src = link;

                img.onload = startUploadingAnImage;

            } catch(error) {
                debugLog(debugOn, 'rotateImage error:', error)
                reject(error);
            }

        });
    
        reader.readAsArrayBuffer(file);
    });
};

export const uploadImagesThunk = (data) => async (dispatch, getState) => {
    let state;
    state = getState();
    if(state.page.activity === "UploadingImages") {
        dispatch(addImages({files:data.files, where:data.where}));
        return;
    } 
    newActivity(dispatch, "UploadingImages",  async () => {
        dispatch(addImages({files:data.files, where:data.where}));
        state = getState().page;
        while(state.imageUploadQueue.length > state.imageUploadIndex){
            console.log("Uploading file: ", `index: ${state.imageUploadIndex} name: ${state.imageUploadQueue[state.imageUploadIndex].file.name}`)
            const file = state.imageUploadQueue[state.imageUploadIndex].file;
            await uploadAnImage(dispatch, state, file);
            dispatch(imageUploaded());
            state = getState().page;
        }
        state = getState().page;
        console.log(state.imagePanels);
    });
}

/*export const addImagesAsyncThunk = (data) => async (dispatch, getState) => {
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
} */

export const pageReducer = pageSlice.reducer;

export default pageSlice;