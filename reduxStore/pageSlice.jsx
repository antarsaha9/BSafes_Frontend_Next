import { createSlice} from '@reduxjs/toolkit';
const forge = require('node-forge');
const DOMPurify = require('dompurify');
const axios = require('axios');

import { convertBinaryStringToUint8Array, debugLog, PostCall, extractHTMLElementText, arraryBufferToStr } from '../lib/helper'
import { decryptBinaryString, encryptBinaryString, encryptLargeBinaryString, decryptLargeBinaryString, stringToEncryptedTokens } from '../lib/crypto';
import { createNewItemVersion } from '../lib/bSafesCommonUI';
import { downScaleImage, rotateImage } from '../lib/wnImage';

const debugOn = true;

const initialState = {
    activity: "Done",  //"Done", "Error", "Loading", "Saving", "UploadingImages"
    error: null,
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
            panel.img = action.payload.img;
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
            panel.img = action.payload.img;
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
    }
})

export const { activityChanged, dataFetched, newVersionCreated, addUploadImages, uploadingImage, imageUploaded, downloadingImage, imageDownloaded, setImageWordsMode} = pageSlice.actions;

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
        const startDownloadingImages = async () => {
            let state = getState().page; 
            const downloadAnImage = (image) => {
                const preImageS3Download = (s3Key) => {
                    return new Promise(async (resolve, reject) => {
                        PostCall({
                            api:'/memberAPI/preS3Download',
                            body: {
                                itemId: state.id,
                                s3Key
                            }
                        }).then( data => {
                            debugLog(debugOn, data);
                            if(data.status === 'ok') {                                  
                                const signedURL = data.signedURL;
                                resolve(signedURL);
                            } else {
                                debugLog(debugOn, "preS3Download failed: ", data.error);
                                reject(data.error);
                            }
                        }).catch( error => {
                            debugLog(debugOn, "preS3Download failed: ", error)
                            reject("preS3Download failed!");
                        })
                    });
                }
                const XHRDownload = (signedURL) => {
                    return new Promise( async (resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', signedURL, true);
                        xhr.responseType = 'arraybuffer';
              
                        xhr.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                let percentComplete = evt.loaded / evt.total * 90 + 10;
                                debugLog(debugOn, "Download progress: ", `${evt.loaded}/${evt.total} ${percentComplete} %`); 
                                dispatch(downloadingImage(percentComplete));
                            }
                        }, false);
              
                        xhr.onload = function(e) {
                            resolve(this.response)
                        };
              
                        xhr.send();
                    });
                }

                return new Promise(async (resolve, reject) => {
                    const s3Key = image.s3Key + "_gallery";
                    const keyVersion = s3Key.split(":")[1];
                    try {
                        dispatch(downloadingImage(5));
                        const signedURL = await preImageS3Download(s3Key);
                        dispatch(downloadingImage(5));
                        const response = await XHRDownload(signedURL)                          
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
                            type: 'image/jpeg'
                        });
                        const img = new Image();
                        img.src = link;
                        const imgLoaded = ()=> {
                            dispatch(imageDownloaded({img}));
                            resolve();
                        };

                        img.addEventListener('load', imgLoaded);    
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

        return new Promise(async (resolve, reject) => {
            PostCall({
                api:'/memberAPI/getPageItem',
                body: {itemId: data.itemId},
            }).then( result => {
                debugLog(debugOn, result);
                if(result.status === 'ok') {                                   
                    if(result.item) {
                        dispatch(dataFetched({item:result.item, expandedKey:data.expandedKey}));
                        resolve();
                        const state = getState().page;                        
                        if(state.imageDownloadQueue.length) {
                            startDownloadingImages();
                        }
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
                const usage = JSON.parse(data.usage);
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
            state = getState().page;
            try {
                titleText = extractHTMLElementText(title);
                encodedTitle = forge.util.encodeUtf8(title);
                encryptedTitle = encryptBinaryString(encodedTitle, state.itemKey);
                titleTokens = stringToEncryptedTokens(titleText, searchKey, searchIV);
            
                if (state.isBlankPageItem) {
                } else {
                    let itemCopy = {
                        ...state.itemCopy
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
            state = getState().page;
            const result = preProcessEditorContentBeforeSaving(content);
            const s3ObjectsInContent = result.s3ObjectsInContent;
	        const s3ObjectsSize = result.s3ObjectsSize;
            
            try {
                encodedContent = forge.util.encodeUtf8(content);
                encryptedContent = encryptBinaryString(encodedContent, state.itemKey);
            
                if (state.isBlankPageItem) {
                } else {
                    let itemCopy = {
                        ...state.itemCopy
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
                                    resolve({s3Key, size: totalUploadedSize, img, buffer});
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
/*
            const downloadFromS3 = (s3Key) => { 
                debugLog(debugOn, 'downloadFromS3');
                return new Promise( async (resolve, reject) => {
                    const preS3Download = () => {
                        return new Promise( async (resolve, reject) => {
                            PostCall({
                                api:'/memberAPI/preS3Download',
                                body: {
                                    itemId: state.id,
                                    s3Key
                                }
                            }).then( data => {
                                debugLog(debugOn, data);
                                if(data.status === 'ok') {                                                  
                                    resolve(data.signedURL);
                                } else {
                                    debugLog(debugOn, "preS3Download failed: ", data.error);
                                    reject(data.error);
                                }
                            }).catch( error => {
                                debugLog(debugOn, "preS3Download failed: ", error)
                                reject("preS3Download failed:!");
                            })
                        });
                    };
                   
                    const XHRDownload = (signedURL) => {
                        return new Promise( async (resolve, reject) => {
                            const xhr = new XMLHttpRequest();
                            xhr.open('GET', signedURL, true);
                            xhr.responseType = 'arraybuffer';
                  
                            xhr.addEventListener("progress", function(evt) {
                              if (evt.lengthComputable) {
                                let percentComplete = evt.loaded / evt.total * 100;
                                debugLog(debugOn, "Download progress: ", `${evt.loaded}/${evt.total} ${percentComplete} %`); 
                              }
                            }, false);
                  
                            xhr.onload = function(e) {
                                resolve(this.response)
                            };
                  
                            xhr.send();
                        });
                    }

                    try {
                        const signedDownloadURL = await preS3Download();

                        const response = await XHRDownload(signedDownloadURL, { responseType: 'arraybuffer' })
                          
                        debugLog(debugOn, "downloadFromS3 completed. Length: ", response.byteLength);
                        const buffer = Buffer.from(response, 'binary');
                        resolve({buffer});
                    } catch(error) {
                        debugLog(debugOn, 'downloadFromS3 error: ', error)
                        reject(error);
                    }
                });               
            }
*/
            const postS3Upload = () => {
                debugLog(debugOn, 'postS3Upload');
            };

            const encryptedImageDataInBinaryString = encryptLargeBinaryString(imageDataInBinaryString, state.itemKey);

            //const encrypted_buffer = Utf8ArrayToStr(encryptedImageDataInUint8Array, 1000);
            try {
                const uploadResult = await uploadImagesToS3(encryptedImageDataInBinaryString);
                resolve(uploadResult);
                /*
                const downloadResult = await downloadFromS3(uploadResult.s3Key);
                let compare = Buffer.compare(uploadResult.buffer, downloadResult.buffer);
                debugLog(debugOn, "Compare upload and download result: ", compare);
                const downloadedBinaryString = downloadResult.buffer.toString('binary');
                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                compare = downloadedBinaryString.localeCompare(encryptedImageDataInBinaryString);
                debugLog(debugOn, "Compare upload and download result in binary string: ", compare);
                const decryptedStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey)
                debugLog(debugOn, "Decrypted string length: ", decryptedStr.length);
                compare = decryptedStr.localeCompare(imageDataInBinaryString);
                debugLog(debugOn, "Compare original and decrypted result in binary string: ", compare);
                */
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
    let state;
    state = getState().page;
    if(state.activity === "UploadingImages") {
        dispatch(addUploadImages({files:data.files, where:data.where}));
        return;
    } 
    newActivity(dispatch, "UploadingImages",  async () => {
        dispatch(addUploadImages({files:data.files, where:data.where}));
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
        if (state.isBlankPageItem) {
        } else {
            let itemCopy = {
                ...state.itemCopy
            }

            itemCopy.images = images;
            itemCopy.update = "images";    
            await createNewItemVersionForPage(dispatch, itemCopy, {});

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
            
                if (state.isBlankPageItem) {
                } else {
                    itemCopy = JSON.parse(JSON.stringify(state.itemCopy));
                        
                    itemCopy.images[index].words = forge.util.encode64(encryptedContent);
                    itemCopy.update = "image words";
            
                    imagePanels = JSON.parse(JSON.stringify(state.imagePanels));
                    for(let i=0; i< imagePanels.length; i++) {
                        imagePanels[i].img = state.imagePanels[i].img;
                    }
                    imagePanels[index].words = content;
                    
                    await createNewItemVersionForPage(dispatch, itemCopy, {imagePanels});
                    resolve();
                }
            } catch (error) {
                reject();
            }

        });
    })
}

export const pageReducer = pageSlice.reducer;

export default pageSlice;