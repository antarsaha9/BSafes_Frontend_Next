import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { setNavigationInSameContainer } from './containerSlice';

import { getBrowserInfo, usingServiceWorker, convertBinaryStringToUint8Array, debugLog, PostCall, extractHTMLElementText, requestAppleReview } from '../lib/helper'
import { generateNewItemKey, decryptBinaryString, encryptBinaryString, encryptLargeBinaryString, decryptChunkBinaryStringToBinaryStringAsync, decryptLargeBinaryString, encryptChunkBinaryStringToBinaryStringAsync, stringToEncryptedTokensCBC, stringToEncryptedTokensECB, tokenfieldToEncryptedArray, tokenfieldToEncryptedTokensCBC, tokenfieldToEncryptedTokensECB } from '../lib/crypto';
import { pageActivity } from '../lib/activities';
import { getBookIdFromPage, timeToString, formatTimeDisplay, getEditorConfig } from '../lib/bSafesCommonUI';
import { preS3Download, preS3ChunkUpload, preS3ChunkDownload, putS3Object } from '../lib/s3Helper';
import { downScaleImage } from '../lib/wnImage';
import { isDemoMode } from '../lib/demoHelper';
import { readDataFromServiceWorkerDBTable, writeDataToServiceWorkerDBTable, writeDataToServiceWorkerDB } from '../lib/serviceWorkerDBHelper';

const embeddJSONSeperator = '=#=#=embeddJSON=';
const MAX_NUMBER_OF_MEDIA_FILES = 32;
const debugOn = false;

const initialState = {
    aborted: false,
    activity: 0,
    activityErrors: 0,
    activityErrorMessages: {},
    iOSActivity: 0,
    changingPage: false,
    activeRequest: null,
    error: null,
    navigationMode: false,
    decrypttionRequired: true,
    itemCopy: null,
    itemPath: null,
    id: null,
    oldVersion: false,
    style: null,
    space: null,
    container: null,
    pageNumber: null,
    position: null,
    itemKey: null,
    itemIV: null,
    tags: [],
    title: null,
    titleText: null,
    content: null,
    contentSize: 0,
    contentImagesDownloadQueue: [],
    contentImagedDownloadIndex: 0,
    contentImagesDisplayIndex: 0,
    contentImagesAllDownloaded: false,
    contentVideosDownloadQueue: [],
    videoPanels: [],
    videosUploadQueue: [],
    videosUploadIndex: 0,
    videosDownloadQueue: [],
    videoChunksMap: {},
    imagePanels: [],
    imageUploadQueue: [],
    imageUploadIndex: 0,
    imageDownloadQueue: [],
    imageDownloadIndex: 0,
    chunkSize: 10 * 1024 * 1024,
    attachmentPanels: [],
    attachmentPanelSelectedForDownload: null,
    attachmentsUploadQueue: [],
    attachmentsUploadIndex: 0,
    attachmentsDownloadQueue: [],
    attachmentsDownloadIndex: 0,
    abortController: null,
    xhr: null,
    writer: null,
    itemVersions: [],
    totalVersions: 0,
    versionsPerPage: 20,
    versionsPageNumber: 0,
    newCommentEditorMode: 'ReadOnly',
    comments: [],
    S3SignedUrlForContentUpload: null,
    draft: null,
    draftLoaded: false,
    originalContent: null,
    contentType: ''
}

const dataFetchedFunc = (state, action) => {
    const item = action.payload.item;
    state.itemCopy = item;
    state.id = item.id;
    if (state.id.startsWith('np')) {
        state.pageNumber = parseInt(state.id.split(':').pop())
    }
    state.space = item.space;
    state.container = item.container;
    state.position = item.position;
    state.contentType = item.contentType;
}

function findMediasInContent(state, content) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = content;

    const images = tempElement.querySelectorAll(".bSafesImage");
    images.forEach((item) => {
        let id = item.id;
        let idParts = id.split('&');
        let s3Key = idParts[0];

        state.contentImagesDownloadQueue.push({ id, s3Key });
    });

    const videos = tempElement.querySelectorAll(".bSafesDownloadVideo");
    videos.forEach((item) => {
        let id = item.id;
        let idParts = id.split('&');
        if (idParts[0] === 'chunks') {
            let s3Key = idParts[3] + '_chunk_' + getEditorConfig().videoThumbnailIndex;
            state.contentImagesDownloadQueue.push({ id, s3Key });
        }
    });
}

function decryptPageItemFunc(state, workspaceKey) {
    if (!state.decrypttionRequired) return;
    const item = state.itemCopy;
    if ((item.keyEnvelope === undefined)) {
        debugLog(debugOn, "Error: undefined item key");
        state.error = "Undefined item key";
    }
    if (item.envelopeIV && item.ivEnvelope && item.ivEnvelopeIV) { // legacy CBC-mode
        state.itemKey = decryptBinaryString(forge.util.decode64(item.keyEnvelope), workspaceKey, forge.util.decode64(item.envelopeIV));
        state.itemIV = decryptBinaryString(forge.util.decode64(item.ivEnvelope), workspaceKey, forge.util.decode64(item.ivEnvelopeIV));
    } else {
        const decoded = forge.util.decode64(item.keyEnvelope);
        state.itemKey = decryptBinaryString(decoded, workspaceKey);
        state.itemIV = null;
    }
    let itemTags = [];
    let hiddenTags = {
        'contentType#Write': true,
    }
    if (item.tags && item.tags.length > 1) {
        const encryptedTags = item.tags;
        for (let i = 0; i < (item.tags.length - 1); i++) {
            try {
                let encryptedTag = encryptedTags[i];
                encryptedTag = forge.util.decode64(encryptedTag);
                const encodedTag = decryptBinaryString(encryptedTag, state.itemKey, state.itemIV);
                const tag = forge.util.decodeUtf8(encodedTag);
                if (hiddenTags[tag]) continue;
                itemTags.push(tag);
            } catch (err) {
                state.error = err;
            }
        }
    };
    state.tags = itemTags;

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

    if (item.content && !item.content.startsWith('s3Object/')) {
        try {
            const encodedContent = decryptBinaryString(forge.util.decode64(item.content), state.itemKey, state.itemIV);
            let content = forge.util.decodeUtf8(encodedContent);
            content = DOMPurify.sanitize(content);
            state.content = content;

            findMediasInContent(state, content);

        } catch (err) {
            state.error = err;
        }
    }

    if (item.videos) {
        let newPanels = [];
        for (let i = 0; i < item.videos.length; i++) {
            let video = item.videos[i];
            let encryptedWords, encodedWords, words;
            const videoThumbnailS3Key = `${video.s3KeyPrefix}_chunk_${getEditorConfig().videoThumbnailIndex}`
            const queueId = 'd' + state.imageDownloadQueue.length;
            state.imageDownloadQueue.push({ s3Key: videoThumbnailS3Key, forVideo: true });

            if (video.words && video.words !== "") {
                encryptedWords = forge.util.decode64(video.words);
                encodedWords = decryptBinaryString(encryptedWords, state.itemKey, state.itemIV);
                words = forge.util.decodeUtf8(encodedWords);
                words = DOMPurify.sanitize(words);
            } else {
                words = "";
            }

            const newPanel = {
                video: true,
                queueId,
                fileType: video.fileType,
                fileName: decodeURI(decryptBinaryString(forge.util.decode64(video.fileName), state.itemKey)),
                fileSize: video.fileSize,
                encryptedFileSize: video.encryptedFileSize,
                status: "WaitingForDownload",
                numberOfChunks: video.numberOfChunks,
                s3KeyPrefix: video.s3KeyPrefix,
                progress: 0,
                words,
                thumbnail: null,
                placeholder: "https://placehold.co/600x400?text=Video"
            }
            newPanels.push(newPanel);
        }
        state.videoPanels = newPanels;
    }

    if (item.images) {
        for (let i = 0; i < item.images.length; i++) {
            let image = item.images[i];
            let encryptedWords, encodedWords, words;
            const queueId = 'd' + state.imageDownloadQueue.length;
            state.imageDownloadQueue.push({ s3Key: image.s3Key });
            if (image.words && image.words !== "") {
                encryptedWords = forge.util.decode64(image.words);
                encodedWords = decryptBinaryString(encryptedWords, state.itemKey, state.itemIV);
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
    if (item.attachments.length > 1) {
        let encryptedFileName, encodedFileName, fileName, fileType, fileSize;
        let newPanels = [];
        for (let i = 1; i < item.attachments.length; i++) {
            let attachment = item.attachments[i];
            encryptedFileName = forge.util.decode64(attachment.fileName);
            encodedFileName = decryptBinaryString(encryptedFileName, state.itemKey, state.itemIV);
            fileName = forge.util.decodeUtf8(encodedFileName);
            const newPanel = {
                queueId: 'a' + i,
                fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                status: "Uploaded",
                numberOfChunks: attachment.numberOfChunks,
                s3KeyPrefix: attachment.s3KeyPrefix,
                progress: 0
            }
            newPanels.push(newPanel);
        }
        state.attachmentPanels = newPanels.reverse();
    }
}

const containerDataFetchedFunc = (state, action) => {
    state.id = action.payload.itemId;
    state.space = action.payload.container.space;
    state.container = action.payload.container.id;
    state.title = "<h2></h2>";
}

const pageSlice = createSlice({
    name: "page",
    initialState: initialState,
    reducers: {
        cleanPageSlice: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for (let i = 0; i < stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        resetPageActivity: (state, action) => {
            state.activity = 0,
                state.activityErrors = 0,
                state.activityErrorCodes = {};
        },
        activityStart: (state, action) => {
            if (state.aborted) return;
            state.activityErrors &= ~action.payload;
            state.activityErrorMessages[action.payload] = '';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            if (state.aborted) return;
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            if (state.aborted) return;
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorMessages[action.payload.type] = action.payload.error;
        },
        clearPage: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for (let i = 0; i < stateKeys.length; i++) {
                let key = stateKeys[i];
                if (key === 'aborted') continue;
                state[key] = initialState[key];
            }
        },
        initPage: (state, action) => {
            state.aborted = false;
        },
        setChangingPage: (state, action) => {
            state.changingPage = action.payload;
        },
        abort: (state, action) => {
            state.aborted = true;
            debugLog(debugOn, "abort: ", state.aborted);
        },
        setIOSActivity: (state, action) => {
            state.iOSActivity = action.payload;
        },
        setActiveRequest: (state, action) => {
            state.activeRequest = action.payload;
        },
        setNavigationMode: (state, action) => {
            state.navigationMode = true;
        },
        setPageItemId: (state, action) => {
            state.id = action.payload;
        },
        setPageStyle: (state, action) => {
            state.style = action.payload;
        },
        setPageNumber: (state, action) => {
            state.pageNumber = action.payload;
        },
        dataFetched: (state, action) => {
            if (state.aborted) return;
            if (action.payload.item.id !== state.activeRequest) return;
            dataFetchedFunc(state, action);
        },
        setOldVersion: (state, action) => {
            state.oldVersion = true;
        },
        contentDecrypted: (state, action) => {
            if (state.aborted) return;
            if (action.payload.item.id !== state.activeRequest) return;
            state.content = action.payload.item.content;
            findMediasInContent(state, state.content);
        },
        itemPathLoaded: (state, action) => {
            state.itemPath = action.payload;
        },
        containerDataFetched: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            containerDataFetchedFunc(state, action);

        },
        setContainerData: (state, action) => {
            containerDataFetchedFunc(state, action);
        },
        decryptPageItem: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            decryptPageItemFunc(state, action.payload.workspaceKey);
        },
        newItemKey: (state, action) => {
            state.itemKey = action.payload.itemKey;
        },
        newItemCreated: (state, action) => {
            const updatedKeys = Object.keys(action.payload);
            for (let i = 0; i < updatedKeys.length; i++) {
                let key = updatedKeys[i];
                state[key] = action.payload[key];
            }
            state.decrypttionRequired = false;
        },
        newVersionCreated: (state, action) => {
            const updatedKeys = Object.keys(action.payload);
            for (let i = 0; i < updatedKeys.length; i++) {
                let key = updatedKeys[i];
                state[key] = action.payload[key];
            }
            state.decrypttionRequired = false;
        },
        clearItemVersions: (state, action) => {
            state.itemVersions = [];
        },
        itemVersionsFetched: (state, action) => {
            state.versionsPageNumber = action.payload.page;
            state.totalVersions = action.payload.total;
            state.itemVersions.push(...action.payload.modifiedHits);
        },
        downloadingContentImage: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            if (!image) return;
            image.status = "Downloading";
            image.progress = action.payload.progress;
        },
        contentImageDownloaded: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;

            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            state.contentImagedDownloadIndex += 1;
            if (!image) return;
            image.status = "Downloaded";
            image.src = action.payload.link;

        },
        contentImageDownloadFailed: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;

            const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
            state.contentImagedDownloadIndex += 1;
            if (!image) return;
            image.status = "DownloadFailed";
            image.src = action.payload.link;

        },
        setContentImagesAllDownloaded: (state, action) => {
            state.contentImagesAllDownloaded = action.payload;
        },
        updateContentImagesDisplayIndex: (state, action) => {
            state.contentImagesDisplayIndex = action.payload;
        },
        downloadContentVideo: (state, action) => {
            if (state.aborted) return;
            state.contentVideosDownloadQueue.push(action.payload);
        },
        downloadingContentVideo: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.contentVideosDownloadQueue[indexInQueue];
            if (!video) return;
            video.status = "Downloading";
            video.progress = action.payload.progress;
        },
        contentVideoFromServiceWorker: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.contentVideosDownloadQueue[indexInQueue];
            if (!video) return;
            video.status = "DownloadedFromServiceWorker";
            video.src = action.payload.link;
        },
        playingContentVideo: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.contentVideosDownloadQueue[indexInQueue];
            if (!video) return;
            video.status = "playingContentVideo";
        },
        contentVideoDownloaded: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.contentVideosDownloadQueue[indexInQueue];
            if (!video) return;
            video.status = "Downloaded";
            if (action.payload.link) video.src = action.payload.link;
        },
        addUploadVideos: (state, action) => {
            if (state.aborted) return;
            const files = action.payload.files;
            if (!files.length) return;
            let newPanels = [];
            for (let i = 0; i < files.length; i++) {
                const queueId = 'u' + state.videosUploadQueue.length;
                const fileSize = files[i].size;
                const videoChunkSize = getEditorConfig().videoChunkSize;
                let numberOfChunks = Math.floor(fileSize / videoChunkSize);
                if (fileSize % videoChunkSize) numberOfChunks += 1;
                const newUpload = { file: files[i], numberOfChunks };
                state.videosUploadQueue.push(newUpload);
                const newPanel = {
                    video: true,
                    queueId: queueId,
                    fileName: forge.util.encode64(encryptBinaryString(encodeURI(files[i].name), state.itemKey)),
                    fileSize: files[i].size,
                    fileType: encodeURI(files[i].type),
                    status: "WaitingForUpload",
                    numberOfChunks: newUpload.numberOfChunks,
                    progress: 0
                }
                newPanels.push(newPanel);
            }
            switch (action.payload.where) {
                case "top":
                    state.videoPanels.unshift(...newPanels);
                    break;
                default:
                    let index = parseInt(action.payload.where.split('_').pop());
                    state.videoPanels.splice(index + 1, 0, ...newPanels);
            }
        },
        uploadingVideo: (state, action) => {
            if (state.aborted) return;
            let panel = state.videoPanels.find((item) => item.queueId === 'u' + state.videosUploadIndex);
            panel.status = "Uploading";
            panel.progress = action.payload;
        },
        videoUploaded: (state, action) => {
            if (state.aborted) return;

            let panel = state.videoPanels.find((item) => item.queueId === 'u' + state.videosUploadIndex);
            state.videosUploadIndex += 1;
            if (!panel) return;
            panel.status = "Uploaded";
            panel.progress = 100;
            panel.fileType = action.payload.fileType;
            panel.fileSize = action.payload.fileSize;
            panel.s3KeyPrefix = action.payload.s3KeyPrefix;
            panel.size = action.payload.size;
            panel.failedChunk = null;
            panel.src = action.payload.link;
            panel.play = true;

        },
        setVideoWordsMode: (state, action) => {
            let panel = state.videoPanels[action.payload.index];
            if (!panel) return;
            panel.editorMode = action.payload.mode;
        },
        downloadVideo: (state, action) => {
            if (state.aborted) return;
            state.videosDownloadQueue.push(action.payload);
        },
        downloadingVideo: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.videosDownloadQueue[indexInQueue];
            const panel = state.videoPanels.find((item) => item.queueId === video.id);
            if (!panel) return;
            if (panel.status !== 'DownloadedFromServiceWorker') panel.status = "DownloadingVideo";
            panel.progress = action.payload.progress;
        },
        videoFromServiceWorker: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            const indexInQueue = action.payload.indexInQueue;
            const video = state.videosDownloadQueue[indexInQueue];
            const panel = state.videoPanels.find((item) => item.queueId === video.id);
            if (!panel) return;
            panel.status = "DownloadedFromServiceWorker";
            panel.play = true;
            panel.src = action.payload.link;
        },
        updateVideoChunksMap: (state, action) => {
            const chunksMapId = action.payload.chunkId;
            const map = action.payload.map;
            const downloadingChunk = action.payload.downloadingChunk;
            const lastChunkDownloaded = action.payload.lastChunkDownloaded;
            state.videoChunksMap[chunksMapId] = { map, downloadingChunk, lastChunkDownloaded }
        },
        addUploadImages: (state, action) => {
            if (state.aborted) return;
            const files = action.payload.files;
            let newPanels = [];
            for (let i = 0; i < files.length; i++) {
                const queueId = 'u' + state.imageUploadQueue.length;
                const newUpload = { file: files[i] };
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
                default:
                    let index = parseInt(action.payload.where.split('_').pop());
                    state.imagePanels.splice(index + 1, 0, ...newPanels);
            }
        },
        uploadingImage: (state, action) => {
            if (state.aborted) return;
            let panel = state.imagePanels.find((item) => item.queueId === 'u' + state.imageUploadIndex);
            panel.status = "Uploading";
            panel.progress = action.payload;
        },
        imageUploaded: (state, action) => {
            if (state.aborted) return;

            let panel = state.imagePanels.find((item) => item.queueId === 'u' + state.imageUploadIndex);
            state.imageUploadIndex += 1;
            if (!panel) return;
            panel.status = "Uploaded";
            panel.progress = 100;
            panel.src = action.payload.link;
            panel.width = action.payload.width;
            panel.height = action.payload.height;
            panel.s3Key = action.payload.s3Key;
            panel.size = action.payload.size;
            panel.editorMode = "ReadOnly";
            panel.words = "";

        },
        downloadingImage: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            let panel = state.videoPanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            if (!panel) panel = state.imagePanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            if (!panel) return;
            panel.status = "Downloading";
            panel.progress = action.payload.progress;
        },
        imageDownloaded: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;

            let panel = state.videoPanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            if (!panel) panel = state.imagePanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            state.imageDownloadIndex += 1;
            if (!panel) return;
            panel.status = "Downloaded";
            panel.progress = 100;
            if (panel.video) {
                panel.thumbnail = action.payload.link;
            } else {
                panel.src = action.payload.link;
            }
            panel.width = action.payload.width;
            panel.height = action.payload.height;
            panel.editorMode = "ReadOnly";

        },
        imageDownloadFailed: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            let panel = state.videoPanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            if (!panel) panel = state.imagePanels.find((item) => item.queueId === 'd' + state.imageDownloadIndex);
            state.imageDownloadIndex += 1;
            if (!panel) return;
            panel.status = "DownloadFailed";
        },
        setImageWordsMode: (state, action) => {
            let panel = state.imagePanels[action.payload.index];
            if (!panel) return;
            panel.editorMode = action.payload.mode;
        },
        readOnlyImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            if (!panel) return;
            panel.editorMode = "ReadOnly";
        },
        writingImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            if (!panel) return;
            panel.editorMode = "Writing";
        },
        saveImageWords: (state, action) => {
            let panel = state.imagePanels[action.payload];
            panel.editorMode = "Saving";
        },
        addUploadAttachments: (state, action) => {
            if (state.aborted) return;
            const files = action.payload.files;
            if (!files.length) return;
            let newPanels = [];
            for (let i = 0; i < files.length; i++) {
                const queueId = 'u' + state.attachmentsUploadQueue.length;
                let numberOfChunks = Math.floor(files[i].size / state.chunkSize);
                if (files[i].size % state.chunkSize) numberOfChunks += 1;
                const newUpload = { file: files[i], numberOfChunks };
                state.attachmentsUploadQueue.push(newUpload);
                const newPanel = {
                    queueId: queueId,
                    fileName: files[i].name,
                    fileSize: files[i].size,
                    fileType: files[i].type,
                    status: "WaitingForUpload",
                    numberOfChunks: newUpload.numberOfChunks,
                    progress: 0
                }
                newPanels.push(newPanel);
            }

            state.attachmentPanels = newPanels.concat(state.attachmentPanels);

        },
        setAbortController: (state, action) => {
            state.abortController = action.payload;
        },
        uploadingAttachment: (state, action) => {
            if (state.aborted) return;
            let panel = state.attachmentPanels.find((item) => item.queueId === 'u' + state.attachmentsUploadIndex);
            panel.status = "Uploading";
            panel.progress = action.payload;
        },
        stopUploadingAnAttachment: (state, action) => {
            if (state.abortController) {
                state.abortController.abort();
            }
        },
        attachmentUploaded: (state, action) => {
            if (state.aborted) return;

            let panel = state.attachmentPanels.find((item) => item.queueId === 'u' + state.attachmentsUploadIndex);
            state.attachmentsUploadIndex += 1;
            if (!panel) return;
            panel.status = "Uploaded";
            panel.progress = 100;
            panel.fileType = action.payload.fileType;
            panel.fileSize = action.payload.fileSize;
            panel.s3KeyPrefix = action.payload.s3KeyPrefix;
            panel.size = action.payload.size;
            panel.failedChunk = null;

        },
        uploadAChunkFailed: (state, action) => {
            let attachment = state.attachmentsUploadQueue[state.attachmentsUploadIndex];
            attachment.failedChunk = action.payload.chunkIndex;
            attachment.s3KeyPrefix = action.payload.s3KeyPrefix;
            let panel = state.attachmentPanels.find((item) => item.queueId === 'u' + state.attachmentsUploadIndex);
            if (!panel) return;
            panel.status = "UploadFailed";
        },
        addDownloadAttachment: (state, action) => {
            if (state.aborted) return;
            state.attachmentsDownloadQueue.push(action.payload);
            let panel = state.attachmentPanels.find((item) => item.queueId === action.payload.queueId);
            panel.status = "WaitingForDownload";
            panel.progress = 0;
        },
        downloadingAttachment: (state, action) => {
            if (state.aborted) return;
            let panel = state.attachmentPanels.find((item) => item.queueId === state.attachmentsDownloadQueue[state.attachmentsDownloadIndex].queueId);
            panel.status = "Downloading";
            panel.progress = action.payload.progress;
        },
        setAttachmentSelectedForDownload: (state, action) => {
            state.attachmentPanelSelectedForDownload = action.payload;
        },
        setXHR: (state, action) => {
            state.xhr = action.payload.xhr;
        },
        stopDownloadingAnAttachment: (state, action) => {
            if (state.xhr) {
                state.xhr.abort();
            }
        },
        attachmentDownloaded: (state, action) => {
            if (state.aborted) return;
            let attachment = action.payload;
            let panel = state.attachmentPanels.find((item) => item.queueId === attachment.queueId);
            panel.status = "Downloaded";
            state.attachmentsDownloadIndex += 1;
        },
        setupWriterFailed: (state, action) => {
            let attachment = state.attachmentsDownloadQueue[state.attachmentsDownloadIndex];
            let panel = state.attachmentPanels.find((item) => item.queueId === attachment.queueId);
            if (!panel) return;
            panel.status = "DownloadFailed";
        },
        writerClosed: (state, action) => {
            state.writer = null;
        },
        downloadAChunkFailed: (state, action) => {
            let attachment = state.attachmentsDownloadQueue[state.attachmentsDownloadIndex];
            state.writer = action.payload.writer;
            attachment.failedChunk = action.payload.chunkIndex;
            let panel = state.attachmentPanels.find((item) => item.queueId === attachment.queueId);
            if (!panel) return;
            panel.status = "DownloadFailed";
        },
        setCommentEditorMode: (state, action) => {
            if (action.payload.index === 'comment_New') {
                state.newCommentEditorMode = action.payload.mode;
            } else {
                let index = parseInt(action.payload.index.split('_')[1]);
                state.comments[index].editorMode = action.payload.mode;
            }
        },
        pageCommentsFetched: (state, action) => {
            if (state.aborted) return;
            if (action.payload.itemId !== state.activeRequest) return;
            state.comments.push(...action.payload.comments);
        },
        newCommentAdded: (state, action) => {
            state.comments.unshift(action.payload);
        },
        commentUpdated: (state, action) => {
            const comment = state.comments[action.payload.commentIndex];
            comment.content = action.payload.content;
            comment.lastUpdateTime = action.payload.lastUpdateTime;
        },
        setS3SignedUrlForContentUpload: (state, action) => {
            state.S3SignedUrlForContentUpload = action.payload;
        },
        setDraft: (state, action) => {
            state.draft = action.payload;
        },
        clearDraft: (state, action) => {
            state.draft = null;
            const draftId = 'Draft-' + state.id;
            localStorage.removeItem(draftId);
        },
        draftLoaded: (state, action) => {
            state.originalContent = state.content;
            state.content = forge.util.decodeUtf8(state.draft);
            state.draftLoaded = true;
            state.draft = null;
            const draftId = 'Draft-' + state.id;
            localStorage.removeItem(draftId);
            state.contentImagesDownloadQueue = [];
            state.contentImagedDownloadIndex = 0;
            state.contentImagesAllDownloaded = false;
            state.contentImagesDisplayIndex = 0;
            state.contentVideosDownloadQueue = 0;
            findMediasInContent(state, state.content);
        },
        setDraftLoaded: (state, action) => {
            state.draftLoaded = action.payload;
        },
        loadOriginalContent: (state, action) => {
            state.content = state.originalContent;
            state.contentImagesDownloadQueue = [];
            state.contentImagedDownloadIndex = 0;
            state.contentImagesDisplayIndex = 0;
            state.contentVideosDownloadQueue = 0;
            findMediasInContent(state, state.content);
        },
        setContentType: (state, action) => {
            state.contentType = action.payload;
        }
    }
})

export const { cleanPageSlice, resetPageActivity, activityStart, activityDone, activityError, clearPage, initPage, setIOSActivity, setChangingPage, abort, setActiveRequest, setNavigationMode, setPageItemId, setPageStyle, setPageNumber, dataFetched, setOldVersion, contentDecrypted, itemPathLoaded, decryptPageItem, containerDataFetched, setContainerData, newItemKey, newItemCreated, newVersionCreated, clearItemVersions, itemVersionsFetched, downloadingContentImage, contentImageDownloaded, contentImageDownloadFailed, setContentImagesAllDownloaded, updateContentImagesDisplayIndex, downloadContentVideo, downloadingContentVideo, contentVideoDownloaded, contentVideoFromServiceWorker, playingContentVideo, addUploadImages, uploadingImage, imageUploaded, downloadingImage, imageDownloaded, imageDownloadFailed, addUploadAttachments, setAbortController, uploadingAttachment, stopUploadingAnAttachment, attachmentUploaded, uploadAChunkFailed, addDownloadAttachment, stopDownloadingAnAttachment, downloadingAttachment, setXHR, attachmentDownloaded, setAttachmentSelectedForDownload, writerClosed, setupWriterFailed, downloadAChunkFailed, setImageWordsMode, setCommentEditorMode, pageCommentsFetched, newCommentAdded, commentUpdated, setS3SignedUrlForContentUpload, setDraft, clearDraft, draftLoaded, setDraftLoaded, loadOriginalContent, addUploadVideos, uploadingVideo, videoUploaded, setVideoWordsMode, downloadVideo, downloadingVideo, videoFromServiceWorker, updateVideoChunksMap, playingVideo, setContentType } = pageSlice.actions;


const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch (error) {
        if (error === "Aborted") {
            dispatch(activityDone(type));
            return;
        }
        dispatch(activityError({ type, error }));
    }
}

const XHRDownload = (itemId, dispatch, signedURL, downloadingFunction, baseProgress = 0, progressRatio = 1, indexInQueue = -1) => {
    return new Promise(async (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', signedURL, true);
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                let percentComplete = evt.loaded / evt.total * 90 + 10;
                percentComplete = baseProgress + percentComplete * progressRatio;
                debugLog(debugOn, "Download progress: ", `${evt.loaded}/${evt.total} ${percentComplete} %`);
                if (downloadingFunction) {
                    if (indexInQueue >= 0) {
                        dispatch(downloadingFunction({ itemId, progress: percentComplete, indexInQueue }));
                    } else {
                        dispatch(downloadingFunction({ itemId, progress: percentComplete }));
                    }
                }
            }
        }, false);

        xhr.onload = function (e) {
            if (xhr.status === 200) {
                resolve(this.response)
            } else {
                reject();
            }

        };

        xhr.onerror = function (e) {
            reject();
        }

        xhr.onabort = (event) => {
            reject(event);
        };

        xhr.send();
        dispatch(setXHR({ xhr }));
    });
}

const addADemoItemToServiceWorkerDB = async (workspace, workspaceKey, searchKey, searchIV, itemId) => {
    const itemType = itemId.split(":")[0].toUpperCase();
    let titleStr = null;
    let isContainer = false;
    switch (itemType) {
        case "P":
            titleStr = "Demo Page";
            break;
        case "N":
            titleStr = "Demo Notebook";
            isContainer = true;
            break;
        case "D":
            titleStr = "Demo Diary";
            isContainer = true;
            break;
        default:
    }
    let title = '<h2>' + titleStr + '</h2>';
    const encodedTitle = forge.util.encodeUtf8(title);
    const itemKey = generateNewItemKey();
    const keyEnvelope = forge.util.encode64(encryptBinaryString(itemKey, workspaceKey));
    const encryptedTitle = forge.util.encode64(encryptBinaryString(encodedTitle, itemKey));
    const createdTime = Date.now();
    const owner = workspace.split(":")[1];
    const currentKeyVersion = 3;
    const id = itemId;
    const container = workspace;
    const displayName = "Demo";
    let titleTokens = JSON.stringify(stringToEncryptedTokensCBC(titleStr, searchKey, searchIV));
    const item = {
        id,
        title: encryptedTitle,
        titleTokens,
        version: 1,
        owner,
        displayName,
        createdTime,
        updatedBy: owner,
        update: "creation",
        keyVersion: currentKeyVersion,
        keyEnvelope,
        type: itemType,
        space: workspace,
        container,
        position: createdTime,
        videos: [],
        images: [],
        attachments: ["Zero"],
        usage: {
            totalItemSize: 0,
            dbSize: 0,
            addedSize: 0,
            accumulatedContentObjects: {
                "Zero": "Zero"
            },
            accumulatedS3ObjectsInContent: {
                "Zero": "Zero"
            },
            accumulatedAttachments: {
                "Zero": "Zero"
            },
            accumulatedGalleryImages: {
                "Zero": "Zero"
            }
        }
    }
    if (isContainer) {
        item.totalItemVersions = 0;
        item.totalStorage = 0;
    }
    const params = {
        table: 'itemVersions',
        key: itemId,
        data: item
    }
    const result = await writeDataToServiceWorkerDBTable(params);
    if (result.status === 'ok') {
        return item;
    } else {
        return null;
    }
}

const prepareADemoPageItem = (workspace, type, data) => {
    const createdTime = Date.now();
    const owner = workspace.split(":")[1];
    const currentKeyVersion = 3;
    const id = data.itemId;
    const displayName = "Demo";
    const itemTemplate = {
        id,
        version: 1,
        owner,
        displayName,
        createdTime,
        updatedBy: owner,
        update: "creation",
        keyVersion: currentKeyVersion,
        type,
        position: createdTime,
        videos: [],
        images: [],
        attachments: ["Zero"],
        usage: {
            totalItemSize: 0,
            dbSize: 0,
            addedSize: 0,
            accumulatedContentObjects: {
                "Zero": "Zero"
            },
            accumulatedS3ObjectsInContent: {
                "Zero": "Zero"
            },
            accumulatedAttachments: {
                "Zero": "Zero"
            },
            accumulatedGalleryImages: {
                "Zero": "Zero"
            }
        }
    }
    const item = {
        ...itemTemplate,
        ...data
    }
    return item;
}

const getDemoItemFromServiceWorkerDB = (itemId) => {
    const params = {
        table: 'itemVersions',
        key: itemId
    }
    return readDataFromServiceWorkerDBTable(params);
}

const getS3ObjectFromServiceWorkerDB = (s3Key) => {
    const params = {
        table: 's3Objects',
        key: s3Key
    }
    return readDataFromServiceWorkerDBTable(params);
}

const startDownloadingContentImages = async (itemId, dispatch, getState) => {
    let state = getState().page;
    const workspace = getState().container.workspace;
    dispatch(setContentImagesAllDownloaded(false));
    const downloadAnImage = (image) => {
        return new Promise(async (resolve, reject) => {
            const s3Key = image.s3Key;
            let downloadedBinaryString, decryptedImageStr;
            try {
                if (!workspace.startsWith("d:")) {
                    dispatch(downloadingContentImage({ itemId, progress: 5 }));
                    const signedURL = await preS3Download(state.id, s3Key, dispatch);
                    dispatch(downloadingContentImage({ itemId, progress: 10 }));
                    const response = await XHRDownload(itemId, dispatch, signedURL, downloadingContentImage);
                    debugLog(debugOn, "downloadAnContentImage completed. Length: ", response.byteLength);
                    if (itemId !== state.activeRequest) {
                        debugLog(debugOn, "Aborted!");
                        reject("Aborted")
                        return;
                    };
                    const buffer = Buffer.from(response, 'binary');
                    downloadedBinaryString = buffer.toString('binary');
                } else {
                    const result = await getS3ObjectFromServiceWorkerDB(s3Key);
                    if (result.status === 'ok') {
                        downloadedBinaryString = result.object;
                    } else {
                        throw new Error("Failed to read an image data from service worker DB!");
                    }
                }
                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                decryptedImageStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                debugLog(debugOn, "Decrypted image string length: ", decryptedImageStr.length);
                const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decryptedImageStr);
                const link = window.URL.createObjectURL(new Blob([decryptedImageDataInUint8Array]), {
                    type: 'image/*'
                });
                dispatch(contentImageDownloaded({ itemId, link }));
                resolve();
            } catch (error) {
                debugLog(debugOn, 'downloadFromS3 error: ', error);
                dispatch(contentImageDownloadFailed({ itemId, link: null }));
                reject(error);
            }
        });
    }
    while (state.contentImagedDownloadIndex < state.contentImagesDownloadQueue.length) {
        if (state.aborted) {
            debugLog(debugOn, "abort: ", state.aborted);
            break;
        }
        const image = state.contentImagesDownloadQueue[state.contentImagedDownloadIndex];
        try {
            await downloadAnImage(image);
        } catch (error) {

        }
        state = getState().page;
    }
    dispatch(setContentImagesAllDownloaded(true));
}

function getItemPath(id, dispatch, getState) {
    return new Promise(async (resolve, reject) => {
        let itemId, state;
        if (id.startsWith('np') || id.startsWith('dp')) {
            itemId = getBookIdFromPage(id);
        } else {
            itemId = id;
        }
        PostCall({
            api: '/memberAPI/getItemPath',
            body: { itemId },
            dispatch
        }).then(result => {
            debugLog(debugOn, result);
            if (result.status === 'ok') {
                state = getState().page;
                if (id !== state.activeRequest) {
                    debugLog(debugOn, "Aborted");
                    return;
                }
                if (id.startsWith('np') || id.startsWith('dp')) {
                    result.itemPath.push({ _id: id })
                }
                dispatch(itemPathLoaded(result.itemPath));
                resolve();
            } else {
                reject(result.error);
                debugLog(debugOn, "woo... failed to get the item path.!", result.status);
            }
        }).catch(error => {
            debugLog(debugOn, "woo... failed to get the item path.", error)
            reject(error);
        })
    });
}

export const putS3ObjectInServiceWorkerDB = (s3Key, data, onProgress) => {
    return new Promise(async (resolve, reject) => {
        let params = {
            table: 's3Objects',
            key: s3Key,
            data
        }
        let result = await writeDataToServiceWorkerDBTable(params);
        if (result.status === 'ok') {
            resolve(result);
            onProgress({ lengthComputable: true, total: 100, loaded: 100 });
        } else {
            reject();
        }
    });
}

export const getPageItemThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.GetPageItem, () => {

        if (data.itemId.startsWith('np')) {
            dispatch(setPageNumber(parseInt(data.itemId.split(':').pop())));
        }

        const getContainerData = (itemId) => {
            return new Promise(async (resolve, reject) => {
                let itemIdParts, containerId;
                itemIdParts = itemId.split(':');
                itemIdParts.pop();
                containerId = itemIdParts.join(':');
                containerId = containerId.replace('p:', ':');
                if (!isDemoMode()) {
                    debugLog(debugOn, "/memberAPI/getPageItem: ", containerId);
                    PostCall({
                        api: '/memberAPI/getPageItem',
                        body: { itemId: containerId },
                        dispatch
                    }).then(result => {
                        if (result.status === 'ok') {
                            debugLog(debugOn, "getContainerData: ", result);
                            if (result.item) {
                                resolve(result.item);
                            } else {
                                debugLog(debugOn, "woo... failed to get the container data!", data.error);
                                reject("Failed to get the container data.");
                            }
                        } else {
                            debugLog(debugOn, "woo... failed to get the container data!", data.error);
                            reject("Failed to get the container data.");
                        }
                    });
                } else {
                    debugLog(debugOn, "getDemoItemFromServiceWorkerDB: ", containerId);
                    const result = await getDemoItemFromServiceWorkerDB(containerId);
                    if (result.status === 'ok') {
                        debugLog(debugOn, "getContainerData: ", result);
                        if (result.item) {
                            resolve(result.item);
                        } else {
                            debugLog(debugOn, "woo... failed to get the container data!", data.error);
                            reject("Failed to get the container data.");
                        }
                    } else {
                        debugLog(debugOn, "woo... failed to get the container data!", data.error);
                        reject("Failed to get the container data.");
                    }
                }
            });
        }

        return new Promise(async (resolve, reject) => {
            let state;
            dispatch(setActiveRequest(data.itemId));

            const payload = { itemId: data.itemId };
            if (data.version) {
                payload.oldVersion = data.version;
                dispatch(setOldVersion());
            }
            function itemKeyReady() {
                return new Promise((resolve, reject) => {
                    let trials = 0;
                    state = getState().page;
                    if (state.itemKey) {
                        resolve();
                        return;
                    }
                    const timer = setInterval(() => {
                        state = getState().page;
                        debugLog(debugOn, "Waiting for itemKey ...");
                        if (state.itemKey) {
                            resolve();
                            clearInterval(timer);
                            return;
                        } else {
                            trials++;
                            if (trials > 100) {
                                reject('itemKey error!');
                                clearInterval(timer);
                            }
                        }
                    }, 100)

                })
            }
            if (!isDemoMode()) {
                debugLog(debugOn, "/memberAPI/getPageItem: ", data.itemId);
                PostCall({
                    api: '/memberAPI/getPageItem',
                    body: payload,
                    dispatch
                }).then(async result => {
                    debugLog(debugOn, result);
                    state = getState().page;
                    if (result.status === 'ok') {
                        if (data.itemId !== state.activeRequest) {
                            debugLog(debugOn, "Aborted");
                            reject("Aborted");
                            return;
                        }
                        if (result.item) {
                            dispatch(dataFetched({ item: result.item }));
                            if (result.item.content && result.item.content.startsWith('s3Object/')) {
                                dispatch(setContentType('WritingPage'));
                                const signedContentUrl = result.item.signedContentUrl;
                                const response = await XHRDownload(null, dispatch, signedContentUrl, null);
                                const buffer = Buffer.from(response, 'binary');
                                const downloadedBinaryString = buffer.toString('binary');
                                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                                await itemKeyReady();
                                const decryptedContent = decryptBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                                debugLog(debugOn, "Decrypted string length: ", decryptedContent.length);
                                const decodedContent = DOMPurify.sanitize(forge.util.decodeUtf8(decryptedContent));
                                dispatch(contentDecrypted({ item: { id: data.itemId, content: decodedContent } }));
                                state = getState().page;
                                startDownloadingContentImages(data.itemId, dispatch, getState);
                                resolve();
                            } else if (result.item.content && result.item.content.startsWith('s3DrawingObject/')) {
                                dispatch(setContentType('DrawingPage'));
                                const signedContentUrl = result.item.signedContentUrl;
                                const response = await XHRDownload(null, dispatch, signedContentUrl, null);

                                const buffer = Buffer.from(response, 'binary');
                                const downloadedBinaryString = buffer.toString('binary');
                                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);

                                await itemKeyReady();
                                const decryptedContent = decryptLargeBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                                debugLog(debugOn, "Decrypted string length: ", decryptedContent.length);
                                const [decryptedImageStr, embeddJSON] = decryptedContent.split(embeddJSONSeperator);
                                const decodedContent = (forge.util.decodeUtf8(decryptedImageStr));
                                const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decodedContent);
                                const blob = new Blob([decryptedImageDataInUint8Array], {
                                    type: 'image/*'
                                });
                                const link = window.URL.createObjectURL(blob);
                                blob.src = link;
                                blob.metadata = {
                                    ExcalidrawExportedImage: true,
                                    ExcalidrawSerializedJSON: embeddJSON
                                };
                                dispatch(contentDecrypted({ item: { id: data.itemId, content: blob } }));
                                resolve();
                            } else {
                                resolve();
                            }
                        } else {
                            if (data.navigationInSameContainer) {
                                debugLog(debugOn, "setNavigationMode ...");
                                dispatch(setNavigationMode(true));
                                dispatch(setNavigationInSameContainer(false));
                                resolve();
                                return;
                            }
                            if (!data.navigationInSameContainer && (data.itemId.startsWith('np') || data.itemId.startsWith('dp'))) {
                                try {
                                    const container = await getContainerData(data.itemId);
                                    state = getState().page;
                                    if (data.itemId === state.activeRequest) {
                                        dispatch(containerDataFetched({ itemId: data.itemId, container }));
                                        resolve();
                                    } else {
                                        reject("Aborted");
                                    }
                                } catch (error) {
                                    reject("Failed to get the container data!");
                                }
                            } else {
                                reject("Failed to get a page item!!!");
                            }
                        }
                        const draftId = 'Draft-' + data.itemId;
                        const draft = localStorage.getItem(draftId);
                        if (draft) {
                            dispatch(setDraft(draft));
                        }

                    } else {
                        debugLog(debugOn, "woo... failed to get a page item!!!", result.error);
                        reject("Failed to get a page item.");
                    }
                }).catch(error => {
                    debugLog(debugOn, "woo... failed to get a page item:", error)
                    reject("Failed to get a page item.");
                })
                await getItemPath(data.itemId, dispatch, getState);
            } else {
                const result = await getDemoItemFromServiceWorkerDB(data.itemId);
                state = getState().page;
                if (result.status === 'ok') {
                    if (data.itemId !== state.activeRequest) {
                        debugLog(debugOn, "Aborted");
                        reject("Aborted");
                        return;
                    }
                    const decryptADemoItem = async (item) => {
                        dispatch(dataFetched({ item }));
                        if (item.content && item.content.startsWith('s3Object/')) {
                            dispatch(setContentType('WritingPage'));
                            const s3Key = forge.util.decode64(item.content.substring(9));
                            const result = await getS3ObjectFromServiceWorkerDB(s3Key);
                            if (result.status === 'ok') {
                                const downloadedBinaryString = result.object;
                                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                                await itemKeyReady();
                                const decryptedContent = decryptBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                                debugLog(debugOn, "Decrypted string length: ", decryptedContent.length);
                                const decodedContent = DOMPurify.sanitize(forge.util.decodeUtf8(decryptedContent));
                                dispatch(contentDecrypted({ item: { id: data.itemId, content: decodedContent } }));

                                state = getState().page;
                                startDownloadingContentImages(data.itemId, dispatch, getState);
                            }
                            resolve();
                        } else if (item.content && item.content.startsWith('s3DrawingObject/')) {
                            dispatch(setContentType('DrawingPage'));
                            const s3Key = forge.util.decode64(item.content.substring(16));
                            const result = await getS3ObjectFromServiceWorkerDB(s3Key);
                            if (result.status === 'ok') {
                                const downloadedBinaryString = result.object;
                                debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                                await itemKeyReady();
                                const decryptedContent = decryptLargeBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                                debugLog(debugOn, "Decrypted string length: ", decryptedContent.length);
                                const [decryptedImageStr, embeddJSON] = decryptedContent.split(embeddJSONSeperator);
                                const decodedContent = (forge.util.decodeUtf8(decryptedImageStr));
                                const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decodedContent);
                                const blob = new Blob([decryptedImageDataInUint8Array], {
                                    type: 'image/*'
                                });
                                const link = window.URL.createObjectURL(blob);
                                blob.src = link;
                                blob.metadata = {
                                    ExcalidrawExportedImage: true,
                                    ExcalidrawSerializedJSON: embeddJSON
                                };
                                dispatch(contentDecrypted({ item: { id: data.itemId, content: blob } }));
                            }
                            resolve();
                        } else {
                            resolve();
                        }
                    }

                    if (result.item) {
                        const item = result.item;
                        await decryptADemoItem(item);
                    } else {
                        if (data.itemId.startsWith('p:') || data.itemId.startsWith('n:') || data.itemId.startsWith('d:')) {
                            const workspace = getState().container.workspace;
                            const workspaceKey = getState().container.workspaceKey;
                            const searchKey = getState().container.searchKey;
                            const searchIV = getState().container.searchIV;
                            const item = await addADemoItemToServiceWorkerDB(workspace, workspaceKey, searchKey, searchIV, data.itemId);
                            if (item) {
                                await decryptADemoItem(item);
                            }
                            resolve();
                        } else {
                            if (data.navigationInSameContainer) {
                                debugLog(debugOn, "setNavigationMode ...");
                                dispatch(setNavigationMode(true));
                                dispatch(setNavigationInSameContainer(false));
                                resolve();
                                return;
                            }
                            if (!data.navigationInSameContainer && (data.itemId.startsWith('np') || data.itemId.startsWith('dp'))) {
                                try {
                                    const container = await getContainerData(data.itemId);
                                    state = getState().page;
                                    if (data.itemId === state.activeRequest) {
                                        dispatch(containerDataFetched({ itemId: data.itemId, container }));
                                        resolve();
                                    } else {
                                        reject("Aborted");
                                    }
                                } catch (error) {
                                    reject("Failed to get the container data!");
                                }
                            } else {
                                reject("Failed to get a page item!!!");
                            }
                        }
                    }
                    const draftId = 'Draft-' + data.itemId;
                    const draft = localStorage.getItem(draftId);
                    if (draft) {
                        dispatch(setDraft(draft));
                    }

                } else {
                    debugLog(debugOn, "woo... failed to get a page item!!!", result.error);
                    reject("Failed to get a page item.");
                }
            }
        });
    });
}

export const getItemPathThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.GetItemPath, () => {
        return new Promise(async (resolve, reject) => {
            try {
                await getItemPath(data.itemId, dispatch, getState)
                resolve();
            } catch (error) {
                reject();
            }
        });
    })
}

export const decryptPageItemThunk = (data) => async (dispatch, getState) => {
    let state;
    state = getState().page;
    const workspace = getState().container.workspace;
    newActivity(dispatch, pageActivity.DecryptPageItem, () => {
        const itemId = data.itemId;
        const startDownloadingImages = async () => {
            state = getState().page;
            const downloadAnImage = (image) => {
                return new Promise(async (resolve, reject) => {
                    const s3Key = image.s3Key + (image.forVideo ? '' : "_gallery");
                    let downloadedBinaryString, decryptedImageStr;
                    try {
                        if (!workspace.startsWith("d:")) {
                            dispatch(downloadingImage({ itemId, progress: 5 }));
                            const signedURL = await preS3Download(state.id, s3Key, dispatch);
                            dispatch(downloadingImage({ itemId, progress: 10 }));
                            const response = await XHRDownload(itemId, dispatch, signedURL, downloadingImage);
                            debugLog(debugOn, "downloadAnImage completed. Length: ", response.byteLength);
                            if (itemId !== state.activeRequest) {
                                debugLog(debugOn, "Aborted!");
                                reject("Aborted")
                                return;
                            };
                            const buffer = Buffer.from(response, 'binary');
                            downloadedBinaryString = buffer.toString('binary');
                        } else {
                            const result = await getS3ObjectFromServiceWorkerDB(s3Key);
                            if (result.status === 'ok') {
                                downloadedBinaryString = result.object;
                            } else {
                                throw new Error("Failed to read an image data from service worker DB!");
                            }
                        }
                        debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                        decryptedImageStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                        debugLog(debugOn, "Decrypted image string length: ", decryptedImageStr.length);

                        const decryptedImageDataInUint8Array = convertBinaryStringToUint8Array(decryptedImageStr);
                        const link = window.URL.createObjectURL(new Blob([decryptedImageDataInUint8Array]), {
                            type: 'image/*'
                        });

                        let img = new Image();
                        img.src = link;

                        img.onload = () => {
                            dispatch(imageDownloaded({ itemId, link, width: img.width, height: img.height }));
                            resolve();
                        }


                    } catch (error) {
                        dispatch(imageDownloadFailed({ itemId }));
                        debugLog(debugOn, 'downloadFromS3 error: ', error)
                        reject("Failed to download an image.");
                    }
                });
            }
            while (state.imageDownloadIndex < state.imageDownloadQueue.length) {
                if (state.aborted) {
                    debugLog(debugOn, "abort: ", state.aborted);
                    break;
                }
                const image = state.imageDownloadQueue[state.imageDownloadIndex];
                try {
                    await downloadAnImage(image);
                } catch (error) {

                }
                state = getState().page;
            }
        };

        return new Promise(async (resolve, reject) => {
            if (itemId !== state.activeRequest) {
                reject("Aborted")
                return;
            };
            dispatch(decryptPageItem({ itemId, workspaceKey: data.workspaceKey }));
            state = getState().page;
            startDownloadingContentImages(itemId, dispatch, getState);

            if (state.imageDownloadQueue.length) {
                startDownloadingImages();
            }
            resolve();
        });
    });
}

export const getItemVersionsHistoryThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.GetVersionsHistory, () => {
        return new Promise(async (resolve, reject) => {
            const state = getState().page;
            const pageItemId = state.id;
            PostCall({
                api: '/memberAPI/getItemVersionsHistory',
                body: {
                    itemId: state.id,
                    size: state.versionsPerPage,
                    from: (data.page - 1) * state.versionsPerPage,
                },
                dispatch
            }).then(result => {
                debugLog(debugOn, result);
                if (result.status === 'ok') {
                    if (result.hits) {
                        const hits = result.hits.hits;
                        const modifiedHits = hits.map(hit => {
                            const updatedTime = formatTimeDisplay(hit._source.createdTime);
                            const payload = {
                                id: pageItemId,
                                version: hit._source.version,
                                container: hit._source.container,
                                updatedText: hit._source.version === 1 ? "Creation" : "Updated " + hit._source.update,
                                updatedBy: DOMPurify.sanitize(hit._source.displayName ? hit._source.displayName : hit._source.updatedBy),
                                updatedTime,
                                updatedTimeStamp: updatedTime.charAt(updatedTime.length - 1) === 'o' ? timeToString(hit._source.createdTime) : ''
                            }
                            return payload;
                        });
                        dispatch(itemVersionsFetched({ page: data.page, total: result.hits.total, modifiedHits }));
                        resolve();
                    } else {
                        reject("Failed to get the item version history!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a item version history!", data.error);
                    reject("Failed to get the item version history!");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... failed to get a item version history.", error)
                reject("Failed to get the item version history!");
            })
        });
    });
}

export const downloadVideoThunk = (data) => async (dispatch, getState) => {
    const video = data;
    const fromContent = video.fromContent;

    let state = getState().page;
    const indexInVideosDownloadQueue = state.videosDownloadQueue.length;
    const indexInContentVideosDownloadQueue = state.contentVideosDownloadQueue.length;;
    const itemId = state.id;
    const isUsingServiceWorker = true;

    if (state.videosDownloadQueue.length === 0 && state.contentVideosDownloadQueue.length === 0) {
        navigator.serviceWorker.addEventListener("message", async (event) => {
            debugLog(debugOn, event.data);
            /*This happens when playing from html video player, but the stream does not exist.*/
            if (event.data.type === 'STREAM_NOT_FOUND') {
                let videoLinkFromServiceWorker = '/downloadFile/video/' + event.data.id;
                state = getState().page;
                let video = null;
                let i;
                for (i = 0; i < state.videosDownloadQueue.length; i++) {
                    video = state.videosDownloadQueue[i];
                    if (video.src === videoLinkFromServiceWorker) break;
                }
                if (!video) {
                    for (i = 0; i < state.contentVideosDownloadQueue.length; i++) {
                        video = state.contentVideosDownloadQueue[i];
                        if (video.src === videoLinkFromServiceWorker) break;
                    }
                }
                if (video) {
                    let start = event.data.start;
                    await downloadAVideo(video, i, true, start);
                }
            }
        });
    }
    if (fromContent) {
        dispatch(downloadContentVideo(data))
    } else {
        dispatch(downloadVideo(data));
    }

    const downloadAVideo = (video, indexInQueue, resumeForNewStream = false, start = 0) => {
        debugLog(debugOn, "downloadAVideo");
        let decryptedVideoStr, videoStarted = false;
        return new Promise(async (resolve, reject) => {

            if (video.numberOfChunks) {
                let s3KeyPrefix, encrytedFileName, fileName, fileType, fileSize, numberOfChunks, messageChannel, fileInUint8Array, fileInUint8ArrayIndex, videoLinkFromServiceWorker;

                if (fromContent) {
                    encrytedFileName = atob(video.fileName);
                    fileName = decryptBinaryString(encrytedFileName, state.itemKey, state.itemIV);
                    fileName = decodeURI(fileName);
                } else {
                    fileName = video.fileName;
                }

                fileType = decodeURI(video.fileType);
                fileSize = video.fileSize;
                numberOfChunks = video.numberOfChunks;
                s3KeyPrefix = video.s3KeyPrefix;

                async function setupWriter() {
                    debugLog(debugOn, "setupWriter");
                    function talkToServiceWorker() {
                        return new Promise(async (resolve, reject) => {
                            debugLog(debugOn, "talkToServiceWorker");
                            navigator.serviceWorker.getRegistration("/").then((registration) => {
                                debugLog(debugOn, "registration: ", registration);
                                if (registration) {

                                    messageChannel = new MessageChannel();

                                    registration.active.postMessage({
                                        type: 'INIT_VIDEO_PORT',
                                        videoChunkSize: getEditorConfig().videoChunkSize,
                                        s3KeyPrefix,
                                        fileName,
                                        fileType,
                                        fileSize,
                                        browserInfo: getBrowserInfo(),
                                        resumeForNewStream,
                                        start
                                    }, [messageChannel.port2]);

                                    messageChannel.port1.onmessage = async (event) => {
                                        // Print the result
                                        debugLog(debugOn, event.data);
                                        if (event.data) {
                                            switch (event.data.type) {
                                                case 'STREAM_OPENED':
                                                    videoLinkFromServiceWorker = '/downloadFile/video/' + event.data.stream.id;

                                                    debugLog(debugOn, "STREAM_OPENED");

                                                    if (event.data.initialChunkIndex >= 0) {
                                                        await downloadDecryptAndAssemble(event.data.initialChunkIndex);
                                                    }

                                                    if (event.data.initialChunkIndex !== 0) {
                                                        if (fromContent) {
                                                            dispatch(contentVideoFromServiceWorker({ itemId, indexInQueue, link: videoLinkFromServiceWorker }));
                                                        } else {
                                                            dispatch(videoFromServiceWorker({ itemId, indexInQueue, link: videoLinkFromServiceWorker }));
                                                        }

                                                        videoStarted = true;
                                                    }


                                                    resolve();
                                                    break;
                                                case 'NEXT_CHUNK':
                                                    debugLog(debugOn, "NEXT_CHUNK: ", event.data.nextChunkIndex);
                                                    if (!videoStarted) {
                                                        if (fromContent) {
                                                            dispatch(contentVideoFromServiceWorker({ itemId, indexInQueue, link: videoLinkFromServiceWorker }));
                                                        } else {
                                                            dispatch(videoFromServiceWorker({ itemId, indexInQueue, link: videoLinkFromServiceWorker }));
                                                        }
                                                        videoStarted = true;
                                                    }
                                                    if (event.data.nextChunkIndex >= 0) {
                                                        await downloadDecryptAndAssemble(event.data.nextChunkIndex);
                                                    }
                                                    const chunksMap = event.data.chunksMap;
                                                    chunksMap.downloadingChunk = event.data.nextChunkIndex;
                                                    chunksMap.lastChunkDownloaded = (event.data.nextChunkIndex === -99999);
                                                    dispatch(updateVideoChunksMap(chunksMap));
                                                    break;
                                                case 'STREAM_CLOSED':
                                                    messageChannel.port1.onmessage = null
                                                    messageChannel.port1.close();
                                                    messageChannel.port2.close();
                                                    messageChannel = null;
                                                    break;
                                                default:
                                            }
                                        }
                                    };

                                } else {
                                    debugLog(debugOn, "serviceWorker.getRegistration error");
                                    reject("serviceWorker.getRegistration error")
                                }
                            });
                        })
                    }

                    if (!isUsingServiceWorker) {
                        fileInUint8Array = new Uint8Array(fileSize);
                        fileInUint8ArrayIndex = 0;
                        return true;
                    } else {
                        try {
                            await talkToServiceWorker();
                            return true;
                        } catch (error) {
                            debugLog(debugOn, "setupWriter failed: ", error)
                            return false;
                        }
                    }
                }

                function writeAChunkToFile(chunkIndex, chunk) {
                    debugLog(debugOn, "writeAChunkToFile");
                    return new Promise(async (resolve, reject) => {
                        if (!isUsingServiceWorker) {
                            for (let offset = 0; offset < chunk.length; offset++) {
                                if (fileInUint8ArrayIndex + offset < fileInUint8Array.length) {
                                    fileInUint8Array[fileInUint8ArrayIndex + offset] = chunk.charCodeAt(offset);
                                } else {
                                    reject("writeAChunkToFile error: fileInUint8Array overflow");
                                    return;
                                }
                            }
                            fileInUint8ArrayIndex += chunk.length;
                            resolve();
                        } else {
                            debugLog(debugOn, "BINARY: ", Date.now());
                            messageChannel.port1.postMessage({
                                type: 'BINARY',
                                chunkIndex,
                                chunk
                            });
                            resolve();
                        }
                    })
                }

                function writeAChunkToFileFailed(chunkIndex) {
                    if (!isUsingServiceWorker) {

                    } else {

                    }

                }

                function downloadDecryptAndAssemble(chunkIndex) {
                    debugLog(debugOn, "downloadDecryptAndAssemble", chunkIndex);
                    return new Promise(async (resolve, reject) => {
                        try {
                            let result = await preS3ChunkDownload(state.id, chunkIndex, s3KeyPrefix, false, dispatch);
                            let response;
                            if (fromContent) {
                                response = await XHRDownload(state.id, dispatch, result.signedURL, downloadingContentVideo, chunkIndex * 100 / numberOfChunks, 1 / numberOfChunks, indexInContentVideosDownloadQueue);
                            } else {
                                response = await XHRDownload(state.id, dispatch, result.signedURL, downloadingVideo, chunkIndex * 100 / numberOfChunks, 1 / numberOfChunks, indexInVideosDownloadQueue);
                            }

                            debugLog(debugOn, "downloadChunk completed. Length: ", response.byteLength);
                            if (state.activeRequest !== itemId) {
                                reject("Aborted");
                                return;
                            }


                            let buffer = Buffer.from(response, 'binary');
                            let downloadedBinaryString = buffer.toString('binary');
                            debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                            let decryptedChunkStr = await decryptChunkBinaryStringToBinaryStringAsync(downloadedBinaryString, state.itemKey)
                            debugLog(debugOn, "Decrypted chunk string length: ", decryptedChunkStr.length);

                            await writeAChunkToFile(chunkIndex, decryptedChunkStr);


                            resolve();
                        } catch (error) {
                            debugLog(debugOn, "downloadDecryptAndAssemble failed: ", error);
                            writeAChunkToFileFailed(chunkIndex);
                            reject("downloadDecryptAndAssemble error.");
                        }
                    });
                }

                if (!(await setupWriter())) {
                    reject("setupWriter failed");
                    return;
                };

            } else {
                const s3Key = video.s3Key;

                try {
                    dispatch(downloadingContentVideo({ itemId, progress: 5 }));
                    const signedURL = await preS3Download(state.id, s3Key, dispatch);
                    dispatch(downloadingContentVideo({ itemId, progress: 10 }));
                    const response = await XHRDownload(itemId, dispatch, signedURL, downloadingContentVideo)
                    debugLog(debugOn, "downloadAVideo completed. Length: ", response.byteLength);

                    const buffer = Buffer.from(response, 'binary');
                    const downloadedBinaryString = buffer.toString('binary');
                    debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                    decryptedVideoStr = decryptLargeBinaryString(downloadedBinaryString, state.itemKey, state.itemIV)
                    debugLog(debugOn, "Decrypted image string length: ", decryptedVideoStr.length);

                    const decryptedVideoDataInUint8Array = convertBinaryStringToUint8Array(decryptedVideoStr);
                    const link = window.URL.createObjectURL(new Blob([decryptedVideoDataInUint8Array]), {
                        type: 'video/*'
                    });

                    dispatch(contentVideoDownloaded({ itemId, indexInQueue, link }));
                    resolve();

                } catch (error) {
                    debugLog(debugOn, 'downloadFromS3 error: ', error)
                    reject("Failed to download and decrypt a video chunk.");
                }
            }
        });
    }

    return new Promise(async (resolve, reject) => {

        state = getState().page;
        debugLog(debugOn, `downloadVideoThunk: videosDownloadQueue index:${indexInVideosDownloadQueue}, length: ${state.videosDownloadQueue.length}`);
        debugLog(debugOn, `downloadVideoThunk: contentVideosDownloadQueue index:${indexInContentVideosDownloadQueue}, length: ${state.contentVideosDownloadQueue.length}`);
        try {
            if (fromContent) {
                await downloadAVideo(video, indexInContentVideosDownloadQueue);
            } else {
                await downloadAVideo(video, indexInVideosDownloadQueue);
            }
            resolve();
        } catch (error) {
            reject("Failed to download a video.");
        }

    });
}

async function createNewItemVersion(itemCopy, dispatch) {
    return new Promise(async (resolve, reject) => {
        const workspace = itemCopy.space;
        itemCopy.version = itemCopy.version + 1;
        debugLog(debugOn, "item copy version: ", itemCopy.version);
        if (!workspace.startsWith("d:")) {
            PostCall({
                api: '/memberAPI/createNewItemVersion',
                body: {
                    itemId: itemCopy.id,
                    itemVersion: JSON.stringify(itemCopy)
                },
                dispatch
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, `createNewItemVersion succeeded`);
                    resolve(data)
                } else {
                    debugLog(debugOn, `createNewItemVersion failed: `, data.error)
                    reject("Failed to create a new item version.");
                }
            }).catch(error => {
                debugLog(debugOn, `createNewItemVersion failed.`)
                reject("Failed to create a new item version.");
            })
        } else {
            const params = {
                table: 'itemVersions',
                key: itemCopy.id,
                data: itemCopy
            }
            const result = await writeDataToServiceWorkerDBTable(params);
            if (result.status === 'ok') {
                resolve({ status: "ok", usage: JSON.stringify(itemCopy.usage) });
            } else {
                reject();
            }
        }
    });
};


function createNewItemVersionForPage(itemCopy, dispatch) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await createNewItemVersion(itemCopy, dispatch);
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


function createANotebookPage(data, dispatch) {
    return new Promise(async (resolve, reject) => {
        const workspace = data.space;
        if (!workspace.startsWith("d:")) {
            PostCall({
                api: '/memberAPI/createANotebookPage',
                body: data,
                dispatch
            }).then(result => {
                debugLog(debugOn, result);

                if (result.status === 'ok') {
                    if (result.item) {
                        resolve(result.item);
                    } else {
                        debugLog(debugOn, "woo... failed to create a notebook page!", data.error);
                        reject("Failed to create a notebook page!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to create a notebook page!", data.error);
                    reject("Failed to create a notebook page!");
                }
            });
        } else {
            const item = prepareADemoPageItem(workspace, 'NP', data);
            const itemIdParts = item.id.split(':');
            const pageNumber = parseInt(itemIdParts[itemIdParts.length - 1]);
            item.pageNumber = pageNumber;
            const params = {
                table: 'itemVersions',
                key: item.id,
                data: item
            }
            const result = await writeDataToServiceWorkerDBTable(params);
            if (result.status === 'ok') {
                resolve(item);
            } else {
                reject();
            }
        }
    });
}

function createADiaryPage(data, dispatch) {
    return new Promise(async (resolve, reject) => {
        const workspace = data.space;
        if (!workspace.startsWith("d:")) {
            PostCall({
                api: '/memberAPI/createADiaryPage',
                body: data,
                dispatch
            }).then(result => {
                debugLog(debugOn, result);

                if (result.status === 'ok') {
                    if (result.item) {
                        resolve(result.item);
                    } else {
                        debugLog(debugOn, "woo... failed to create a diary page!", data.error);
                        reject("Failed to create a diary page!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to create a diary page!", data.error);
                    reject("Failed to create a diary page!");
                }
            });
        } else {
            const item = prepareADemoPageItem(workspace, 'DP', data);
            const itemIdParts = item.id.split(':');
            const pageDate = parseInt(itemIdParts[itemIdParts.length - 1].replace(/-/g, ""));
            item.pageNumber = pageDate;
            const params = {
                table: 'itemVersions',
                key: item.id,
                data: item
            }
            const result = await writeDataToServiceWorkerDBTable(params);
            if (result.status === 'ok') {
                resolve(item);
            } else {
                reject();
            }
        }
    });
}

function createANewPage(dispatch, getState, pageState, newPageData, updatedState) {
    return new Promise(async (resolve, reject) => {
        let item;
        const workspace = getState().container.workspace;
        newPageData.space = workspace;
        newPageData.container = pageState.container;
        if (workspace.startsWith("d:")) {
            if (newPageData.tags) {
                newPageData.tags = JSON.parse(newPageData.tags);
            }
            if (newPageData.tagsTokens) {
                newPageData.tagsTokens = JSON.parse(newPageData.tagsTokens);
            }
            if (newPageData.titleTokens) {
                newPageData.titleTokens = JSON.parse(newPageData.titleTokens);
            }
            if (newPageData.videos) {
                newPageData.videos = JSON.parse(newPageData.videos)
            }
            if (newPageData.images) {
                newPageData.images = JSON.parse(newPageData.images);
            }
        }
        if (pageState.container.substring(0, 1) === 'f') {

        } else if (pageState.container.substring(0, 1) === 'n') {
            try {
                item = await createANotebookPage(newPageData, dispatch);
                dispatch(newItemCreated({
                    ...updatedState,
                    itemCopy: item
                }));
                resolve();
            } catch (error) {
                debugLog(debugOn, "createANotebookPage failed: ", error);
                reject("Failed to create a notebook page.");
            }
        } else if (pageState.container.substring(0, 1) === 'd') {
            try {
                item = await createADiaryPage(newPageData, dispatch);
                dispatch(newItemCreated({
                    ...updatedState,
                    itemCopy: item
                }));
                resolve();
            } catch (error) {
                debugLog(debugOn, "createADiaryPage failed: ", error);
                reject("Failed to create a diary page.");
            }
        }
    });
}

export const saveTagsThunk = (tags, workspaceKey, searchKey, searchIV) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveTags, () => {
        const workspace = getState().container.workspace;
        return new Promise(async (resolve, reject) => {
            let auth, state, encryptedTags, tagsTokens, itemKey, keyEnvelope, newPageData, updatedState;
            auth = getState().auth;
            state = getState().page;
            try {
                if (auth.accountVersion === 'v1') {
                    tagsTokens = tokenfieldToEncryptedTokensECB(tags, searchKey)
                } else {
                    tagsTokens = tokenfieldToEncryptedTokensCBC(tags, searchKey, searchIV);
                }
                if (!state.itemCopy) {
                    try {
                        itemKey = generateNewItemKey();
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
                        await createANewPage(dispatch, getState, state, newPageData, updatedState);
                        if (workspace.startsWith("d:")) {
                            const params = {
                                action: "INDEX_A_PAGE",
                                itemId: state.id,
                                tokens: tagsTokens
                            }
                            await writeDataToServiceWorkerDB(params);
                        }
                        resolve();
                    } catch (error) {
                        reject("Failed to create a new page with tags.");
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

                    await createNewItemVersionForPage(itemCopy, dispatch);
                    if (workspace.startsWith("d:")) {
                        const params = {
                            action: "INDEX_A_PAGE",
                            itemId: state.id,
                            tokens: tagsTokens
                        }
                        await writeDataToServiceWorkerDB(params);
                    }
                    dispatch(newVersionCreated({
                        itemCopy,
                        tags
                    }));
                    resolve();
                }
            } catch (error) {
                reject("Failed to save tags.");
            }
        });
    })
}

export const saveTitleThunk = (title, workspaceKey, searchKey, searchIV) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveTitle, () => {
        return new Promise(async (resolve, reject) => {
            let auth, state, titleText, encodedTitle, encryptedTitle, titleTokens, itemKey, keyEnvelope, newPageData, updatedState;
            auth = getState().auth;
            state = getState().page;
            try {
                titleText = extractHTMLElementText(title);
                encodedTitle = forge.util.encodeUtf8(title);
                if (auth.accountVersion === 'v1') {
                    titleTokens = stringToEncryptedTokensECB(titleText, searchKey)
                } else {
                    titleTokens = stringToEncryptedTokensCBC(titleText, searchKey, searchIV);
                }

                if (!state.itemCopy) {
                    try {
                        itemKey = generateNewItemKey();
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

                        await createANewPage(dispatch, getState, state, newPageData, updatedState);
                        resolve();
                    } catch (error) {
                        reject("Failed to create a new page with title.");
                    }
                } else {
                    encryptedTitle = encryptBinaryString(encodedTitle, state.itemKey);

                    let itemCopy = {
                        ...state.itemCopy
                    }

                    itemCopy.title = forge.util.encode64(encryptedTitle);
                    itemCopy.titleTokens = titleTokens;
                    itemCopy.update = "title";

                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy,
                        title,
                        titleText
                    }));
                    resolve();
                }
            } catch (error) {
                reject("Failed to save title.");
            }

        });
    })
}

async function preProcessEditorContentBeforeSaving(content, contentType) {
    if (contentType === "DrawingPage") {
        const ExcalidrawSerializedJSON = content.metadata.ExcalidrawSerializedJSON;
        const DataURI = await new Promise((resolve) => {
            const img = new Image();
            img.src = content.src;
            img.onload = async () => {
                const result = await downScaleImage(img, null, 720);
                resolve(result.byteString)
            }
        });
        return {
            content: DataURI + embeddJSONSeperator + ExcalidrawSerializedJSON,
            s3ObjectsInContent: [],
            s3ObjectsSize: 0
        }
    }
    var tempElement = document.createElement("div");
    tempElement.innerHTML = content;
    //Remove all spinners, progress elements, videoControls
    const spinners = tempElement.querySelectorAll(".bsafesMediaSpinner");
    spinners.forEach((item) => {
        item.remove();
    });
    const progressElements = tempElement.querySelectorAll(".progress");
    progressElements.forEach((item) => {
        item.remove();
    });
    const videoControlsElements = tempElement.querySelectorAll(".videoControls");
    videoControlsElements.forEach((item) => {
        item.remove();
    });

    const images = tempElement.querySelectorAll(".bSafesImage");
    let s3ObjectsInContent = [];
    let totalS3ObjectsSize = 0;
    images.forEach((item) => {
        const id = item.id;
        const idParts = id.split('&');
        const s3Key = idParts[0].split('/').pop();
        const dimension = idParts[1];
        const size = parseInt(idParts[2]);
        s3ObjectsInContent.push({
            s3Key: s3Key,
            size: size
        });
        totalS3ObjectsSize += size;
        const placeholder = `https://placehold.co/${dimension}?text=Image`;
        item.src = placeholder;
    });

    images.forEach((item) => { // Clean up any bSafes status class
        item.classList.remove('bSafesDisplayed');
        item.classList.remove('bSafesDownloading');
    });

    const videoImages = tempElement.querySelectorAll(".bSafesDownloadVideo");
    videoImages.forEach((item) => {

        const placeholder = 'https://placehold.co/600x400?text=Video';
        item.src = placeholder;
    });

    videoImages.forEach((item) => { // Clean up any bSafes status class
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
        if (item.classList.contains('fr-dvb')) videoImg.classList.add('fr-dib');
        if (item.classList.contains('fr-dvi')) videoImg.classList.add('fr-dii');
        if (item.classList.contains('fr-fvl')) videoImg.classList.add('fr-fil');
        if (item.classList.contains('fr-fvc')) videoImg.classList.add('fr-fic');
        if (item.classList.contains('fr-fvr')) videoImg.classList.add('fr-fir');

        videoImg.id = videoId;
        videoImg.style = videoStyle;

        const placeholder = 'https://placehold.co/600x400?text=Video';
        videoImg.src = placeholder;
        item.replaceWith(videoImg);
    });

    const videoImgs = tempElement.querySelectorAll('.bSafesDownloadVideo');
    videoImgs.forEach((item) => {
        const id = item.id;
        const idParts = id.split('&');
        const s3Key = idParts[idParts.length - 3].split('/').pop();
        const size = parseInt(idParts[idParts.length - 1]);
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

const getS3SignedUrlForContentUpload = (dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/preS3Upload',
            body: {
                type: 'content'
            },
            dispatch
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                const s3Key = data.s3Key;
                const signedURL = data.signedURL;
                resolve({ s3Key, signedURL, expiration: Date.now() + 3000 * 1000 });
            } else {
                debugLog(debugOn, "preS3Upload failed: ", data.error);
                reject("preS3Upload error.");
            }
        }).catch(error => {
            debugLog(debugOn, "preS3Upload failed: ", error)
            reject("preS3Upload error.");
        })
    });
};

export const getS3SignedUrlForContentUploadThunk = (data) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
        const page = getState().page;
        const workspace = page.space;
        const demoOwner = workspace.split(":")[1];
        if (!workspace.startsWith("d:")) {
            try {
                dispatch(setS3SignedUrlForContentUpload(null));
                const signedURLData = await getS3SignedUrlForContentUpload(dispatch);
                dispatch(setS3SignedUrlForContentUpload(signedURLData));
                resolve();
            } catch {
                reject();
            }
        } else {
            dispatch(setS3SignedUrlForContentUpload(`demo://${demoOwner}:3:${Date.now()}`));
        }
    });
}

export const saveDraftThunk = (data) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
        const content = data.content;

        let state, encodedContent;
        state = getState().page;
        const result = await preProcessEditorContentBeforeSaving(content);

        try {
            encodedContent = forge.util.encodeUtf8(result.content);
            const draftId = 'Draft-' + state.id;
            localStorage.setItem(draftId, encodedContent);
            dispatch(setDraft(encodedContent));
            resolve();
        } catch (error) {
            alert('error');
            reject("Failed to save draft.");
        }

    });
}

export const loadDraftThunk = (data) => async (dispatch, getState) => {
    dispatch(draftLoaded());
}

export const startDownloadingContentImagesForDraftThunk = (data) => async (dispatch, getState) => {
    const state = getState().page;
    startDownloadingContentImages(state.id, dispatch, getState);
}

export const loadOriginalContentThunk = (data) => async (dispatch, getState) => {
    dispatch(loadOriginalContent());
    const state = getState().page;
    if (state.contentImagesDownloadQueue.length) {
        startDownloadingContentImages(state.id, dispatch, getState);
    }
}

export const saveContentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveContent, () => {
        return new Promise(async (resolve, reject) => {
            const content = data.content;
            const workspaceKey = data.workspaceKey;
            let state, encodedContent, encryptedContent, itemKey, keyEnvelope, newPageData, updatedState, s3Key, signedURL, s3ContentPrefix;
            state = getState().page;
            const workspace = getState().container.workspace;;
            const result = await preProcessEditorContentBeforeSaving(content, state.contentType);
            const s3ObjectsInContent = result.s3ObjectsInContent;
            const s3ObjectsSize = result.s3ObjectsSize;

            function uploadContentToS3(data) {
                return new Promise(async (resolve, reject) => {
                    if (!workspace.startsWith("d:")) {
                        try {
                            let signedURLData = state.S3SignedUrlForContentUpload;
                            if (Date.now() > signedURLData.expiration) {
                                signedURLData = await getS3SignedUrlForContentUpload(dispatch);
                            }
                            s3Key = signedURLData.s3Key;
                            signedURL = signedURLData.signedURL;

                            const config = {
                                onUploadProgress: async (progressEvent) => {
                                    let percentCompleted = Math.ceil(progressEvent.loaded * 100 / progressEvent.total);
                                    debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                                },
                                headers: {
                                    'Content-Type': 'binary/octet-stream'
                                }
                            }
                            dispatch(setS3SignedUrlForContentUpload(null));
                            await putS3Object(s3Key, signedURL, data, config, dispatch);
                            resolve();
                        } catch (error) {
                            debugLog(debugOn, "uploadContentToS3 failed: ", error);
                            reject("uploadContentToS3 error.");
                        }
                    } else {
                        const demoOwner = workspace.split(":")[1];
                        s3Key = `${demoOwner}:3:${Date.now()}L_content`;
                        const params = {
                            table: 's3Objects',
                            key: s3Key,
                            data
                        }
                        const result = await writeDataToServiceWorkerDBTable(params);
                        if (result.status === 'ok') {
                            resolve();
                        } else {
                            reject();
                        }
                    }
                });
            }

            try {
                if (state.contentType === "DrawingPage")
                    s3ContentPrefix = "s3DrawingObject/";
                else
                    s3ContentPrefix = "s3Object/";
                encodedContent = forge.util.encodeUtf8(result.content);
                if (!state.itemCopy) {
                    try {
                        let itemKey = state.itemKey;
                        if (!itemKey) {
                            itemKey = generateNewItemKey();
                        }

                        keyEnvelope = encryptBinaryString(itemKey, workspaceKey);
                        if (state.contentType === "DrawingPage")
                            encryptedContent = encryptLargeBinaryString(encodedContent, itemKey);
                        else
                            encryptedContent = encryptBinaryString(encodedContent, itemKey);
                        await uploadContentToS3(encryptedContent);

                        newPageData = {
                            "itemId": state.id,
                            "keyEnvelope": forge.util.encode64(keyEnvelope),
                            "content": s3ContentPrefix + forge.util.encode64(s3Key),
                            "contentSize": encryptedContent.length,
                            "s3ObjectsInContent": JSON.stringify(s3ObjectsInContent),
                            "s3ObjectsSizeInContent": s3ObjectsSize,
                            "contentType": state.contentType
                        };

                        updatedState = {
                            itemKey,
                            content
                        }

                        await createANewPage(dispatch, getState, state, newPageData, updatedState);
                        dispatch(clearDraft());
                        requestAppleReview();
                        resolve();
                    } catch (error) {
                        reject("Failed to create a new page with content.");
                    }
                } else {
                    if (state.contentType === "DrawingPage")
                        encryptedContent = encryptLargeBinaryString(encodedContent, state.itemKey);
                    else
                        encryptedContent = encryptBinaryString(encodedContent, state.itemKey);
                    await uploadContentToS3(encryptedContent);
                    let itemCopy = {
                        ...state.itemCopy
                    }

                    itemCopy.content = s3ContentPrefix + forge.util.encode64(s3Key);
                    itemCopy.contentSize = encryptedContent.length;
                    itemCopy.s3ObjectsInContent = s3ObjectsInContent;
                    itemCopy.s3ObjectsSizeInContent = s3ObjectsSize;
                    itemCopy.update = "content";

                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy,
                        content
                    }));
                    dispatch(clearDraft());
                    requestAppleReview();
                    resolve();
                }
            } catch (error) {
                alert('error');
                reject("Failed to save content.");
            }
        });
    })
}

const checkIfTooManyMediaFiles = (pageState, numberOfNewFiles) => {
    return ((pageState.videoPanels.length + pageState.imagePanels.length + pageState.contentImagesDownloadQueue.length + numberOfNewFiles) > MAX_NUMBER_OF_MEDIA_FILES);
}

const uploadAVideo = (dispatch, getState, state, { file: video, numberOfChunks }, workspaceKey) => {
    const chunkSize = getEditorConfig().videoChunkSize;
    const fileType = video.type;
    const fileSize = video.size;
    const fileName = video.name;
    let i, encryptedFileSize = 0, s3KeyPrefix = 'null', startingChunk;
    let serviceWorkerReady = false, videoLinkFromServiceWorker = null, messageChannel = null;
    const workspace = getState().container.workspace;;
    // BEGIN **** For playing back video from service worker ***
    function setupWriter(s3KeyPrefix) {
        debugLog(debugOn, "setupWriter");

        return new Promise(async (resolve, reject) => {
            debugLog(debugOn, "talkToServiceWorker");
            navigator.serviceWorker.getRegistration("/").then((registration) => {
                debugLog(debugOn, "registration: ", registration);
                if (registration) {

                    messageChannel = new MessageChannel();

                    registration.active.postMessage({
                        type: 'INIT_EDITOR_VIDEO_PORT',
                        videoChunkSize: getEditorConfig().videoChunkSize,
                        s3KeyPrefix,
                        fileName,
                        fileType,
                        fileSize,
                        browserInfo: getBrowserInfo()
                    }, [messageChannel.port2]);

                    messageChannel.port1.onmessage = async (event) => {
                        // Print the result
                        debugLog(debugOn, event.data);
                        if (event.data) {
                            switch (event.data.type) {
                                case 'STREAM_OPENED':
                                    videoLinkFromServiceWorker = '/downloadFile/video/' + event.data.stream.id;

                                    debugLog(debugOn, "STREAM_OPENED");

                                    resolve();
                                    break;
                                case 'NEXT_CHUNK':

                                    break;
                                case 'STREAM_CLOSED':
                                    messageChannel.port1.onmessage = null
                                    messageChannel.port1.close();
                                    messageChannel.port2.close();
                                    messageChannel = null;
                                    break;
                                default:
                            }
                        }
                    };

                } else {
                    debugLog(debugOn, "serviceWorker.getRegistration error");
                    reject("serviceWorker.getRegistration error")
                }
            }).catch(error => {
                debugLog(debugOn, "serviceWorker.getRegistration error: ", error);
                reject(error);
            });
        })
    }

    function writeAChunkToFile(chunkIndex, chunk) {
        debugLog(debugOn, "writeAChunkToFile");
        return new Promise(async (resolve, reject) => {
            debugLog(debugOn, "BINARY: ", Date.now());
            messageChannel.port1.postMessage({
                type: 'BINARY',
                chunkIndex,
                chunk
            });
            resolve();
        })
    }

    // END **** For playing back video from service worker ***

    function sliceEncryptAndUpload(file, chunkIndex) {
        return new Promise((resolve, reject) => {
            let reader, offset, binaryData, encryptedData, fileUploadProgress = 0;

            offset = (chunkIndex) * chunkSize;
            reader = new FileReader();
            const blob = file.slice(offset, offset + chunkSize);

            function uploadAChunk(index, data) {
                let result, s3Key, signedURL, s3KeyPrefixParts, timeStamp;

                s3KeyPrefixParts = s3KeyPrefix.split(':');
                timeStamp = s3KeyPrefixParts[s3KeyPrefixParts.length - 1];

                return new Promise(async (resolve, reject) => {
                    try {
                        if (!workspace.startsWith("d:")) {
                            result = await preS3ChunkUpload(state.id, index, timeStamp);
                            fileUploadProgress = index * (100 / numberOfChunks) + 15 / numberOfChunks;
                            debugLog(debugOn, `File upload prgoress: ${fileUploadProgress}`);
                            dispatch(uploadingVideo(fileUploadProgress));

                            s3Key = result.s3Key;
                            s3KeyPrefix = result.s3KeyPrefix;
                            signedURL = result.signedURL;
                            debugLog(debugOn, 'chunk signed url', signedURL);

                            const uploader = async (data, signedURL, uploadingPlaceholder) => {
                                const config = {
                                    onUploadProgress: async (progressEvent) => {
                                        const percentCompleted = 15 + Math.ceil(progressEvent.loaded * 85 / progressEvent.total);
                                        let fileUploadProgress = index * (100 / numberOfChunks) + percentCompleted / numberOfChunks;
                                        fileUploadProgress = (Math.round(fileUploadProgress * 100) / 100).toFixed(2);
                                        debugLog(debugOn, `Chunk upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                                        debugLog(debugOn, `upload prgoress: ${fileUploadProgress}`);
                                        dispatch(uploadingPlaceholder(fileUploadProgress));
                                    },
                                    headers: {
                                        'Content-Type': 'binary/octet-stream'
                                    }
                                }
                                await putS3Object(s3Key, signedURL, data, config, dispatch);
                            }
                            await uploader(data, signedURL, uploadingVideo);
                        } else {
                            if (index === 0) {
                                const demoOwner = workspace.split(":")[1];
                                s3KeyPrefix = `${demoOwner}:3:${Date.now()}L`;
                            }
                            s3Key = `${s3KeyPrefix}_chunk_${index}`;
                            const params = {
                                table: 's3Objects',
                                key: s3Key,
                                data
                            }
                            const result = { status: 'ok' }; // await writeDataToServiceWorkerDBTable(params);
                            if (result.status !== 'ok') {
                                throw new Error("Failed to write a chunk to service worker DB!");
                            }
                            fileUploadProgress = (index + 1) * (100 / numberOfChunks);
                            debugLog(debugOn, `File upload prgoress: ${fileUploadProgress}`);
                            dispatch(uploadingVideo(fileUploadProgress));
                        }
                        if (!serviceWorkerReady) {
                            await setupWriter(s3KeyPrefix);
                            serviceWorkerReady = true;
                        }
                        await writeAChunkToFile(chunkIndex, binaryData);
                        resolve();
                    } catch (error) {
                        debugLog(debugOn, 'uploadAChunk failed: ', error);
                        reject(error);
                    }
                });
            }

            reader.onloadend = async function (e) {
                binaryData = reader.result;

                encryptedData = await encryptChunkBinaryStringToBinaryStringAsync(binaryData, state.itemKey);

                encryptedFileSize += encryptedData.length;

                try {
                    await uploadAChunk(chunkIndex, encryptedData);
                    resolve();
                } catch (error) {
                    debugLog(debugOn, 'sliceEncryptAndUpload failed: ', error);
                    reject(error);
                }
            };
            reader.readAsBinaryString(blob);
        });
    }

    return new Promise(async (resolve, reject) => {
        startingChunk = 0;
        for (i = startingChunk; i < numberOfChunks; i++) {
            try {
                debugLog(debugOn, 'sliceEncryptAndUpload chunks: ', i + '/' + numberOfChunks);
                await sliceEncryptAndUpload(video, i);
            } catch (error) {
                debugLog(debugOn, 'uploadAVideo failed: ', error);
                if (confirm("Network failure, retry?")) {
                    i--;
                } else {
                    break;
                };
            }
        }

        if (i === numberOfChunks) {
            debugLog(debugOn, `uploadAVideo done, total chunks: ${numberOfChunks} encryptedFileSize: ${encryptedFileSize}`);
            return resolve({ fileType, fileSize, s3KeyPrefix, encryptedFileSize, link: videoLinkFromServiceWorker });
        } else {
            reject("Uploadig a video failed!")
        }
    })
}

export const uploadVideosThunk = (data) => async (dispatch, getState) => {
    let state, workspaceKey, itemKey, video, uploadResult;
    state = getState().page;
    workspaceKey = data.workspaceKey;
    if (checkIfTooManyMediaFiles(state, data.files.length)) {
        alert(`Sorry, please limit the number of media files to ${MAX_NUMBER_OF_MEDIA_FILES} per page!`)
        return;
    }
    if (state.activity & pageActivity.UploadVideos) {
        dispatch(addUploadVideos({ files: data.files, where: data.where }));
        return;
    }

    function doneUploadAVideo() {
        debugLog(debugOn, 'doneUploadAVideo ...');
        const videos = [];

        const findVideoWordsByKey = (videos, s3KeyPrefix) => {
            if (!videos) return null;
            for (let i = 0; i < videos.length; i++) {
                if (videos[i].s3KeyPrefix === s3KeyPrefix) {
                    return videos[i].words;
                }
            }
            return null;
        }

        for (let i = 0; i < state.videoPanels.length; i++) {
            const videoPanel = state.videoPanels[i];
            let video = { s3KeyPrefix: videoPanel.s3KeyPrefix, fileType: videoPanel.fileType, fileName: videoPanel.fileName, fileSize: videoPanel.fileSize, encryptedFileSize: videoPanel.encryptedFileSize, numberOfChunks: videoPanel.numberOfChunks };

            if (videoPanel.queueId.startsWith('d')) {
                video.fileName = forge.util.encode64(encryptBinaryString(encodeURI(videoPanel.fileName), state.itemKey))
            }
            let words = null;
            if (state.itemCopy) words = findVideoWordsByKey(state.itemCopy.videos, video.s3KeyPrefix);
            video.words = words;
            videos.push(video);
        }

        return new Promise(async (resolve, reject) => {
            if (!state.itemCopy) {
                try {
                    let keyEnvelope = encryptBinaryString(state.itemKey, workspaceKey);

                    let newPageData = {
                        itemId: state.id,
                        keyEnvelope: forge.util.encode64(keyEnvelope),
                        videos: JSON.stringify(videos)
                    };

                    let updatedState = {
                    };

                    await createANewPage(dispatch, getState, state, newPageData, updatedState);
                    resolve();
                } catch (error) {
                    reject("Failed to create a new page with attachment.");
                }
            } else {
                let itemCopy = {
                    ...state.itemCopy
                }
                try {
                    itemCopy.videos = videos;
                    itemCopy.update = "videos";
                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy
                    }));
                    resolve();
                } catch (error) {
                    reject("Failed to add an video.");
                }
            }
        })
    }

    newActivity(dispatch, pageActivity.UploadVideos, () => {
        return new Promise(async (resolve, reject) => {
            state = getState().page;
            if (!state.itemCopy) {
                itemKey = generateNewItemKey();
                dispatch(newItemKey({ itemKey }));
            }
            dispatch(addUploadVideos({ files: data.files, where: data.where }));
            state = getState().page;
            while (state.videosUploadQueue.length > state.videosUploadIndex) {
                if (state.aborted) {
                    debugLog(debugOn, "abort: ", state.aborted);
                    break;
                }
                debugLog(debugOn, "======================= Uploading file: ", `index: ${state.videosUploadIndex} name: ${state.videosUploadQueue[state.videosUploadIndex].file.name}`)
                video = state.videosUploadQueue[state.videosUploadIndex];
                try {
                    uploadResult = await uploadAVideo(dispatch, getState, state, video, workspaceKey);
                    dispatch(videoUploaded(uploadResult));
                    state = getState().page;
                    await doneUploadAVideo(uploadResult);
                    state = getState().page;
                } catch (error) {
                    debugLog(debugOn, 'uploadVideosThunk failed: ', error);
                    reject("Failed to upload a Video.");
                    break;
                }
            }
            if (state.videosUploadQueue.length === state.videosUploadIndex) {
                resolve();
            }
            if (process.env.NEXT_PUBLIC_platform === 'android') {
                if (Android) {
                    console.log("Calling Android.deleteTemporaryFiles")
                    Android.deleteTemporaryFiles();
                }
            }
        });
    });
}

export const uploadVideoSnapshotThunk = (data) => async (dispatch, getState) => {
    let state = getState().page;
    let s3Key;
    const itemId = state.id;
    const workspace = getState().container.workspace;;
    const s3KeyPrefix = data.s3KeyPrefix;
    const snapshot = data.snapshot;
    let timeStamp = s3KeyPrefix.split(':').pop();
    const encryptedStr = encryptLargeBinaryString(snapshot, state.itemKey);
    try {
        if (!workspace.startsWith("d:")) {
            const result = await preS3ChunkUpload(itemId, getEditorConfig().videoThumbnailIndex, timeStamp);
            const s3Key = result.s3Key;
            const signedURL = result.signedURL;
            const config = {
                onUploadProgress: async (progressEvent) => {
                    let percentCompleted = Math.ceil(progressEvent.loaded * 100 / progressEvent.total);
                    debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                },
                headers: {
                    'Content-Type': 'binary/octet-stream'
                }
            }
            await putS3Object(s3Key, signedURL, encryptedStr, config, dispatch);
        } else {
            s3Key = `${s3KeyPrefix}_chunk_${getEditorConfig().videoThumbnailIndex}`
            const params = {
                table: 's3Objects',
                key: s3Key,
                data: encryptedStr
            }
            const result = await writeDataToServiceWorkerDBTable(params);
            if (result.status !== 'ok') {
                throw new Error("Failed to write a chunk to service worker DB!");
            }
        }
    } catch (error) {
        console.log("uploadSnapshot failed");
    }
}

const uploadAnImage = async (dispatch, getState, state, file) => {
    let img;
    let exifOrientation;
    let imageDataInBinaryString;
    let totalUploadedSize = 0;
    const workspace = getState().container.workspace;
    const demoOwner = workspace.split(":")[1];

    const downscaleImgAndEncryptInBinaryString = (size) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await downScaleImage(img, exifOrientation, size);
                const originalStr = result.byteString;
                const encryptedStr = encryptLargeBinaryString(originalStr, state.itemKey);
                resolve(encryptedStr);
            } catch (error) {
                debugLog(debugOn, "_downScaleImage failed: ", error);
                reject("_downScaleImage error.");
            }
        });
    };

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        const startUploadingAnImage = async () => {
            debugLog(debugOn, 'startUploadingAnImage');

            let uploadOriginalImgPromise = null, uploadGalleryImgPromise = null, uploadThumbnailImgPromise = null;

            const uploadImagesToS3 = (data) => {
                let s3Key, s3KeyGallery, s3KeyThumbnail, signedURL, signedGalleryURL, signedThumbnailURL;
                let uploadingSubImages = false;
                debugLog(debugOn, 'uploadImagesToS3')
                return new Promise(async (resolve, reject) => {
                    const preImagesS3Upload = () => {
                        return new Promise(async (resolve, reject) => {
                            if (!workspace.startsWith("d:")) {
                                PostCall({
                                    api: '/memberAPI/preS3Upload',
                                    dispatch
                                }).then(data => {
                                    debugLog(debugOn, data);
                                    if (data.status === 'ok') {
                                        s3Key = data.s3Key;
                                        s3KeyGallery = s3Key + '_gallery';
                                        s3KeyThumbnail = s3Key + '_thumbnail';
                                        signedURL = data.signedURL;
                                        signedGalleryURL = data.signedGalleryURL;
                                        signedThumbnailURL = data.signedThumbnailURL;
                                        resolve();
                                    } else {
                                        debugLog(debugOn, "preS3Upload failed: ", data.error);
                                        reject("preS3Upload error.");
                                    }
                                }).catch(error => {
                                    debugLog(debugOn, "preS3Upload failed: ", error)
                                    reject("preS3Upload error.");
                                })
                            } else {
                                s3Key = `${demoOwner}:3:${Date.now()}L`;
                                s3KeyGallery = s3Key + '_gallery';
                                s3KeyThumbnail = s3Key + '_thumbnail';
                                resolve();
                            }
                        });
                    };
                    try {
                        await preImagesS3Upload();
                        dispatch(uploadingImage(5));
                        totalUploadedSize += data.length;
                        const galleryImgString = await downscaleImgAndEncryptInBinaryString(720);
                        totalUploadedSize += galleryImgString.length;
                        debugLog(debugOn, "galleryString length: ", galleryImgString.length);
                        dispatch(uploadingImage(20));
                        const thumbnailImgString = await downscaleImgAndEncryptInBinaryString(120);
                        totalUploadedSize += thumbnailImgString.length;
                        debugLog(debugOn, "thumbnailImgString length: ", thumbnailImgString.length);
                        dispatch(uploadingImage(30));
                        const buffer = Buffer.from(data, 'binary');
                        if (!workspace.startsWith("d:")) {
                            const config = {
                                onUploadProgress: async (progressEvent) => {
                                    let percentCompleted = 30 + Math.ceil(progressEvent.loaded * 70 / progressEvent.total);
                                    dispatch(uploadingImage(percentCompleted));
                                    debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                                    if (!uploadingSubImages) {
                                        uploadingSubImages = true;

                                        uploadGalleryImgPromise = putS3Object(
                                            s3KeyGallery, signedGalleryURL,
                                            galleryImgString,
                                            {
                                                headers: {
                                                    'Content-Type': 'binary/octet-stream'
                                                }
                                            },
                                            dispatch
                                        ).catch(error => {
                                            reject(error);
                                            return;
                                        });

                                        uploadThumbnailImgPromise = putS3Object(
                                            s3KeyThumbnail, signedThumbnailURL,
                                            thumbnailImgString,
                                            {
                                                headers: {
                                                    'Content-Type': 'binary/octet-stream'
                                                }
                                            },
                                            dispatch
                                        ).catch(error => {
                                            reject(error);
                                            return;
                                        });
                                        try {
                                            const uploadResult = await Promise.all([uploadOriginalImgPromise, uploadGalleryImgPromise, uploadThumbnailImgPromise]);
                                            debugLog(debugOn, "Upload original image result: ", uploadResult[0]);
                                            debugLog(debugOn, "Upload gallery image result: ", uploadResult[1]);
                                            debugLog(debugOn, "Upload thumbnail image result: ", uploadResult[2]);
                                            resolve({ s3Key, size: totalUploadedSize, link: img.src, width: img.width, height: img.height, buffer });
                                        } catch (error) {
                                            debugLog(debugOn, "Uploading an image failed: ", error);
                                            reject(error);
                                        }
                                    }
                                },
                                headers: {
                                    'Content-Type': 'binary/octet-stream'
                                }
                            }

                            uploadOriginalImgPromise = putS3Object(s3Key, signedURL,
                                Buffer.from(data, 'binary'), config, dispatch)
                                .catch(error => {
                                    reject(error);
                                    return;
                                });
                        } else {
                            let params = {
                                table: 's3Objects',
                                key: s3Key,
                                data
                            }
                            let result = await writeDataToServiceWorkerDBTable(params);
                            if (result.status !== 'ok') {
                                throw new Error("Failed to write an image data to service worker DB!");
                            }
                            dispatch(uploadingImage(65));
                            params = {
                                table: 's3Objects',
                                key: s3KeyGallery,
                                data: galleryImgString
                            }
                            result = await writeDataToServiceWorkerDBTable(params);
                            if (result.status !== 'ok') {
                                throw new Error("Failed to write an image data to service worker DB!");
                            }
                            dispatch(uploadingImage(85));
                            params = {
                                table: 's3Objects',
                                key: s3KeyThumbnail,
                                data: thumbnailImgString
                            }
                            result = await writeDataToServiceWorkerDBTable(params);
                            if (result.status !== 'ok') {
                                throw new Error("Failed to write an image data to service worker DB!");
                            }
                            dispatch(uploadingImage(90));
                            resolve({ s3Key, size: totalUploadedSize, link: img.src, width: img.width, height: img.height, buffer });
                        }
                    } catch (error) {
                        debugLog(debugOn, 'uploadImagesToS3 error: ', error)
                        reject("uploadImagesToS3 error.");
                    }
                });
            };
            const encryptedImageDataInBinaryString = encryptLargeBinaryString(imageDataInBinaryString, state.itemKey);
            try {
                const uploadResult = await uploadImagesToS3(encryptedImageDataInBinaryString);
                resolve(uploadResult);
            } catch (error) {
                debugLog(debugOn, 'uploadImagesToS3 error: ', error);
                reject("uploadImagesToS3 error.");
            }
        };
        reader.addEventListener('load', async () => {
            imageDataInBinaryString = reader.result;
            const link = window.URL.createObjectURL(file);
            try {
                img = new Image();
                img.src = link;
                img.onload = startUploadingAnImage;

            } catch (error) {
                debugLog(debugOn, 'rotateImage error:', error)
                reject("rotateImage error.");
            }
        });
        reader.readAsBinaryString(file);
    });
};

const findImageWordsByKey = (images, s3Key) => {
    if (!images) return null;
    for (let i = 0; i < images.length; i++) {
        if (images[i].s3Key === s3Key) {
            return images[i].words;
        }
    }
    return null;
}

export const uploadImagesThunk = (data) => async (dispatch, getState) => {
    let state, workspaceKey, itemKey, keyEnvelope, newPageData, updatedState;;
    state = getState().page;
    workspaceKey = data.workspaceKey;
    if (checkIfTooManyMediaFiles(state, data.files.length)) {
        alert(`Sorry, please limit the number of media files to ${MAX_NUMBER_OF_MEDIA_FILES} per page!`)
        return;
    }
    if (state.activity & pageActivity.UploadImages) {
        dispatch(addUploadImages({ files: data.files, where: data.where }));
        return;
    }
    newActivity(dispatch, pageActivity.UploadImages, () => {
        return new Promise(async (resolve, reject) => {
            state = getState().page;
            if (!state.itemCopy) {
                itemKey = generateNewItemKey();
                dispatch(newItemKey({ itemKey }));
            }
            dispatch(addUploadImages({ files: data.files, where: data.where }));
            state = getState().page;
            while (state.imageUploadQueue.length > state.imageUploadIndex) {
                if (state.aborted) {
                    debugLog(debugOn, "abort: ", state.aborted);
                    break;
                }
                debugLog(debugOn, "======================= Uploading file: ", `index: ${state.imageUploadIndex} name: ${state.imageUploadQueue[state.imageUploadIndex].file.name}`)
                const file = state.imageUploadQueue[state.imageUploadIndex].file;
                try {
                    const uploadResult = await uploadAnImage(dispatch, getState, state, file);
                    dispatch(imageUploaded(uploadResult));
                } catch (error) {
                    alert("Network failure, retry?")
                }

                state = getState().page;
            }
            state = getState().page;
            debugLog(debugOn, state.imagePanels);
            const images = [];
            for (let i = 0; i < state.imagePanels.length; i++) {
                let image = { s3Key: state.imagePanels[i].s3Key, size: state.imagePanels[i].size };
                let words = null;
                if (state.itemCopy) words = findImageWordsByKey(state.itemCopy.images, image.s3Key);
                image.words = words;
                images.push(image);
            }
            if (!state.itemCopy) {
                try {
                    keyEnvelope = encryptBinaryString(state.itemKey, workspaceKey);

                    newPageData = {
                        "itemId": state.id,
                        "keyEnvelope": forge.util.encode64(keyEnvelope),
                        "images": JSON.stringify(images),
                    };

                    updatedState = {
                        itemKey
                    }

                    await createANewPage(dispatch, getState, state, newPageData, updatedState);
                    resolve();
                } catch (error) {
                    reject("Failed to create a new page with images.");
                }
            } else {
                let itemCopy = {
                    ...state.itemCopy
                }
                try {
                    itemCopy.images = images;
                    itemCopy.update = "images";
                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy
                    }));
                    resolve();
                } catch (error) {
                    reject("Failed to save images.");
                }
            }
            if (process.env.NEXT_PUBLIC_platform === 'android') {
                if (Android) {
                    console.log("Calling Android.deleteTemporaryFiles")
                    Android.deleteTemporaryFiles();
                }
            }
        });
    });
}

export const deleteAnImageThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.DeleteAnImage, () => {
        return new Promise(async (resolve, reject) => {
            let state, newImages, imagePanels, itemCopy;
            state = getState().page;
            itemCopy = { ...state.itemCopy };
            newImages = itemCopy.images.filter(function (image) {
                return data.panel.s3Key !== image.s3Key;
            });
            try {

                itemCopy.images = newImages;
                itemCopy.update = "images";
                await createNewItemVersionForPage(itemCopy, dispatch);

                imagePanels = state.imagePanels.filter((panel) => {
                    return data.panel.s3Key !== panel.s3Key;
                })
                dispatch(newVersionCreated({
                    itemCopy,
                    imagePanels
                }));
                resolve();
            } catch (error) {
                reject("Failed to delete images.");
            }
        });
    });
}

const uploadAnAttachment = (dispatch, getState, state, attachment, workspaceKey) => {
    const workspace = getState().container.workspace;
    const demoOwner = workspace.split(":")[1];
    const chunkSize = state.chunkSize;
    const numberOfChunks = attachment.numberOfChunks;
    const file = attachment.file;
    const fileSize = file.size;
    const fileType = file.type;
    const encodedFileName = forge.util.encodeUtf8(file.name);
    const encryptedFileName = encryptBinaryString(encodedFileName, state.itemKey);
    let i, encryptedFileSize = 0, s3KeyPrefix = 'null', startingChunk, chunkForUpload;

    function sliceEncryptAndUpload(file, chunkIndex) {
        return new Promise(async (resolve, reject) => {
            let encryptedChunk, fileUploadProgress = 0;

            function encryptAChunk(index) {
                return new Promise((resolve) => {
                    debugLog(debugOn, `encryptAChunk: ${index}`);
                    let reader, offset, data, encryptedData;
                    offset = (index) * chunkSize;
                    reader = new FileReader();
                    const blob = file.slice(offset, offset + chunkSize);

                    reader.onloadend = async function (e) {
                        data = reader.result;
                        if (!data) {
                            reject("It is not a file.");
                            return;
                        }
                        encryptedData = await encryptChunkBinaryStringToBinaryStringAsync(data, state.itemKey);
                        encryptedFileSize += encryptedData.length;
                        debugLog(debugOn, `encryptAChunk done: ${index}`);
                        resolve(encryptedData);
                    };
                    reader.readAsBinaryString(blob);
                });
            }

            function uploadAChunk(index, data) {
                let result, s3Key, signedURL, s3KeyPrefixParts, timeStamp, controller, timer;
                debugLog(debugOn, `uploadAChunk: ${index}`);
                s3KeyPrefixParts = s3KeyPrefix.split(':');
                timeStamp = s3KeyPrefixParts[s3KeyPrefixParts.length - 1]
                return new Promise(async (resolve, reject) => {
                    try {
                        if (!workspace.startsWith("d:")) {
                            result = await preS3ChunkUpload(state.id, index, timeStamp, dispatch);
                            fileUploadProgress = index * (100 / numberOfChunks) + 15 / numberOfChunks;
                            debugLog(debugOn, `File upload prgoress: ${fileUploadProgress}`);
                            dispatch(uploadingAttachment(fileUploadProgress));
                            s3Key = result.s3Key;
                            s3KeyPrefix = result.s3KeyPrefix;
                            signedURL = result.signedURL;
                            debugLog(debugOn, 'chunk signed url', signedURL);
                            controller = new AbortController();
                            dispatch(setAbortController(controller));
                            const config = {
                                onUploadProgress: async (progressEvent) => {
                                    if (timer) {
                                        clearTimeout(timer);
                                        timer = 0;
                                    }
                                    //setUploadTimeout();
                                    let percentCompleted = 15 + Math.ceil(progressEvent.loaded * 85 / progressEvent.total);
                                    fileUploadProgress = index * (100 / numberOfChunks) + percentCompleted / numberOfChunks;
                                    debugLog(debugOn, `Chunk upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                                    debugLog(debugOn, `File upload prgoress: ${fileUploadProgress}`);
                                    dispatch(uploadingAttachment(fileUploadProgress));
                                },
                                headers: {
                                    'Content-Type': 'binary/octet-stream'
                                },
                                timeout: 0,
                                signal: controller.signal
                            }
                            await putS3Object(s3Key, signedURL, data, config, dispatch);
                            if (timer) clearTimeout(timer);
                            dispatch(setAbortController(null));
                            debugLog(debugOn, `uploadAChunk done: ${index}`);
                            resolve();
                        } else {
                            if (index === 0) {
                                s3KeyPrefix = `${demoOwner}:3:${Date.now()}L`;
                            }
                            s3Key = `${s3KeyPrefix}_chunk_${index}`;
                            const params = {
                                table: 's3Objects',
                                key: s3Key,
                                data
                            }
                            const result = await writeDataToServiceWorkerDBTable(params);
                            if (result.status !== 'ok') {
                                throw new Error("Failed to write a chunk to service worker DB!");
                            }
                            fileUploadProgress = (index + 1) * (100 / numberOfChunks);
                            debugLog(debugOn, `File upload prgoress: ${fileUploadProgress}`);
                            dispatch(uploadingAttachment(fileUploadProgress));
                            resolve();
                        }
                    } catch (error) {
                        debugLog(debugOn, 'uploadAChunk failed: ', error);
                        reject("uploadAChunk error.");
                    }
                });
            }
            if (chunkIndex === 0) {
                encryptedChunk = await encryptAChunk(chunkIndex);
                resolve(encryptedChunk);
            } else if (chunkIndex === numberOfChunks) {
                await uploadAChunk(chunkIndex - 1, chunkForUpload);
                resolve();
            } else {
                Promise.all([uploadAChunk(chunkIndex - 1, chunkForUpload), encryptAChunk(chunkIndex)]).then(result => {
                    resolve(result[1]);
                }).catch(error => {
                    reject("uploadAChunk error.");
                })
            }
        });
    }

    function doneUploadAnAttachment() {
        let i, newAttachments = [];
        return new Promise(async (resolve, reject) => {
            if (!state.itemCopy) {
                try {
                    let keyEnvelope = encryptBinaryString(state.itemKey, workspaceKey);

                    let newPageData = {
                        itemId: state.id,
                        keyEnvelope: forge.util.encode64(keyEnvelope),
                        s3KeyPrefix,
                        fileName: forge.util.encode64(encryptedFileName),
                        fileType,
                        fileSize,
                        size: encryptedFileSize,
                        numberOfChunks
                    };

                    let updatedState = {
                    };

                    await createANewPage(dispatch, getState, state, newPageData, updatedState);
                    resolve();
                } catch (error) {
                    reject("Failed to create a new page with attachment.");
                }
            } else {
                let itemCopy = {
                    ...state.itemCopy
                }
                for (i = 0; i < itemCopy.attachments.length; i++) {
                    newAttachments.push(itemCopy.attachments[i]);
                }
                const thisAttachment = {
                    fileName: forge.util.encode64(encryptedFileName),
                    fileType,
                    fileSize,
                    s3KeyPrefix,
                    size: encryptedFileSize,
                    numberOfChunks
                }
                newAttachments.push(thisAttachment);
                try {
                    itemCopy.attachments = newAttachments;
                    itemCopy.update = "attachments";
                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy
                    }));
                    resolve();
                } catch (error) {
                    reject("Failed to add an attachment.");
                }
            }
        })
    }

    return new Promise(async (resolve, reject) => {

        if (attachment.failedChunk) {
            startingChunk = attachment.failedChunk;
            s3KeyPrefix = attachment.s3KeyPrefix;
        } else {
            startingChunk = 0;
        }
        for (i = startingChunk; i <= numberOfChunks; i++) {
            try {
                debugLog(debugOn, 'sliceEncryptAndUpload chunks: ', i + '/' + numberOfChunks);
                chunkForUpload = await sliceEncryptAndUpload(file, i);
            } catch (error) {
                debugLog(debugOn, 'uploadAnAttachment failed: ', error);
                if (confirm('Network failure, retry?')) {
                    i--;
                } else {
                    break;
                }

            }
        }
        if (i === numberOfChunks + 1) {
            debugLog(debugOn, `uploadAnAttachment done, total chunks: {numberOfChunks} encryptedFileSize: {encryptedFileSize}`);
            try {
                await doneUploadAnAttachment();
                resolve({ fileType, fileSize, s3KeyPrefix, size: encryptedFileSize });
            } catch (error) {
                debugLog(debugOn, 'uploadAnAttachment failed: ', error);
                reject("doneUploadAnAttachment error.");
            }
        } else {
            reject("Uploading an attachment failed.");
        }
    });
}

export const uploadAttachmentsThunk = (data) => async (dispatch, getState) => {
    let state, workspaceKey, itemKey, attachment, uploadResult, keyEnvelope, newPageData, updatedState;;
    state = getState().page;
    workspaceKey = data.workspaceKey;

    if (state.activity & pageActivity.UploadAttachments) {
        dispatch(addUploadAttachments({ files: data.files }));
        return;
    }
    newActivity(dispatch, pageActivity.UploadAttachments, () => {
        return new Promise(async (resolve, reject) => {
            state = getState().page;
            if (!state.itemCopy) {
                itemKey = generateNewItemKey();
                dispatch(newItemKey({ itemKey }));
            }
            dispatch(addUploadAttachments({ files: data.files }));
            state = getState().page;
            while (state.attachmentsUploadQueue.length > state.attachmentsUploadIndex) {
                if (state.aborted) {
                    debugLog(debugOn, "abort: ", state.aborted);
                    break;
                }
                debugLog(debugOn, "======================= Uploading file: ", `index: ${state.attachmentsUploadIndex} name: ${state.attachmentsUploadQueue[state.attachmentsUploadIndex].file.name}`)
                attachment = state.attachmentsUploadQueue[state.attachmentsUploadIndex];
                try {
                    uploadResult = await uploadAnAttachment(dispatch, getState, state, attachment, workspaceKey);
                    dispatch(attachmentUploaded(uploadResult));
                    state = getState().page;
                } catch (error) {
                    debugLog(debugOn, 'uploadAttachmentsThunk failed: ', error);
                    if (!confirm("Network failure, retry?")) {
                        reject("Failed to upload attachments.");
                        break;
                    }
                }
            }
            if (state.attachmentsUploadQueue.length === state.attachmentsUploadIndex) {
                resolve();
            }
        });
    });
}

const downloadAnAttachment = (dispatch, getState, state, attachment, itemId) => {
    return new Promise(async (resolve, reject) => {
        const workspace = getState().container.workspace;
        let messageChannel, fileInUint8Array, fileInUint8ArrayIndex, i, numberOfChunks, numberOfChunksRequired = false, result, decryptedChunkStr, buffer, downloadedBinaryString, startingChunk;
        const isUsingServiceWorker = usingServiceWorker();
        const s3KeyPrefix = attachment.s3KeyPrefix;
        async function setupWriter() {
            function talkToServiceWorker() {
                return new Promise(async (resolve, reject) => {
                    navigator.serviceWorker.getRegistration("/downloadFile/").then((registration) => {
                        if (registration) {
                            messageChannel = new MessageChannel();
                            registration.active.postMessage({
                                type: 'INIT_PORT',
                                fileName: attachment.fileName,
                                fileSize: attachment.fileSize,
                                browserInfo: getBrowserInfo()
                            }, [messageChannel.port2]);
                            messageChannel.port1.onmessage = (event) => {
                                // Print the result
                                debugLog(debugOn, event.data);
                                if (event.data) {
                                    switch (event.data.type) {
                                        case 'STREAM_OPENED':
                                            const iframe = document.createElement('iframe');
                                            iframe.hidden = true;
                                            iframe.src = '/downloadFile/' + event.data.stream.id;
                                            document.body.appendChild(iframe);
                                            debugLog(debugOn, "STREAM_OPENED");
                                            resolve();
                                            break;
                                        case 'STREAM_CLOSED':
                                            messageChannel.port1.onmessage = null
                                            messageChannel.port1.close();
                                            messageChannel.port2.close();
                                            messageChannel = null;
                                            dispatch(writerClosed());
                                            break;
                                        default:
                                    }
                                }
                            };
                        } else {
                            debugLog(debugOn, "s");
                            reject("serviceWorker.getRegistration error")
                        }
                    });
                }).catch((error) => {
                    debugLog(debugOn, "serviceWorker.getRegistration error: ", error);
                    reject("serviceWorker.getRegistration error.");
                });
            }
            if (!isUsingServiceWorker) {
                if (process.env.NEXT_PUBLIC_platform === 'android') {
                    fileInUint8Array = new Uint8Array(attachment.fileSize);
                    fileInUint8ArrayIndex = 0;
                }
                return true;
            } else {
                try {
                    await talkToServiceWorker();
                    return true;
                } catch (error) {
                    debugLog(debugOn, "setupWriter failed: ", error)
                    return false;
                }
            }
        }
        function reconnectWriter() {
            if (!isUsingServiceWorker) {
                if (process.env.NEXT_PUBLIC_platform !== 'android') {
                    fileInUint8Array = state.writer.fileInUint8Array;
                    fileInUint8ArrayIndex = state.writer.fileInUint8ArrayIndex;
                }
            } else {
                messageChannel = state.writer;
            }
        }
        function writeAChunkToFile(chunkIndex, chunk) {
            return new Promise(async (resolve, reject) => {
                if (!isUsingServiceWorker) {
                    if (process.env.NEXT_PUBLIC_platform !== 'android') {
                        for (let offset = 0; offset < chunk.length; offset++) {
                            if (fileInUint8ArrayIndex + offset < fileInUint8Array.length) {
                                fileInUint8Array[fileInUint8ArrayIndex + offset] = chunk.charCodeAt(offset);
                            } else {
                                reject("writeAChunkToFile error: fileInUint8Array overflow");
                                return;
                            }
                        }
                        fileInUint8ArrayIndex += chunk.length;
                    } else {
                        if (process.env.NEXT_PUBLIC_platform === 'android') {
                            if (Android) {
                                console.log("Android.addAChunkToFile ...")
                                Android.addAChunkToFile(chunkIndex, numberOfChunks, chunk, attachment.uriString)
                            }
                        }
                    }
                    resolve();
                } else {
                    messageChannel.port1.postMessage({
                        type: 'BINARY',
                        chunk
                    });
                    resolve();
                }
            })
        }
        function writeAChunkToFileFailed(chunkIndex) {
            if (!isUsingServiceWorker) {
                if (process.env.NEXT_PUBLIC_platform !== 'android') {
                    dispatch(downloadAChunkFailed({ chunkIndex, writer: { fileInUint8Array, fileInUint8ArrayIndex } }));
                }
            } else {
                dispatch(downloadAChunkFailed({ chunkIndex, writer: messageChannel }));
            }

        }
        function closeWriter() {
            if (!isUsingServiceWorker) {
                dispatch(writerClosed());
            } else {
                messageChannel.port1.postMessage({
                    type: 'END_OF_FILE'
                });
            }
        }
        function downloadDecryptAndAssemble(chunkIndex) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!workspace.startsWith("d:")) {
                        result = await preS3ChunkDownload(state.id, chunkIndex, s3KeyPrefix, numberOfChunksRequired, dispatch);
                        if (numberOfChunksRequired) {
                            numberOfChunks = result.numberOfChunks;
                            numberOfChunksRequired = false;
                        }
                        const response = await XHRDownload(state.id, dispatch, result.signedURL, downloadingAttachment, chunkIndex * 100 / numberOfChunks, 1 / numberOfChunks);
                        debugLog(debugOn, "downloadChunk completed. Length: ", response.byteLength);
                        if (state.activeRequest !== itemId) {
                            reject("Aborted");
                            return;
                        }
                        buffer = Buffer.from(response, 'binary');
                        downloadedBinaryString = buffer.toString('binary');
                    } else {
                        const s3Key = `${s3KeyPrefix}_chunk_${chunkIndex}`
                        const result = await getS3ObjectFromServiceWorkerDB(s3Key);
                        if (result.status === 'ok') {
                            downloadedBinaryString = result.object;
                        } else {
                            throw new Error("Failed to read an image data from service worker DB!");
                        }
                    }
                    debugLog(debugOn, "Downloaded string length: ", downloadedBinaryString.length);
                    decryptedChunkStr = await decryptChunkBinaryStringToBinaryStringAsync(downloadedBinaryString, state.itemKey, state.itemIV)
                    debugLog(debugOn, "Decrypted chunk string length: ", decryptedChunkStr.length);
                    await writeAChunkToFile(chunkIndex, decryptedChunkStr);
                    resolve();
                } catch (error) {
                    debugLog(debugOn, "downloadDecryptAndAssemble failed: ", error);
                    writeAChunkToFileFailed(chunkIndex);
                    reject("Failed to write a chunk to file.");
                }
            });
        }

        numberOfChunks = attachment.numberOfChunks;
        if (!numberOfChunks) {
            numberOfChunks = 1;
            numberOfChunksRequired = true;
        }

        if (attachment.failedChunk) {
            startingChunk = attachment.failedChunk;
            reconnectWriter();
        } else {
            startingChunk = 0;
            if (!(await setupWriter())) {
                dispatch(setupWriterFailed());
                reject("Failed to setup the writer.");
                return;
            };
        }
        for (i = startingChunk; i < numberOfChunks; i++) {
            try {
                await downloadDecryptAndAssemble(i);
            } catch (error) {
                debugLog(debugOn, "downloadAnAttachment failed: ", error);
                reject("downloadDecryptAndAssemble error.");
                break;
            }
        }
        if (i === numberOfChunks) {
            debugLog(debugOn, `downloadAnAttachment done, total chunks: ${numberOfChunks}`);
            if ((process.env.NEXT_PUBLIC_platform !== 'android') && !isUsingServiceWorker) {
                let blob = new Blob([fileInUint8Array], {
                    type: attachment.fileType
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = attachment.fileName;
                link.click();
            }
            closeWriter();
            resolve();
        }
    });
}

export const downloadAnAttachmentThunk = (data) => async (dispatch, getState) => {
    let state, attachment, itemId;
    state = getState().page;
    itemId = state.id;
    if (state.attachmentsDownloadQueue.length > state.attachmentsDownloadIndex) {
        dispatch(addDownloadAttachment({ ...data.panel }));
        return;
    }
    if (data.panel) {
        dispatch(addDownloadAttachment({ ...data.panel }));
    }
    state = getState().page;
    while (state.attachmentsDownloadQueue.length > state.attachmentsDownloadIndex) {
        if (state.aborted) {
            debugLog(debugOn, "abort: ", state.aborted);
            break;
        }
        debugLog(debugOn, "======================= Downloading file: ", `index: ${state.attachmentsDownloadIndex} name: ${state.attachmentsDownloadQueue[state.attachmentsDownloadIndex].fileName}`)
        attachment = state.attachmentsDownloadQueue[state.attachmentsDownloadIndex];
        try {
            await downloadAnAttachment(dispatch, getState, state, attachment, itemId);
            dispatch(attachmentDownloaded(attachment));
            state = getState().page;
        } catch (error) {
            debugLog(debugOn, 'downloadAnAttachmentThunk failed: ', error);
            break;
        }
    }
}

export const deleteAnAttachmentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.DeleteAnAttachment, () => {
        return new Promise(async (resolve, reject) => {
            let state, newAttachments, attachmentPanels, itemCopy;
            state = getState().page;
            itemCopy = { ...state.itemCopy };
            newAttachments = itemCopy.attachments.filter(function (attachment) {
                return data.panel.s3KeyPrefix !== attachment.s3KeyPrefix;
            });
            try {

                itemCopy.attachments = newAttachments;
                itemCopy.update = "attachments";
                await createNewItemVersionForPage(itemCopy, dispatch);

                attachmentPanels = state.attachmentPanels.filter((panel) => {
                    return data.panel.s3KeyPrefix !== panel.s3KeyPrefix;
                })
                dispatch(newVersionCreated({
                    itemCopy,
                    attachmentPanels
                }));
                resolve();
            } catch (error) {
                reject("Failed to delete an attachment.");
            }
        });
    });
}

export const saveVideoWordsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveVideoWords, () => {
        return new Promise(async (resolve, reject) => {
            console.log('saveVideoWordsThunk')
            let state, encodedContent, encryptedContent, itemCopy, videoPanels;
            const content = data.content;
            const index = data.index;
            state = getState().page;

            try {

                encodedContent = forge.util.encodeUtf8(content);
                encryptedContent = encryptBinaryString(encodedContent, state.itemKey);

                if (!state.itemCopy) {
                } else {
                    itemCopy = JSON.parse(JSON.stringify(state.itemCopy));

                    itemCopy.videos[index].words = forge.util.encode64(encryptedContent);
                    itemCopy.update = "video words";

                    videoPanels = JSON.parse(JSON.stringify(state.videoPanels));
                    for (let i = 0; i < videoPanels.length; i++) {
                        videoPanels[i].thumbnail = state.videoPanels[i].thumbnail;
                        videoPanels[i].src = state.videoPanels[i].src;
                        videoPanels[i].play = state.videoPanels[i].play;
                    }
                    videoPanels[index].words = content;

                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy,
                        videoPanels
                    }));
                    resolve();
                }
            } catch (error) {
                console.error(error);
                reject("Failed to save video words.");
            }

        });
    })
}

export const saveImageWordsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveImageWords, () => {
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
                    for (let i = 0; i < imagePanels.length; i++) {
                        imagePanels[i].img = state.imagePanels[i].img;
                    }
                    imagePanels[index].words = content;

                    await createNewItemVersionForPage(itemCopy, dispatch);
                    dispatch(newVersionCreated({
                        itemCopy,
                        imagePanels
                    }));
                    resolve();
                }
            } catch (error) {
                reject("Failed to save image words.");
            }

        });
    })
}

export const getPageCommentsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.LoadComments, () => {
        let state, yourName, hits, comments, content, encryptedContent, binaryContent, encodedContent, payload;
        return new Promise(async (resolve, reject) => {
            state = getState().page;

            PostCall({
                api: '/memberAPI/getPageComments',
                body: {
                    itemId: data.itemId,
                    size: 10,
                    from: 0,
                },
                dispatch
            }).then(result => {
                debugLog(debugOn, result);
                state = getState().page;
                if (data.itemId !== state.activeRequest) {
                    debugLog(debugOn, "Aborted");
                    reject("Aborted");
                    return;
                }
                if (result.status === 'ok') {
                    if (result.hits) {

                        hits = result.hits.hits;
                        yourName = getState().auth.displayName;
                        comments = hits.map(({ _source: comment, _id: id }) => {
                            try {
                                encryptedContent = comment.content;
                                content = '';
                                if (encryptedContent) {
                                    binaryContent = forge.util.decode64(encryptedContent);
                                    encodedContent = decryptBinaryString(binaryContent, state.itemKey, state.itemIV);
                                    content = forge.util.decodeUtf8(encodedContent);
                                    content = DOMPurify.sanitize(content);
                                }
                                payload = {
                                    id,
                                    commentId: comment.commendId,
                                    creationTime: comment.creationTime,
                                    lastUpdateTime: comment.lastUpdateTime,
                                    writerName: (comment.writerName === yourName) ? 'You' : comment.writerName,
                                    content,
                                    editorMode: 'ReadOnly'
                                }
                                return payload;

                            } catch (error) {
                                console.trace(error);
                                return {}
                            }
                        });
                        dispatch(pageCommentsFetched({ itemId: data.itemId, comments }));
                        resolve();
                    } else {
                        reject("Failed to get a page comments!");
                    }
                } else {
                    debugLog(debugOn, "woo... failed to get a page comments!", data.error);
                    reject("Failed to get a page comments!");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... failed to get a page comments.", error)
                reject("Failed to get a page comments!");
            })
        });
    });
}


export const saveCommentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, pageActivity.SaveComment, () => {
        return new Promise(async (resolve, reject) => {
            let state, content, encodedComment, encryptedComment, itemId, commentIndex, commentId;
            state = getState().page;
            try {
                if (!state.itemCopy) {
                } else {
                    content = await preProcessEditorContentBeforeSaving(data.content).content;
                    encodedComment = forge.util.encodeUtf8(content);
                    encryptedComment = forge.util.encode64(encryptBinaryString(encodedComment, state.itemKey));

                    itemId = state.id;

                    if (data.index === 'comment_New') {
                        PostCall({
                            api: '/memberAPI/saveNewPageComment',
                            body: {
                                itemId,
                                content: encryptedComment,
                            },
                            dispatch
                        }).then(function (data) {
                            if (data.status === 'ok') {
                                const payload = {
                                    id: data.id,
                                    commentId: data.commentId,
                                    creationTime: data.creationTime,
                                    lastUpdateTime: data.lastUpdateTime,
                                    writerName: 'You',
                                    content
                                }
                                dispatch(newCommentAdded(payload));
                                resolve();
                            } else {
                                reject("Failed to add new comment.");
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
                            },
                            dispatch
                        }).then(function (data) {
                            if (data.status === 'ok') {
                                dispatch(commentUpdated({ commentIndex, content, lastUpdateTime: data.lastUpdateTime }));
                                resolve();
                            } else {
                                reject("Failed to update a comment.");
                            }
                        })
                    }
                }
            } catch (error) {
                reject("Failed to save a comment.");
            }

        });
    })
}


export const pageReducer = pageSlice.reducer;

export default pageSlice;