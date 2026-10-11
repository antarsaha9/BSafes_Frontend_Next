const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { decryptBinaryString } from './crypto';
import { getEditorConfig } from './bSafesCommonUI';

export const EMBEDDED_JSON_SEPARATOR = '=#=#=embeddJSON=';

export function extractMediaRefsFromContent(content) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = content;
    const refs = [];

    const images = tempElement.querySelectorAll(".bSafesImage");
    images.forEach((item) => {
        let id = item.id;
        let idParts = id.split('&');
        let s3Key = idParts[0];
        refs.push({ id, s3Key });
    });

    const videos = tempElement.querySelectorAll(".bSafesDownloadVideo");
    videos.forEach((item) => {
        let id = item.id;
        let idParts = id.split('&');
        if (idParts[0] === 'chunks') {
            let s3Key = idParts[3] + '_chunk_' + getEditorConfig().videoThumbnailIndex;
            refs.push({ id, s3Key });
        }
    });
    return refs;
}

export function htmlToText(html) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    return tempElement.textContent || "";
}

/**
 * Unlocks (decrypts) one page and returns its readable parts: title, tags, text,
 * and the lists of its images, videos, audios and attachments.
 * Used by both the normal page view and the backup export.
 * It only reads and returns data; it does not change any app state.
 */
export function decryptItemCore(item, workspaceKey) {
    const result = {
        error: null,
        itemKey: null,
        itemIV: null,
        tags: [],
        title: null,
        titleText: null,
        content: null,
        contentMediaRefs: [],
        videoPanels: [],
        audioPanels: [],
        imagePanels: [],
        attachmentPanels: [],
        imageDownloadQueue: [],
    };

    if (item.keyEnvelope === undefined) {
        result.error = "Undefined item key";
    }
    if (item.envelopeIV && item.ivEnvelope && item.ivEnvelopeIV) { // older pages use an older encryption style
        result.itemKey = decryptBinaryString(forge.util.decode64(item.keyEnvelope), workspaceKey, forge.util.decode64(item.envelopeIV));
        result.itemIV = decryptBinaryString(forge.util.decode64(item.ivEnvelope), workspaceKey, forge.util.decode64(item.ivEnvelopeIV));
    } else {
        const decoded = forge.util.decode64(item.keyEnvelope);
        result.itemKey = decryptBinaryString(decoded, workspaceKey);
        result.itemIV = null;
    }

    let itemTags = [];
    const hiddenTags = {
        'contentType#Write': true,
    };
    if (item.tags && item.tags.length > 1) {
        const encryptedTags = item.tags;
        for (let i = 0; i < (item.tags.length - 1); i++) {
            try {
                let encryptedTag = encryptedTags[i];
                encryptedTag = forge.util.decode64(encryptedTag);
                const encodedTag = decryptBinaryString(encryptedTag, result.itemKey, result.itemIV);
                const tag = forge.util.decodeUtf8(encodedTag);
                if (hiddenTags[tag]) continue;
                itemTags.push(tag);
            } catch (err) {
                result.error = err;
            }
        }
    }
    result.tags = itemTags;

    if (item.title) {
        try {
            const encodedTitle = decryptBinaryString(forge.util.decode64(item.title), result.itemKey, result.itemIV);
            let title = forge.util.decodeUtf8(encodedTitle);
            title = DOMPurify.sanitize(title);
            result.title = title;
            result.titleText = htmlToText(title);
        } catch (err) {
            result.error = err;
        }
    } else {
        result.title = '<h2></h2>';
        result.titleText = "";
    }

    // Long pages and drawings keep their content in a separate file (marked 's3Object/' or 's3DrawingObject/').
    // That file is downloaded and unlocked elsewhere, so skip it here.
    if (item.content && !item.content.startsWith('s3Object/') && !item.content.startsWith('s3DrawingObject/')) {
        try {
            const encodedContent = decryptBinaryString(forge.util.decode64(item.content), result.itemKey, result.itemIV);
            let content = forge.util.decodeUtf8(encodedContent);
            content = DOMPurify.sanitize(content);
            result.content = content;
            result.contentMediaRefs = extractMediaRefsFromContent(content);
        } catch (err) {
            result.error = err;
        }
    }

    if (item.videos) {
        let newPanels = [];
        for (let i = 0; i < item.videos.length; i++) {
            let video = item.videos[i];
            let encryptedWords, encodedWords, words;
            const videoThumbnailS3Key = `${video.s3KeyPrefix}_chunk_${getEditorConfig().videoThumbnailIndex}`;
            const queueId = 'd' + result.imageDownloadQueue.length;
            result.imageDownloadQueue.push({ s3Key: videoThumbnailS3Key, forVideo: true });

            if (video.words && video.words !== "") {
                encryptedWords = forge.util.decode64(video.words);
                encodedWords = decryptBinaryString(encryptedWords, result.itemKey, result.itemIV);
                words = forge.util.decodeUtf8(encodedWords);
                words = DOMPurify.sanitize(words);
            } else {
                words = "";
            }

            const newPanel = {
                video: true,
                queueId,
                fileType: video.fileType,
                fileName: decodeURI(decryptBinaryString(forge.util.decode64(video.fileName), result.itemKey)),
                fileSize: video.fileSize,
                encryptedFileSize: video.encryptedFileSize,
                status: "WaitingForDownload",
                numberOfChunks: video.numberOfChunks,
                s3KeyPrefix: video.s3KeyPrefix,
                progress: 0,
                words,
                thumbnail: null,
                placeholder: "https://placehold.co/600x400?text=Video"
            };
            newPanels.push(newPanel);
        }
        result.videoPanels = newPanels;
    }

    if (item.audios) {
        let newPanels = [];
        for (let i = 0; i < item.audios.length; i++) {
            let audio = item.audios[i];
            let encryptedWords, encodedWords, words;
            const queueId = 'd' + i;
            if (audio.words && audio.words !== "") {
                encryptedWords = forge.util.decode64(audio.words);
                encodedWords = decryptBinaryString(encryptedWords, result.itemKey, result.itemIV);
                words = forge.util.decodeUtf8(encodedWords);
                words = DOMPurify.sanitize(words);
            } else {
                words = "";
            }

            const newPanel = {
                audio: true,
                queueId,
                fileType: audio.fileType,
                fileName: decodeURI(decryptBinaryString(forge.util.decode64(audio.fileName), result.itemKey)),
                fileSize: audio.fileSize,
                encryptedFileSize: audio.encryptedFileSize,
                status: "WaitingForDownload",
                numberOfChunks: audio.numberOfChunks,
                s3KeyPrefix: audio.s3KeyPrefix,
                progress: 0,
                words
            };
            newPanels.push(newPanel);
        }
        result.audioPanels = newPanels;
    }

    if (item.images) {
        for (let i = 0; i < item.images.length; i++) {
            let image = item.images[i];
            let encryptedWords, encodedWords, words;
            const queueId = 'd' + result.imageDownloadQueue.length;
            result.imageDownloadQueue.push({ s3Key: image.s3Key });
            if (image.words && image.words !== "") {
                encryptedWords = forge.util.decode64(image.words);
                encodedWords = decryptBinaryString(encryptedWords, result.itemKey, result.itemIV);
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
            };
            result.imagePanels.push(newPanel);
        }
    }

    if (item.attachments && item.attachments.length > 1) {
        let newPanels = [];
        for (let i = 1; i < item.attachments.length; i++) {
            let attachment = item.attachments[i];
            const encryptedFileName = forge.util.decode64(attachment.fileName);
            const encodedFileName = decryptBinaryString(encryptedFileName, result.itemKey, result.itemIV);
            const fileName = forge.util.decodeUtf8(encodedFileName);
            const newPanel = {
                queueId: 'a' + i,
                fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                status: "Uploaded",
                numberOfChunks: attachment.numberOfChunks,
                s3KeyPrefix: attachment.s3KeyPrefix,
                progress: 0
            };
            newPanels.push(newPanel);
        }
        result.attachmentPanels = newPanels.reverse();
    }

    return result;
}
