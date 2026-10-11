import { createSlice } from '@reduxjs/toolkit';
import { parseString } from 'xml2js';
const forge = require('node-forge');

import { debugLog, PostCall, sleep } from '../lib/helper';
import { localBackupActivity } from '../lib/activities';
import { putS3Object, getS3Object } from '../lib/s3Helper';
import { decryptBinaryString } from '../lib/crypto';
import { getEditorConfig } from '../lib/bSafesCommonUI';

import { pageLoaded, setListingDone, setListingItems, setMode, } from './containerSlice';

const debugOn = true;
const ITEM_VERSIONS_BACKUP_FEATURE = true;

const initialState = {
    activity: 0,
    activityErrors: 0,
    activityErrorCodes: {},
    error: null,
    signedUrlForBackup: null,
    newLocalItemUpdated: false,
    lastUpdatedTime: 0,
    statusBarMessage: "",
    updatingBackup: false,
}

const localBackupSlice = createSlice({
    name: 'localBackup',
    initialState,
    reducers: {
        resetLocalBackupActivity: (state, action) => {
            state.activity = 0;
            state.activityErrors = 0;
            state.activityErrorCodes = {};
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorCodes[action.payload] = '';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorCodes[action.payload.type] = action.payload.error;
        },
        setSignedUrlForBackup: (state, action) => {
            if (!ITEM_VERSIONS_BACKUP_FEATURE) return;
            if (action.payload !== null) {
                const signedUrlForBackup = action.payload;
                signedUrlForBackup.expiration = Date.now() + (signedUrlForBackup.expiresIn - 600) * 1000;
                state.signedUrlForBackup = signedUrlForBackup;
            } else {
                state.signedUrlForBackup = null;
            }
        },
        setNewLocalItemUpdated: (state, action) => {
            state.newLocalItemUpdated = action.payload;
        },
        setLastUpdatedTime: (state, action) => {
            state.lastUpdatedTime = action.payload;
        },
        setStatusBarMessage: (state, action) => {
            state.statusBarMessage = action.payload;
        },
        setStatusBarProgress: (state, action) => {
            state.statusBarMessage =  state.statusBarMessage.split("...")[0] + "... " + action.payload;
        },
        setUpdatingBackup: (state, action) => {
            state.updatingBackup = action.payload;
        }
    }
})


export const { resetAuthActivity, activityStart, activityDone, activityError, setSignedUrlForBackup, setNewLocalItemUpdated, setStatusBarMessage, setStatusBarProgress, setLastUpdatedTime, setUpdatingBackup } = localBackupSlice.actions;
export const localBackupReducer = localBackupSlice.reducer;
const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch (error) {
        dispatch(activityError({ type, error }));
    }
}

export const backupAnItemVersionToS3 = (item, dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!ITEM_VERSIONS_BACKUP_FEATURE) {
                resolve();
                return;
            }
            const localBackupState = getState().localBackup;
            let signedUrlForBackup = localBackupState.signedUrlForBackup;

            const s3Key = signedUrlForBackup.s3Key;
            const signedURL = signedUrlForBackup.url;

            const config = {
                onUploadProgress: async (progressEvent) => {
                    let percentCompleted = Math.ceil(progressEvent.loaded * 100 / progressEvent.total);
                    debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);

                },
                headers: {
                    'Content-Type': 'binary/octet-stream'
                }
            }
            dispatch(setSignedUrlForBackup(null));
            await putS3Object(s3Key, signedURL, JSON.stringify(item), config, dispatch);
            resolve();
        } catch (error) {
            debugLog(debugOn, "backupAnItemVersionToS3 failed: ", error);
            reject("backupAnItemVersionToS3 error.");
        }
    });
}
export const getBackupToken = (dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getBackupToken',
            body: {},
            dispatch
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                localStorage.setItem("backupToken", data.token);
                localStorage.setItem("registeredDataCenter", data.registeredDataCenter)
                resolve();
            } else {
                debugLog(debugOn, "woo... failed to get the backup token:", data.error);
                reject("Failed to get the backup token.");
            }
        }).catch(error => {
            debugLog(debugOn, "woo... ailed to get the backup token:", error);
            reject("Failed to get the backup token.");
        })
    });
}
export const getBackupDownloadSignedUrl = (s3Key, dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getDownloadSignedUrl',
            body: {
                s3Key
            },
            dispatch,
            tinybird: true
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve(data.signedUrl);
            } else {
                debugLog(debugOn, "woo... getBackupDownloadSignedUrl failed:", data.error);
                reject("Failed to get the itemVersions backup list.");
            }
        }).catch(error => {
            debugLog(debugOn, "woo... getBackupDownloadSignedUrl failed:", error);
            reject("Failed to get the backup signed url.");
        })
    });
}
export const getBackupDownloadSignedUrlsForKeys = (s3Keys, dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getDownloadSignedUrlsForKeys',
            body: {
                s3Keys
            },
            dispatch,
            tinybird: true
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve(data.signedUrls);
            } else {
                debugLog(debugOn, "woo... getBackupDownloadSignedUrlsForKeys failed:", data.error);
                reject("Failed to get the backup signed urls.");
            }
        }).catch(error => {
            debugLog(debugOn, "woo... getBackupDownloadSignedUrlsForKeys failed:", error);
            reject("Failed to get the backup signed urls.");
        })
    });
}
export const getBackupTokenThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, localBackupActivity.downloadItemVersionsBackup, () => {
        return new Promise(async (resolve, reject) => {
            try {
                if (localStorage.getItem("backupToken")) {
                    resolve();
                } else {
                    await getBackupToken(dispatch);
                    resolve();
                }
            } catch (error) {
                reject(error);
            }
        });
    })
}
export const updateLocalBackupThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, localBackupActivity.DownloadItemVersionsBackup, () => {
        return new Promise(async (resolve, reject) => {
            dispatch(setUpdatingBackup(true));
            if (!localStorage.getItem("backupToken")) {
                await getBackupToken(dispatch);
            }
            const updateItemKeys = () => {
                return new Promise(async (resolve, reject) => {
                    const getItemVersionsBackupList = (startAfter = 0, continuationToken = 0, maxKeys = 0) => {
                        return new Promise(async (resolve, reject) => {
                            try {
                                const memberId = getState().auth.memberId;
                                const currentKeyVersion = getState().auth.currentKeyVersion;
                                const dataCenter = localStorage.getItem("registeredDataCenter");
                                const body = {
                                    dataCenter,
                                    memberId,
                                    currentKeyVersion,
                                    startAfter,
                                    continuationToken,
                                    maxKeys
                                };

                                PostCall({
                                    api: '/memberAPI/getItemVersionsBackupList',
                                    body,
                                    dispatch,
                                    tinybird: true
                                }).then(data => {
                                    debugLog(debugOn, data);
                                    if (data.status === 'ok') {
                                        parseString(data.response, async (error, result) => {
                                            if (!error) {
                                                const listBucketResult = result.ListBucketResult;
                                                const itemList = {
                                                    numberOfItems: parseInt(listBucketResult.KeyCount[0]),
                                                }
                                                if (listBucketResult.KeyCount[0]) {
                                                    let items = [];
                                                    for (let i = 0; i < itemList.numberOfItems; i++) {
                                                        let theItem = listBucketResult.Contents[i].Key[0];
                                                        items.push(theItem);
                                                    }
                                                    itemList.items = items;
                                                    if (listBucketResult.IsTruncated[0] === "true") {
                                                        itemList.isTruncated = true;
                                                        itemList.continuationToken = listBucketResult.NextContinuationToken[0]
                                                    } else {
                                                        itemList.isTruncated = false;
                                                    }
                                                }
                                                resolve(itemList);
                                            } else {
                                                debugLog(debugOn, "woo... getItemVersionsBackupList failed:", data.error);
                                                reject("woo... getItemVersionsBackupList failed:", error)
                                            }
                                        })
                                    } else {
                                        debugLog(debugOn, "woo... getItemVersionsBackupList failed:", data.error);
                                        reject("Failed to get the itemVersions backup list.");
                                    }
                                }).catch(error => {
                                    debugLog(debugOn, "woo... getItemVersionsBackupList failed:", error);
                                    reject("Failed to get the itemVersions backup list.");
                                })
                            } catch (error) {
                                debugLog(debugOn, "getItemVersionsBackupList failed:", error)
                                reject(error);
                            }
                        });
                    }
                    try {
                        let continuationToken = 0;
                        let isTruncated = false;
                        const memberId = getState().auth.memberId;
                        const response = await window.desktopAPI.getLastItemKey(memberId);
                        let startAfter = 0;
                        if (response.key) {
                            startAfter = response.key;
                        }
                        let newKeysCount = 0;
                        do {
                            const result = await getItemVersionsBackupList(startAfter, continuationToken, 100);
                            if (result.numberOfItems) {
                                const memberId = getState().auth.memberId;
                                result.memberId = memberId;
                                const response = await window.desktopAPI.addItemKeys(result);
                                if (response.status === "ok") {
                                    newKeysCount += result.numberOfItems;
                                    dispatch(setStatusBarMessage(`Retrieving new item version keys. Found ${newKeysCount} keys so far...`));
                                }
                            }
                            startAfter = 0;
                            isTruncated = result.isTruncated;
                            if (isTruncated) continuationToken = result.continuationToken;
                        } while (isTruncated)
                        resolve();
                    } catch (error) {
                        debugLog(debugOn, "updateItemKeys failed: ", error);
                        reject(error);
                    }
                });
            }
            const downloadItemObjects = () => {
                return new Promise(async (resolve, reject) => {
                    try {
                        while (1) {
                            const memberId = getState().auth.memberId;
                            const response = await window.desktopAPI.getItemKeysForDownload(memberId);
                            if (response.keys && response.keys.length > 0) {
                                let keys = response.keys;
                                const dataCenter = localStorage.getItem("registeredDataCenter");
                                let s3Keys = [];
                                for (let i = 0; i < response.keys.length; i++) {
                                    let key = keys[i].key;
                                    let s3Key = `${dataCenter}:${key}`;
                                    s3Keys.push(s3Key);
                                }
                                const signedUrls = await getBackupDownloadSignedUrlsForKeys(s3Keys, dispatch);
                                for (let i = 0; i < signedUrls.length; i++) {
                                    let signedUrl = signedUrls[i];
                                    debugLog(debugOn, "signedUrl:", JSON.stringify(signedUrl));
                                    dispatch(setStatusBarMessage(`Downloading item version: ${s3Keys[i]}...`));
                                    const data = await getS3Object(signedUrl);
                                    const itemVersion = JSON.parse(data.binaryString);
                                    const result = await window.desktopAPI.addAnItemVersion(memberId, keys[i].key, itemVersion);
                                }
                            } else {
                                break;
                            }
                        }
                        resolve();
                    } catch (error) {
                        debugLog(debugOn, "downloadItemObjects failed: ", error);
                        reject(error);
                    }
                });
            }
            const downloadObjectsInItems = () => {
                return new Promise(async (resolve, reject) => {
                    const downloadAnObject = (s3Key) => {
                        return new Promise(async (resolve, reject) => {
                            const fsS3Key = s3Key.split('/').at(-1);
                            let response = await window.desktopAPI.isS3ObjectExisted(fsS3Key);
                            if (response.status === "ok") {
                                const profressCallback = (percent) => {
                                    dispatch(setStatusBarProgress(` ${percent.toFixed(2)}%`));
                                }
                                let downloadedBinaryString;
                                if (!response.existed) {
                                    const signedUrl = await getBackupDownloadSignedUrl(s3Key, dispatch);
                                    downloadedBinaryString = (await getS3Object(signedUrl, profressCallback)).binaryString;
                                    response = await window.desktopAPI.putS3Object(fsS3Key, downloadedBinaryString);
                                    if (response.status === "ok") {
                                        resolve({ status: "ok", downloadedBinaryString });
                                    } else {
                                        resolve(response);
                                        return;
                                    }
                                } else {
                                    console.log("The object already existed.s3Key: ", fsS3Key)
                                    response = await window.desktopAPI.getS3Object(fsS3Key);
                                    downloadedBinaryString = response.data;
                                    resolve({ status: "ok", downloadedBinaryString });
                                }
                            } else {
                                resolve(response);
                            }
                        });
                    }
                    const downloadContentObjects = (item) => {
                        return new Promise(async (resolve, reject) => {
                            const getItemKey = () => {
                                const getWorkspaceKey = (workspace) => {
                                    return new Promise(async (resolve, reject) => {
                                        if (workspace.substring(0, 1) === 'u') {
                                            const workspaceKey = getState().auth.expandedKey;
                                            resolve(workspaceKey);
                                        } else {
                                        }
                                    });
                                }
                                return new Promise(async (resolve, reject) => {
                                    let workspace = item.space;
                                    let workspaceKey = await getWorkspaceKey(workspace);
                                    let itemKey;
                                    const decoded = forge.util.decode64(item.keyEnvelope);
                                    itemKey = decryptBinaryString(decoded, workspaceKey);
                                    resolve(itemKey);
                                });
                            }
                            const content = item.content;
                            if (content.startsWith('s3Object/')) {
                                const downloadObjectsInContent = (content) => {
                                    return new Promise(async (resolve, reject) => {
                                        const tempElement = document.createElement("div");
                                        tempElement.innerHTML = content;
                                        let s3Objects = [];
                                        const images = tempElement.querySelectorAll(".bSafesImage");
                                        images.forEach((item) => {
                                            let id = item.id;
                                            let idParts = id.split('&');
                                            let s3Key = idParts[0];
                                            s3Objects.push(s3Key);
                                        });

                                        const videos = tempElement.querySelectorAll(".bSafesDownloadVideo");
                                        videos.forEach((item) => {
                                            let id = item.id;
                                            let idParts = id.split('&');
                                            if (idParts[0] === 'chunks') {
                                                let s3Key = idParts[3] + '_chunk_' + getEditorConfig().videoThumbnailIndex;
                                                s3Objects.push(s3Key);
                                                let chunks = parseInt(idParts[1]);
                                                for (let i = 0; i < chunks; i++) {
                                                    let s3Key = idParts[3] + '_chunk_' + i;
                                                    s3Objects.push(s3Key);
                                                }
                                            }
                                        });
                                        for (let i = 0; i < s3Objects.length; i++) {
                                            let s3Key = s3Objects[i];
                                            dispatch(setStatusBarMessage(`Downloading object in html content: ${s3Key}...`));
                                            let response = await downloadAnObject(s3Key);
                                            if (response.status !== "ok") {
                                                resolve(response);
                                                break;
                                            }
                                        }
                                        resolve({ status: "ok" });
                                    });
                                }
                                const s3Key = forge.util.decode64(content.substring(9));
                                dispatch(setStatusBarMessage(`Downloading html content object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                let result;
                                if (response.status === "ok") {
                                    const itemKey = await getItemKey();
                                    const downloadedBinaryString = response.downloadedBinaryString;
                                    const decryptedContent = decryptBinaryString(downloadedBinaryString, itemKey)
                                    debugLog(debugOn, "Decrypted string length: ", decryptedContent.length);
                                    const decodedContent = forge.util.decodeUtf8(decryptedContent);
                                    response = await downloadObjectsInContent(decodedContent);
                                    if (response.status === "ok") {
                                        result = { status: "ok" };
                                    } else {
                                        result = response;
                                    }
                                } else {
                                    result = response;
                                }
                                resolve(result);
                            } else if (item.content && item.content.startsWith('s3DrawingObject/')) {
                                const s3Key = forge.util.decode64(item.content.substring(16));
                                dispatch(setStatusBarMessage(`Downloading drawing content object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                let result;
                                if (response.status === "ok") {
                                    result = { status: "ok" };
                                } else {
                                    result = response;
                                }
                                resolve(result);
                            }
                        });
                    }
                    const downloadVideoObjects = (item) => {
                        return new Promise(async (resolve, reject) => {
                            const videos = item.videos;
                            let s3Objects = [];
                            for (let i = 0; i < videos.length; i++) {
                                let video = videos[i];
                                let s3Key = video.s3KeyPrefix + '_chunk_' + getEditorConfig().videoThumbnailIndex;
                                s3Objects.push(s3Key);
                                let chunks = video.numberOfChunks;
                                for (let i = 0; i < chunks; i++) {
                                    let s3Key = video.s3KeyPrefix + '_chunk_' + i;
                                    s3Objects.push(s3Key);
                                }
                            }
                            for (let i = 0; i < s3Objects.length; i++) {
                                let s3Key = s3Objects[i];
                                dispatch(setStatusBarMessage(`Downloading video object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                if (response.status !== "ok") {
                                    resolve(response);
                                    break;
                                }
                            }
                            resolve({ status: "ok" });
                        });
                    }
                    const downloadImageObjects = (item) => {
                        return new Promise(async (resolve, reject) => {
                            const images = item.images;
                            let s3Objects = [];
                            for (let i = 0; i < images.length; i++) {
                                let image = images[i];
                                let s3Key = image.s3Key;
                                s3Objects.push(s3Key);
                                s3Key = image.s3Key + "_gallery";
                                s3Objects.push(s3Key);
                            }
                            for (let i = 0; i < s3Objects.length; i++) {
                                let s3Key = s3Objects[i];
                                dispatch(setStatusBarMessage(`Downloading image object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                if (response.status !== "ok") {
                                    resolve(response);
                                    break;
                                }
                            }
                            resolve({ status: "ok" });
                        });
                    }
                    const downloadAudioObjects = (item) => {
                        return new Promise(async (resolve, reject) => {
                            const audios = item.audios;
                            let s3Objects = [];
                            for (let i = 0; i < audios.length; i++) {
                                let audio = audios[i];
                                let chunks = audio.numberOfChunks;
                                for (let i = 0; i < chunks; i++) {
                                    let s3Key = audio.s3KeyPrefix + '_chunk_' + i;
                                    s3Objects.push(s3Key);
                                }
                            }
                            for (let i = 0; i < s3Objects.length; i++) {
                                let s3Key = s3Objects[i];
                                dispatch(setStatusBarMessage(`Downloading audio object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                if (response.status !== "ok") {
                                    resolve(response);
                                    break;
                                }
                            }
                            resolve({ status: "ok" });
                        });
                    }
                    const downloadAttachmentObjects = (item) => {
                        return new Promise(async (resolve, reject) => {
                            const attachments = item.attachments;
                            let s3Objects = [];
                            for (let i = 1; i < attachments.length; i++) {
                                let attachment = attachments[i];
                                let chunks = attachment.numberOfChunks;
                                for (let i = 0; i < chunks; i++) {
                                    let s3Key = attachment.s3KeyPrefix + '_chunk_' + i;
                                    s3Objects.push(s3Key);
                                }
                            }
                            for (let i = 0; i < s3Objects.length; i++) {
                                let s3Key = s3Objects[i];
                                dispatch(setStatusBarMessage(`Downloading attachment object: ${s3Key}...`));
                                let response = await downloadAnObject(s3Key);
                                if (response.status !== "ok") {
                                    resolve(response);
                                    break;
                                }
                            }
                            resolve({ status: "ok" });
                        });
                    }

                    while (1) {
                        const workspace = getState().container.workspace;
                        let response = await window.desktopAPI.getAnItemForDownloadingObjects(workspace);
                        if (response.item) {
                            const item = response.item;
                            let finished = true;
                            if (item.content) {
                                response = await downloadContentObjects(item);
                                if (response.status !== "ok") {
                                    finished = false;
                                }
                            }
                            if (item.videos) {
                                response = await downloadVideoObjects(item)
                            }
                            if (item.images) {
                                response = await downloadImageObjects(item)
                            }
                            if (item.audios) {
                                response = await downloadAudioObjects(item)
                            }
                            if (item.attachments) {
                                response = await downloadAttachmentObjects(item)
                            }
                            if (finished) {
                                response = await window.desktopAPI.finishedDownloadingObjectsForAnItem(item.id, item.version);
                                if (response.status === "ok") {
                                    dispatch(setNewLocalItemUpdated(true));
                                }
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    resolve();
                });
            }
            try {
                await updateItemKeys();
                await downloadItemObjects();
                await downloadObjectsInItems();
                const lastUpdatedTime = Date.now();
                dispatch(setLastUpdatedTime(lastUpdatedTime));
                const authId = getState().auth.authId;
                await window.desktopAPI.updateMemberLastUpdatedTime(authId, lastUpdatedTime);
                dispatch(setStatusBarMessage("Your local backup was last updated: " + new Date(lastUpdatedTime).toLocaleString()));
                dispatch(setUpdatingBackup(false));
                resolve();
            } catch (error) {
                dispatch(setStatusBarMessage("Failed to update local backup: " + error.message));
                debugLog(debugOn, "updateLocalBackupThunk failed: ", error)
                dispatch(setUpdatingBackup(false));
                reject(error);
            }
        });
    });
}
export const listLocalItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, localBackupActivity.ListLocalItems, () => {
        return new Promise(async (resolve, reject) => {
            const workspace = getState().container.workspace;
            let state, pageNumber;
            dispatch(setListingDone(false));
            dispatch(setListingItems(true));
            dispatch(setMode("listAll"));
            state = getState().container;
            if (!state.container) {
                reject('container is null!');
                return;
            }
            let body;
            if (state.container.startsWith('n')) {
                pageNumber = data.pageNumber;
                body = {
                    container: state.container,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            } else if (state.container.startsWith('d')) {
                let selectedDiaryContentStartPosition, selectedDiaryContentEndPosition;
                const startDate = data.startDate;
                pageNumber = 1;
                selectedDiaryContentStartPosition = parseInt(startDate + '00');
                selectedDiaryContentEndPosition = parseInt(startDate + '31');
                body = {
                    container: state.container,
                    size: 31,
                    from: 0,
                    selectedDiaryContentStartPosition,
                    selectedDiaryContentEndPosition
                }
            } else if (state.container.startsWith('f') || state.container.startsWith('b') || state.container.startsWith('t')) {
                pageNumber = data.pageNumber;
                body = {
                    container: state.container,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            } else {
                pageNumber = data.pageNumber;
                body = {
                    container: state.workspace,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            }
            let response = await window.desktopAPI.listItems(body);
            if (response.status === "ok") {
                const total = response.hits.total;
                const hits = response.hits.hits;
                dispatch(pageLoaded({ pageNumber, total, hits }));
                dispatch(setListingDone(true));
                resolve();
            } else {
                debugLog(debugOn, "listItems failed: ", data.error);
                reject("Failed to list items.");
            }
            dispatch(setListingItems(false));
        });
    });
}
export const getPageItemFromLocalBackup = (payload) => {
    return new Promise(async (resolve, reject) => {
        let response = await window.desktopAPI.getPageItem(payload);
        resolve(response);
    });
}
export const updateStatusBarMessageThunk = (data) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
        const authId = data.authId;
        const updatingBackup = getState().localBackup.updatingBackup;
        if (updatingBackup) {
            resolve();
            return;
        }
        const response = await window.desktopAPI.getAMmberByAuthId(authId);
        if (response.status === "ok" && response.member) {
            const lastUpdatedTime = response.member.lastUpdatedTime;
            const offlineMode = getState().auth.offlineMode;
            let statusBarMessage = "";
            if (lastUpdatedTime) {
                statusBarMessage = "Your local backup was last updated: " + new Date(lastUpdatedTime).toLocaleString();
            }
            if (offlineMode) {
                statusBarMessage = "Your are now offline. " + statusBarMessage;
            }
            dispatch(setStatusBarMessage(statusBarMessage));
            resolve();
        }
    });
}

export default localBackupSlice;