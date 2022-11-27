import { createSlice} from '@reduxjs/toolkit';
const forge = require('node-forge');
const DOMPurify = require('dompurify');
const axios = require('axios');

import { convertBinaryStringToUint8Array, debugLog, PostCall, extractHTMLElementText, arraryBufferToStr, decryptDecode1 } from '../lib/helper'
import { decryptBinaryString, encryptBinaryString, encryptLargeBinaryString, decryptLargeBinaryString, stringToEncryptedTokensCBC, tokenfieldToEncryptedArray, tokenfieldToEncryptedTokensCBC } from '../lib/crypto';
import { setupNewItemKey, createNewItemVersion, preS3Download, timeToString, formatTimeDisplay } from '../lib/bSafesCommonUI';
import { downScaleImage, rotateImage } from '../lib/wnImage';

const debugOn = true;

const initialState = {
    activity: "Done",  //"Done", "Error", "Loading", "Decrypting", "Saving", "UploadingImages", "LoadingVersionsHistory", "LoadingPageComments"
    error: null,
    itemCopy: null,
    id: null,
    space: null,
    container: null,
    pageNumber: null,
    position: null,
    itemKey: null,
    itemIV: null,
    tags: [],
    title: null,
    titleText: null,
    content:null,
    contentImagesDownloadQueue: [],
    contentImagedDownloadIndex: 0,
    contentImagesDisplayIndex:0,
    contentVideosDownloadQueue:[],
    contentVideosDownloadIndex:0,
    contentVideosDisplayIndex:0,
    imagePanels:[],
    imageUploadQueue:[],
    imageUploadIndex:0,
    imageDownloadQueue:[],
    imageDownloadIndex:0,
    itemVersions:[],
    containerContents:{'20221127':{
        title:'test'
    }},
    newCommentEditorMode: 'ReadOnly',
    comments:[]
}

const dataFetchedFunc = (state, action) => {
    const item = action.payload.item;

    state.itemCopy = item;

    state.id = item.id;
    state.space = item.space;
    state.container = item.container;
    state.position = item.position;

}

function decryptPageItemFunc(state, workspaceKey) {
    const item = state.itemCopy;
    if ((item.keyEnvelope === undefined)) {      
        debugLog(debugOn, "Error: undefined item key");
        state.error = "Undefined item key";
    }
    if(item.envelopeIV && item.ivEnvelope && item.ivEnvelopeIV) { // legacy CBC-mode
        state.itemKey = decryptBinaryString(forge.util.decode64(item.keyEnvelope), expandedKey, forge.util.decode64(item.envelopeIV));
        state.itemIV = decryptBinaryString(forge.util.decode64(item.ivEnvelope), expandedKey, forge.util.decode64(item.ivEnvelopeIV));
    } else {
        const decoded = forge.util.decode64(item.keyEnvelope);
        state.itemKey = decryptBinaryString(decoded, workspaceKey);
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

            const tempElement = document.createElement("div");
            tempElement.innerHTML = content;
            const images = tempElement.querySelectorAll(".bSafesImage");

            images.forEach((item) => {
                const id = item.id;
                const idParts = id.split('&');
                const s3Key = idParts[0];
                
                state.contentImagesDownloadQueue.push({id, s3Key});
            });

        } catch (err) {
            state.error = err;
        }  	                            
    }

    if(item.images) {
        for(let i=0; i<item.images.length; i++) {
            let image = item.images[i];
            let encryptedWords,encodedWords, words;
            state.imageDownloadQueue.push({s3Key: image.s3Key});
            const queueId = 'd' + i;
            if(image.words && image.words !== "") {
                encryptedWords = forge.util.decode64(image.words);
                encodedWords = decryptBinaryString(encryptedWords, state.itemKey);
                words = forge.util.decodeUtf8(encodedWords);
                words = DOMPurify.sanitize(words);
            } else {
                words = "";
            }
            const newPanel = {
                queueId: queueId,
                s3Key: image.s3Key,
                size: image.size,
                status: "WaitingForDownload",
                words: words,
                progress: 0
            }
            state.imagePanels.push(newPanel);
        }            
    }
}

const pageSlice = createSlice({
    name: "page",
    initialState: initialState,
    reducers: {
        clearPage: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        dataFetched: (state, action) => {
            dataFetchedFunc(state, action);
        },
        containerDataFetched: (state, action) => {
            state.id = action.payload.itemId;
            if(state.id.startsWith('np')) {
                state.pageNumber = parseInt(state.id.split(':').pop())
            }
            state.space = action.payload.container.space;
            state.container = action.payload.container.id;
            state.title = "<h2></h2>";
        },
        decryptPageItem: (state, action) => {
            decryptPageItemFunc(state, action.payload.workspaceKey);
        },
        newItemKey: (state, action) => {
            state.itemKey = action.payload.itemKey;
        },
        newItemCreated: (state, action) => {
            const updatedKeys = Object.keys(action.payload);
            for(let i=0; i<updatedKeys.length; i++) {
                let key = updatedKeys[i];
                state[key] = action.payload[key];
            }
        },
        newVersionCreated: (state, action) => {
            const updatedKeys = Object.keys(action.payload);
            for(let i=0; i<updatedKeys.length; i++) {
                let key = updatedKeys[i];
                state[key] = action.payload[key];
            }
        },
        itemVersionsFetched: (state, action) => {
            state.itemVersions.push(...action.payload);
        },
        containerContentsFetched: (state, action) => {
            state.containerContents = action.payload;
        },
        downloadingContentImage: (state, action) => {
            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            image.status = "Downloading";
            image.progress = action.payload;
        },
        contentImageDownloaded: (state, action) => {
            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            image.status = "Downloaded";
            image.src = action.payload.link;
            state.contentImagedDownloadIndex += 1;
        },
        updateContentImagesDisplayIndex: (state, action) => {
            state.contentImagesDisplayIndex = action.payload;
        },
        downloadContentVideo: (state, action) => {
            state.contentVideosDownloadQueue.push(action.payload);
        },
        downloadingContentVideo: (state, action) => {
            const video = state.contentVideosDownloadQueue[state.contentVideosDownloadIndex];
            video.status = "Downloading";
            video.progress = action.payload;
        },
        contentVideoDownloaded: (state, action) => {
            const video = state.contentVideosDownloadQueue[state.contentVideosDownloadIndex];
            video.status = "Downloaded";
            video.src = action.payload.link;
            state.contentVideosDownloadIndex += 1;
        },
        updateContentVideosDisplayIndex: (state, action) => {
            state.contentVideosDisplayIndex = action.payload;
        },
        addUploadImages: (state, action) => {
            const files = action.payload.files;
            let newPanels = [];
            for(let i=0; i < files.length; i++) {
                const queueId = 'u' + state.imageUploadQueue.length;
                const newUpload = {file: files[i]};
                state.imageUploadQueue.push(newUpload);
                const newPanel = {
                    queueId: queueId,
                    status: "WaitingForUpload",
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
        uploadingImage: (state, action) => {
            let panel = state.imagePanels.find((item) => item.queueId === 'u'+state.imageUploadIndex);
            panel.status = "Uploading";
            panel.progress = action.payload;
        },
        imageUploaded: (state, action) => {
            let panel = state.imagePanels.find((item) => item.queueId === 'u'+state.imageUploadIndex);
            panel.status = "Uploaded";
            panel.progress = 100;
            panel.src = action.payload.link;
            panel.width = action.payload.width;
            panel.height = action.payload.height;
            panel.s3Key = action.payload.s3Key;
            panel.size = action.payload.size;
            panel.editorMode = "ReadOnly";
            panel.words="";
            state.imageUploadIndex += 1;
        },
        downloadingImage: (state, action) => {
            let panel = state.imagePanels.find((item) => item.queueId === 'd'+state.imageDownloadIndex);
            panel.status = "Downloading";
            panel.progress = action.payload;
        },
        imageDownloaded: (state, action) => {
            let panel = state.imagePanels.find((item) => item.queueId === 'd'+state.imageDownloadIndex);
            panel.status = "Downloaded";
            panel.progress = 100;
            panel.src = action.payload.link;
            panel.width = action.payload.width;
            panel.height = action.payload.height;
            panel.editorMode = "ReadOnly";
            state.imageDownloadIndex += 1;
        },
        setImageWordsMode: (state, action) => {
            let panel = state.imagePanels[action.payload.index];
            panel.editorMode = action.payload.mode;
        },
        readOnlyImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            panel.editorMode = "ReadOnly";
        },
        writingImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            panel.editorMode = "Writing";
        },
        saveImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            panel.editorMode = "Saving";
        },
        setCommentEditorMode: (state, action) => {
            if(action.payload.index === 'comment_New') {
                state.newCommentEditorMode = action.payload.mode;
            } else {

            }
        },
        pageCommentsFetched: (state, action) => {
            state.comments.push(...action.payload);
        },
        newCommentAdded: (state, action) => {
            state.comments.unshift(action.payload);
        },
        commentUpdated: (state, action) => {
            const comment = state.comments[action.payload.commentIndex];
            comment.content = action.payload.content;
            comment.lastUpdateTime = action.payload.lastUpdateTime;
        },
    }
})

export const { clearPage, activityChanged, dataFetched, decryptPageItem, containerDataFetched, newItemKey, newItemCreated, newVersionCreated, itemVersionsFetched, downloadingContentImage, contentImageDownloaded, updateContentImagesDisplayIndex, downloadContentVideo, downloadingContentVideo, contentVideoDownloaded, updateContentVideosDisplayIndex, addUploadImages, uploadingImage, imageUploaded, downloadingImage, imageDownloaded, setImageWordsMode, setCommentEditorMode, pageCommentsFetched, newCommentAdded, commentUpdated} = pageSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        dispatch(activityChanged("Error"));
    }
}


const XHRDownload = (dispatch, signedURL, downloadingFunction) => {
    return new Promise( async (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', signedURL, true);
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
                let percentComplete = evt.loaded / evt.total * 90 + 10;
                debugLog(debugOn, "Download progress: ", `${evt.loaded}/${evt.total} ${percentComplete} %`); 
                dispatch(downloadingFunction(percentComplete));
            }
        }, false);

        xhr.onload = function(e) {
            resolve(this.response)
        };

        xhr.send();
    });
}
export const getContainerContentsThunk = (data)=> async(dispatch, getState)=>{
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let state;
            PostCall({
                api:'/memberAPI/getContainerContents',
                body: data,
            }).then( async result => {
                debugLog(debugOn, result);
                state = getState().page;
                if (result.status === 'ok') {
                    if (result.hits) {
                        const hits = result.hits.hits;
                        const modifiedHits = hits.reduce((previous, hit) => {
                            const updatedTime = formatTimeDisplay(hit._source.createdTime);
                            const payload = {
                                id: hit._id,
                                position: hit._source.position,
                                pageNumber: hit._source.pageNumber,
                                title: decryptDecode1(hit._source.title, state.itemKey, state.itemIV),
                            }
                            return {...previous, [pageNumber.toString()]:payload};
                        }, {});
                        dispatch(containerContentsFetched(modifiedHits));

                    } else {
                        reject("woo... failed to get a item version history!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a item version history!", data.error);
                    reject("woo... failed to get a item version history!");
                }
            }).catch( error => {
                debugLog(debugOn, "woo... failed to get a page item.")
                reject("woo... failed to get a page item!");
            })
        }); 
    })  
}

export const getPageItemThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        
        const getContainerData = (itemId) => {
            return new Promise(async (resolve, reject) => {
                let itemIdParts, containerId;
                itemIdParts = itemId.split(':');
                itemIdParts.pop();
                containerId = itemIdParts.join(':');
                containerId = containerId.replace('p:', ':');
                PostCall({
                    api:'/memberAPI/getPageItem',
                    body: {itemId: containerId},
                }).then( result => {
                    debugLog(debugOn, result);
                    if(result.status === 'ok') {    
                        if(result.item) {
                            resolve(result.item);
                        } else {
                            debugLog(debugOn, "woo... failed to get the container data!", data.error);
                            reject("woo... failed to get the container data!");
                        }
                    } else {
                        debugLog(debugOn, "woo... failed to get the container data!", data.error);
                        reject("woo... failed to get the container data!");
                    }
                });
            });
        }
        
        return new Promise(async (resolve, reject) => {
            let state;
            PostCall({
                api:'/memberAPI/getPageItem',
                body: {itemId: data.itemId},
            }).then( async result => {
                debugLog(debugOn, result);
                state = getState().page;
                if(result.status === 'ok') {                                   
                    if(result.item) {
                        dispatch(dataFetched({item:result.item}));
                        resolve();
                    } else {
                        if(data.itemId.startsWith('np') || data.itemId.startsWith('dp')) {
                            try {
                                const container = await getContainerData(data.itemId);
                                dispatch(containerDataFetched({itemId: data.itemId, container}));
                                resolve();
                            } catch(error) {
                                reject("woo... failed to get the container data!");
                            }
                        } else {
                            reject("woo... failed to get a page item!");
                        }
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

export const decryptPageItemThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Decrypting", () => {
        const startDownloadingContentImages = async () => {
        let state = getState().page; 
        const downloadAnImage = (image) => {

            return new Promise(async (resolve, reject) => {
                const s3Key = image.s3Key;
                const keyVersion = s3Key.split(":")[1];
                try {
                    dispatch(downloadingContentImage(5));    
                    const signedURL = await preS3Download(state.id, s3Key);
                    dispatch(downloadingContentImage(5));

                    const response = await XHRDownload(dispatch, signedURL, downloadingContentImage);                          
                    debugLog(debugOn, "downloadAnImage completed. Length: ", response.byteLength);
                    
                    let decryptedImageStr
                    if(keyVersion === '3') {
                        const buffer = Buffer.from(response, 'binary');
                        const downloadedBinaryString = buffer.toString('binary');
                        debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);    
                        decryptedImageStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey)
                        debugLog(debugOn, "Decrypted image string length: ", decryptedImageStr.length);
            
                    } else if(keyVersion === '1') {

                    }
                    const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decryptedImageStr);
                    const link = window.URL.createObjectURL(new Blob([decryptedImageDataInUint8Array]), {
                        type: 'image/*'
                    });
                                          
                    dispatch(contentImageDownloaded({link}));
                    resolve();
                                               
                } catch(error) {
                    debugLog(debugOn, 'downloadFromS3 error: ', error)
                    reject(error);
                }
            });
        }
        while(state.contentImagedDownloadIndex < state.contentImagesDownloadQueue.length) {
            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            await downloadAnImage(image); 
            
            state = getState().page; 
        }
        }

        const startDownloadingImages = async () => {
        let state = getState().page; 
        const downloadAnImage = (image) => {

            return new Promise(async (resolve, reject) => {
                const s3Key = image.s3Key + "_gallery";
                const keyVersion = s3Key.split(":")[1];
                try {
                    dispatch(downloadingImage(5));
                    const signedURL = await preS3Download(state.id, s3Key);
                    dispatch(downloadingImage(10));
                    const response = await XHRDownload(dispatch, signedURL, downloadingImage);                          
                    debugLog(debugOn, "downloadAnImage completed. Length: ", response.byteLength);
                    
                    let decryptedImageStr
                    if(keyVersion === '3') {
                        const buffer = Buffer.from(response, 'binary');
                        const downloadedBinaryString = buffer.toString('binary');
                        debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);    
                        decryptedImageStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey)
                        debugLog(debugOn, "Decrypted image string length: ", decryptedImageStr.length);
            
                    } else if(keyVersion === '1') {

                    }
                    const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decryptedImageStr);
                    const link = window.URL.createObjectURL(new Blob([decryptedImageDataInUint8Array]), {
                        type: 'image/*'
                    });
                    
                    let img = new Image();
                    img.src = link;
    
                    img.onload = () => {
                        dispatch(imageDownloaded({link, width:img.width, height:img.height}));
                        resolve();
                    }
                    

                } catch(error) {
                    debugLog(debugOn, 'downloadFromS3 error: ', error)
                    reject(error);
                }
            });
        }

        while(state.imageDownloadIndex < state.imageDownloadQueue.length) {
            const image = state.imageDownloadQueue[state.imageDownloadIndex];
            await downloadAnImage(image); 
            
            state = getState().page; 
        }
        };

        return new Promise(async (resolve) => {
            dispatch(decryptPageItem({workspaceKey: data.workspaceKey}));
            const state = getState().page;    
            if(state.contentImagesDownloadQueue.length) {
                startDownloadingContentImages();
            }                    
            if(state.imageDownloadQueue.length) {
                startDownloadingImages();
            }
            resolve();
        });
    });
}

export const getItemVersionsHistoryThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "LoadingVersionsHistory", () => {
        return new Promise(async (resolve, reject) => {
            const state = getState().page;
            PostCall({
                api: '/memberAPI/getItemVersionsHistory',
                body: {
                    itemId: state.id,
                    size: 20,
                    from: 0,
                },
            }).then(result => {
                debugLog(debugOn, result);
                if (result.status === 'ok') {
                    if (result.hits) {
                        const hits = result.hits.hits;
                        const modifiedHits = hits.map(hit => {
                            const updatedTime = formatTimeDisplay(hit._source.createdTime);
                            const payload = {
                                id: hit._source.version,
                                version: hit._source.version,
                                updatedText: hit._source.version === 1 ? "Creation" : "Updated " + hit._source.update,
                                updatedBy: DOMPurify.sanitize(hit._source.displayName ? hit._source.displayName : hit._source.updatedBy),
                                updatedTime,
                                updatedTimeStamp: updatedTime.charAt(updatedTime.length - 1) === 'o' ? timeToString(hit._source.createdTime) : ''

                            }
                            return payload;
                        });
                        dispatch(itemVersionsFetched(modifiedHits));

                    } else {
                        reject("woo... failed to get a item version history!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a item version history!", data.error);
                    reject("woo... failed to get a item version history!");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... failed to get a item version history.", error)
                reject("woo... failed to get a item version history!");
            })
        });
    });
}

export const downloadContentVideoThunk = (data) => async (dispatch, getState) => {
    let video;
    let state = getState().page;
    if(state.contentVideosDownloadIndex < state.contentVideosDownloadQueue.length) {
        dispatch(downloadContentVideo(data));
        return;
    }

    const downloadAVideo = (video) => {
        let decryptedVideoStr, link;
        return new Promise(async (resolve, reject) => {
            const s3Key = video.s3Key;
            const keyVersion = s3Key.split(":")[1];
            try {
                dispatch(downloadingContentVideo(5));
                const signedURL = await preS3Download(state.id, s3Key);
                dispatch(downloadingContentVideo(10));
                const response = await XHRDownload(dispatch, signedURL, downloadingContentVideo)                          
                debugLog(debugOn, "downloadAVideo completed. Length: ", response.byteLength);
                
                if(keyVersion === '3') {
                    const buffer = Buffer.from(response, 'binary');
                    const downloadedBinaryString = buffer.toString('binary');
                    debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);    
                    decryptedVideoStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey)
                    debugLog(debugOn, "Decrypted image string length: ", decryptedVideoStr.length);
        
                } else if(keyVersion === '1') {

                }
                
                const decryptedVideoDataInUint8Array = convertBinaryStringToUint8Array(decryptedVideoStr);
                const link = window.URL.createObjectURL(new Blob([decryptedVideoDataInUint8Array]), {
                    type: 'video/*'
                });

                dispatch(contentVideoDownloaded({link}));
                resolve();

            } catch(error) {
                debugLog(debugOn, 'downloadFromS3 error: ', error)
                reject(error);
            }
        });
    }

    return new Promise(async (resolve, reject) => {
        dispatch(downloadContentVideo(data));
        state = getState().page;
        while(state.contentVideosDownloadIndex < state.contentVideosDownloadQueue.length) {
            video = state.contentVideosDownloadQueue[state.contentVideosDownloadIndex];
            await downloadAVideo(video);
            state = getState().page;
        }
        resolve();
    });
}

function createNewItemVersionForPage(itemCopy) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await createNewItemVersion(itemCopy);
            if (data.status === 'ok') {
                const usage = JSON.parse(data.usage);
                itemCopy.usage = usage;

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

function createANotebookPage(data) {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api:'/memberAPI/createANotebookPage',
            body: data
        }).then( result => {
            debugLog(debugOn, result);

            if(result.status === 'ok') {    
                if(result.item) {
                    resolve(result.item);
                } else {
                    debugLog(debugOn, "woo... failed to create a notebook page!", data.error);
                    reject("woo... failed to create a notebook page!");
                }
            } else {
                debugLog(debugOn, "woo... failed to create a notebook page!", data.error);
                reject("woo... failed to create a notebook page!");
            }
        });
    });
}

function createANewPage(dispatch, state, newPageData, updatedState) {
    return new Promise(async (resolve, reject) => {
        let item;
        if (state.container.substring(0, 1) === 'f') {

        } else if (state.container.substring(0, 1) === 'n') {

            try {
                item = await createANotebookPage(newPageData);
                dispatch(newItemCreated({
                    ...updatedState,
                    itemCopy: item
                }));
                resolve();
            } catch (error) {
                debugLog(debugOn, "createANotebookPage failed: ", error);
                reject(error);
            }
        } else if (state.container.substring(0, 1) === 'd') {
                        
        }
    });
}

export const saveTagsThunk = (tags, workspaceKey, searchKey, searchIV) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, encryptedTags, tagsTokens, itemKey, keyEnvelope, newPageData, updatedState;
            state = getState().page;
            try {
                       
	            tagsTokens = tokenfieldToEncryptedTokensCBC(tags, searchKey, searchIV);
            
                if (!state.itemCopy) {
                    try {
                        itemKey = setupNewItemKey();
                        keyEnvelope = encryptBinaryString(itemKey, workspaceKey);
                    
                        encryptedTags = tokenfieldToEncryptedArray(tags, itemKey);
                        encryptedTags.push('null');  

                        newPageData = {
                            "itemId": state.id,
                            "keyEnvelope": forge.util.encode64(keyEnvelope),
                            "tags": JSON.stringify(encryptedTags),
                            "tagsTokens": JSON.stringify(tagsTokens)
                        };

                        updatedState = {
                            itemKey,
                            tags
                        }

                        await createANewPage(dispatch, state, newPageData, updatedState);
                        resolve();
                    } catch(error) {
                        reject(error);
                    }       

                } else {
                    encryptedTags = tokenfieldToEncryptedArray(tags, state.itemKey);
                    encryptedTags.push('null');  

                    let itemCopy = {
                        ...state.itemCopy
                    }
        
                    itemCopy.tags = encryptedTags;
                    itemCopy.tagsTokens = tagsTokens;
                    itemCopy.update = "tags";
            
                    await createNewItemVersionForPage(itemCopy);
                    dispatch(newVersionCreated({
                        itemCopy,
                        tags
                    }));
                    resolve();
                }
            } catch (error) {
                reject();
            }
        });
    })
}

export const saveTitleThunk = (title, workspaceKey, searchKey, searchIV) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, titleText, encodedTitle, encryptedTitle, titleTokens, itemKey, keyEnvelope, newPageData, updatedState;
            state = getState().page;
            try {
                titleText = extractHTMLElementText(title);
                encodedTitle = forge.util.encodeUtf8(title);
                titleTokens = stringToEncryptedTokensCBC(titleText, searchKey, searchIV);
            
                if (!state.itemCopy) {
                    try {
                        itemKey = setupNewItemKey();
                        keyEnvelope = encryptBinaryString(itemKey, workspaceKey);

                        encryptedTitle = encryptBinaryString(encodedTitle, itemKey);

                        newPageData = {
                            "itemId": state.id,
                            "keyEnvelope": forge.util.encode64(keyEnvelope),
                            "title": forge.util.encode64(encryptedTitle),
                            "titleTokens": JSON.stringify(titleTokens)
                        };

                        updatedState = {
                            itemKey, 
                            title,
                            titleText
                        }

                        await createANewPage(dispatch, state, newPageData, updatedState);
                        resolve();
                    } catch(error) {
                        reject(error);
                    }   
                } else {
                    encryptedTitle = encryptBinaryString(encodedTitle, state.itemKey);

                    let itemCopy = {
                        ...state.itemCopy
                    }
        
                    itemCopy.title = forge.util.encode64(encryptedTitle);
                    itemCopy.titleTokens = titleTokens;
                    itemCopy.update = "title";
            
                    await createNewItemVersionForPage(itemCopy);
                    dispatch(newVersionCreated({
                        itemCopy,
                        title,
                        titleText
                    }));
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
        const video = item.getElementsByTagName('video')[0];

        video.classList.remove('fr-draggable');
        const videoId = video.id;
        const videoStyle = video.style;
        const videoImg = document.createElement('img');
        videoImg.classList.add('bSafesDownloadVideo');
        if(item.classList.contains('fr-dvb')) videoImg.classList.add('fr-dib');
        if(item.classList.contains('fr-dvi')) videoImg.classList.add('fr-dii');
	    if(item.classList.contains('fr-fvl')) videoImg.classList.add('fr-fil');
	    if(item.classList.contains('fr-fvc')) videoImg.classList.add('fr-fic');
	    if(item.classList.contains('fr-fvr')) videoImg.classList.add('fr-fir');
    
        videoImg.id = videoId;
        videoImg.style = videoStyle;
        const placeholder = 'https://via.placeholder.com/' + `320x200`;
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

export const saveContentThunk = (content, workspaceKey) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, encodedContent, encryptedContent, itemKey, keyEnvelope, newPageData, updatedState;
            state = getState().page;
            const result = preProcessEditorContentBeforeSaving(content);
            const s3ObjectsInContent = result.s3ObjectsInContent;
	        const s3ObjectsSize = result.s3ObjectsSize;
            
            try {
                encodedContent = forge.util.encodeUtf8(result.content);
            
                if (!state.itemCopy) {
                    try {
                        itemKey = setupNewItemKey();
                        keyEnvelope = encryptBinaryString(itemKey, workspaceKey);

                        encryptedContent = encryptBinaryString(encodedContent, itemKey);

                        newPageData = {
                            "itemId": state.id,
                            "keyEnvelope": forge.util.encode64(keyEnvelope),
                            "content":  forge.util.encode64(encryptedContent),
                            "s3ObjectsInContent": JSON.stringify(s3ObjectsInContent),
                            "s3ObjectsSizeInContent": s3ObjectsSize
                        };
                        
                        updatedState = {
                            itemKey, 
                            content
                        }

                        await createANewPage(dispatch, state, newPageData, updatedState);
                        resolve();
                    } catch(error) {
                        reject(error);
                    }   
                } else {
                    encryptedContent = encryptBinaryString(encodedContent, state.itemKey);
                    let itemCopy = {
                        ...state.itemCopy
                    }
        
                    itemCopy.content = forge.util.encode64(encryptedContent);
                    itemCopy.s3ObjectsInContent = s3ObjectsInContent;
	                itemCopy.s3ObjectsSizeInContent = s3ObjectsSize;
                    itemCopy.update = "content";
            
                    await createNewItemVersionForPage(itemCopy);
                    dispatch(newVersionCreated({
                        itemCopy,
                        content
                    }));
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
    let exifOrientation;
    let imageDataInBinaryString;
    let totalUploadedSize = 0; 

    const downscaleImgAndEncryptInUint8Array = (size) => {
        return new Promise( async (resolve, reject) => {
            try {
                const originalStr = await downScaleImage(img, exifOrientation, size);
                const encryptedStr = encryptLargeBinaryString(originalStr, state.itemKey);
                resolve(encryptedStr);
            } catch(error) {
                debugLog(debugOn, "_downScaleImage failed: ", error);
                reject(error);
            }                   
        });
    };

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        const startUploadingAnImage = async ()=> {
            debugLog(debugOn, 'startUploadingAnImage');

            let uploadOriginalImgPromise = null, uploadGalleryImgPromise = null, uploadThumbnailImgPromise = null;

            const uploadImagesToS3 = (data) => {
                let s3Key, signedURL, signedGalleryURL, signedThumbnailURL; 
                let uploadingSubImages = false;
                debugLog(debugOn, 'uploadImagesToS3')
                return new Promise( async (resolve, reject) => {
                    const preImagesS3Upload = () => {
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
                        await preImagesS3Upload();
                        dispatch(uploadingImage(5));
                        totalUploadedSize += data.length;
                        const galleryImgString = await downscaleImgAndEncryptInUint8Array(720);
                        totalUploadedSize += galleryImgString.length;
                        debugLog(debugOn, "galleryString length: ", galleryImgString.length);
                        dispatch(uploadingImage(20));
                        const thumbnailImgString = await downscaleImgAndEncryptInUint8Array(120);
                        totalUploadedSize += thumbnailImgString.length;
                        debugLog(debugOn, "thumbnailImgString length: ", thumbnailImgString.length);
                        dispatch(uploadingImage(30));
                        const buffer = Buffer.from(data, 'binary');
                        const config = {
                            onUploadProgress: async (progressEvent) => {
                                let percentCompleted = 30 + Math.ceil(progressEvent.loaded*70/progressEvent.total);
                                dispatch(uploadingImage(percentCompleted));
                                debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                                if(!uploadingSubImages) {
                                    uploadingSubImages = true;
                                    
                                    uploadGalleryImgPromise = axios.put(
                                        signedGalleryURL,
                                        Buffer.from(galleryImgString, 'binary'), 
                                        {
                                            headers: {
                                                'Content-Type': 'binary/octet-stream'
                                            }
                                        }
                                    );
                                    uploadThumbnailImgPromise = axios.put(
                                        signedThumbnailURL,
                                        Buffer.from(thumbnailImgString, 'binary'), 
                                        {
                                            headers: {
                                                'Content-Type': 'binary/octet-stream'
                                            }
                                        }
                                    );
                                    
                                    const uploadResult = await Promise.all([uploadOriginalImgPromise, uploadGalleryImgPromise, uploadThumbnailImgPromise]);
                                    debugLog(debugOn, "Upload original image result: ", uploadResult[0]);
                                    debugLog(debugOn, "Upload gallery image result: ", uploadResult[1]);
                                    debugLog(debugOn, "Upload thumbnail image result: ", uploadResult[2]);
                                    resolve({s3Key, size: totalUploadedSize, link:img.src, width:img.width, height:img.height, buffer});
                                }
                            },
                            headers: {
                                'Content-Type': 'binary/octet-stream'
                            }
                        }
                        uploadOriginalImgPromise = axios.put(signedURL,
                            Buffer.from(data, 'binary'), config);                      
            
                    } catch(error) {
                        debugLog(debugOn, 'uploadImagesToS3 error: ', error)
                        reject(error);
                    }
                });
            };

            const postS3Upload = () => {
                debugLog(debugOn, 'postS3Upload');
            };

            const encryptedImageDataInBinaryString = encryptLargeBinaryString(imageDataInBinaryString, state.itemKey);

            try {
                const uploadResult = await uploadImagesToS3(encryptedImageDataInBinaryString);
                resolve(uploadResult);

            } catch(error) {
                debugLog(debugOn, 'uploadImagesToS3 error: ', error);
                reject(error);
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

            exifOrientation = getOrientation(imageData);
            const imageDataInUint8Array = new Uint8Array(imageData);
            const blob = new Blob([imageDataInUint8Array], {
	            type: 'image/*'
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
    let state, workspaceKey, itemKey, keyEnvelope, newPageData, updatedState;;
    state = getState().page;
    workspaceKey = data.workspaceKey;
    
    if(state.activity === "UploadingImages") {
        dispatch(addUploadImages({files:data.files, where:data.where}));
        return;
    } 
    newActivity(dispatch, "UploadingImages",  async () => {
        dispatch(addUploadImages({files:data.files, where:data.where}));
        state = getState().page;
        if(!state.itemCopy) {
            itemKey = setupNewItemKey();
            dispatch(newItemKey({itemKey}));
        }
        state = getState().page;
        while(state.imageUploadQueue.length > state.imageUploadIndex){
            console.log("======================= Uploading file: ", `index: ${state.imageUploadIndex} name: ${state.imageUploadQueue[state.imageUploadIndex].file.name}`)
            const file = state.imageUploadQueue[state.imageUploadIndex].file;
            const uploadResult = await uploadAnImage(dispatch, state, file);
            dispatch(imageUploaded(uploadResult));
            state = getState().page;
        }
        state = getState().page;
        console.log(state.imagePanels);
        const images = [];
        for(let i=0; i<state.imagePanels.length; i++) {
            let image = {s3Key: state.imagePanels[i].s3Key, size: state.imagePanels[i].size};
            images.push(image);
        }
        if (!state.itemCopy) {
            try {
                
                keyEnvelope = encryptBinaryString(state.itemKey, workspaceKey);

                newPageData = {
                    "itemId": state.id,
                    "keyEnvelope": forge.util.encode64(keyEnvelope),
                    "images":  JSON.stringify(images),
                };
                
                updatedState = {
                    itemKey
                }

                await createANewPage(dispatch, state, newPageData, updatedState);
                resolve();
            } catch(error) {
                reject(error);
            } 
        } else {
            let itemCopy = {
                ...state.itemCopy
            }

            itemCopy.images = images;
            itemCopy.update = "images";    
            await createNewItemVersionForPage(itemCopy);
            dispatch(newVersionCreated({
                itemCopy
            }));

        }
    });
}

export const saveImageWordsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, encodedContent, encryptedContent, itemCopy, imagePanels;
            const content = data.content;
            const index = data.index;
            state = getState().page;
            
            try {
                
                encodedContent = forge.util.encodeUtf8(content);
                encryptedContent = encryptBinaryString(encodedContent, state.itemKey);
            
                if (!state.itemCopy) {
                } else {
                    itemCopy = JSON.parse(JSON.stringify(state.itemCopy));
                        
                    itemCopy.images[index].words = forge.util.encode64(encryptedContent);
                    itemCopy.update = "image words";
            
                    imagePanels = JSON.parse(JSON.stringify(state.imagePanels));
                    for(let i=0; i< imagePanels.length; i++) {
                        imagePanels[i].img = state.imagePanels[i].img;
                    }
                    imagePanels[index].words = content;
                    
                    await createNewItemVersionForPage(itemCopy);
                    dispatch(newVersionCreated({
                        itemCopy,
                        imagePanels
                    }));
                    resolve();
                }
            } catch (error) {
                reject();
            }

        });
    })
}

export const getPageCommentsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "LoadingPageComments", () => {
        let state, yourName, hits, comments,content, encryptedContent, binaryContent, encodedContent, payload ;
        return new Promise(async (resolve, reject) => {
            state = getState().page;
            
            PostCall({
                api: '/memberAPI/getPageComments',
                body: {
                    itemId: data.itemId,
                    size: 10,
                    from: 0,
                },
            }).then(result => {
                debugLog(debugOn, result);
                if (result.status === 'ok') {
                    if (result.hits) {
                        
                        hits = result.hits.hits;
                        yourName = getState().auth.displayName;
                        comments = hits.map(({ _source: comment, _id: id }) => {
                            try {
                                encryptedContent = comment.content;
                                content = '';
                                if(encryptedContent) {
                                    binaryContent = forge.util.decode64(encryptedContent);
                                    encodedContent = decryptBinaryString(binaryContent, state.itemKey);
                                    content = forge.util.decodeUtf8(encodedContent);
                                    content = DOMPurify.sanitize(content);
                                }
                                payload = {
                                    id,
                                    commentId: comment.commendId,
                                    creationTime: comment.creationTime,
                                    lastUpdateTime: comment.lastUpdateTime,
                                    writerName: (comment.writerName === yourName)?'You':comment.writerName,
                                    content
                                }
                                return payload;
                                
                            } catch (error) {
                                console.trace(error);
                                return {}
                            }
                        });
                        dispatch(pageCommentsFetched(comments));
                        resolve();
                    } else {
                        reject("woo... failed to get a page comments!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a page comments!", data.error);
                    reject("woo... failed to get a page comments!");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... failed to get a page comments.", error)
                reject("woo... failed to get a page comments!");
            }) 
        });
    });
}


export const saveCommentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Saving", () => {
        return new Promise(async (resolve, reject) => {
            let state, content, encodedComment, encryptedComment, itemId, commentIndex, commentId;
            state = getState().page;
            try {     
                if (!state.itemCopy) {
                } else {
                    content = preProcessEditorContentBeforeSaving(data.content).content;
                    encodedComment = forge.util.encodeUtf8(result);
                    encryptedComment = forge.util.encode64(encryptBinaryString(encodedComment, state.itemKey));

                    itemId = state.id;

                    if(data.index === 'comment_New') {
                        PostCall({
                            api: '/memberAPI/saveNewPageComment',
                            body: {
                                itemId,
                                content: encryptedComment,
                            }
                        }).then(function (data) {
                            if (data.status === 'ok') {
                                const payload = {
                                    id: data.id,
                                    commendId: data.commendId,
                                    creationTime: data.creationTime,
                                    lastUpdateTime: data.lastUpdateTime,
                                    writerName: 'You',
                                    content
                                }
                                dispatch(newCommentAdded(payload));
                                resolve();
                            } else {
                                reject();
                            }
                        })
                    } else {
                        commentIndex = parseInt(data.index.split('_')[1]);
                        commentId = state.comments[commentIndex].commentId;

                        PostCall({
                            api: '/memberAPI/updatePageComment',
                            body: {
                                itemId,
                                commentId: commentId,
                                content: encryptedComment,
                            }
                        }).then(function (data) {
                            if (data.status === 'ok') {                               
                                dispatch(commentUpdated({commentIndex, content, lastUpdateTime: data.lastUpdateTime}));
                                resolve();
                            } else {
                                reject();
                            }
                        })
                    }
                }
            } catch (error) {
                reject();
            }

        });
    })
}


export const pageReducer = pageSlice.reducer;

export default pageSlice;