const forge = require('node-forge');

import { writeFile, openFileWriter } from './exportFsAccess';
import { sanitizeFileName } from './exportNaming';
import { rewriteInlineMedia, buildPageHtml } from './exportPageBuilder';
import { readAndDecryptLargeObject, forEachDecryptedChunk, sniffExtension } from './exportMediaDownload';
import { renderDrawingToPng } from './exportDrawingRenderer';
import { decryptBinaryString } from './crypto';
import { ExportCancelledError } from './exportTreeWalk';

function checkCancelled(isCancelled) {
    if (isCancelled && isCancelled()) throw new ExportCancelledError('Export cancelled');
}

/**
 * Helper for saving one page's files.
 * - write(): saves a file and remembers its name and fingerprint for manifest.json
 * - uniqueMediaPath(): picks a free name in media/, so two files with the same name
 *   don't overwrite each other (the second becomes "name (2).ext")
 */
function createItemWriter(root, itemDirRelPath) {
    const files = [];
    const usedNames = new Set();
    return {
        files,
        uniqueMediaPath(fileName) {
            const dot = fileName.lastIndexOf('.');
            const base = dot > 0 ? fileName.slice(0, dot) : fileName;
            const ext = dot > 0 ? fileName.slice(dot) : '';
            let candidate = fileName;
            for (let n = 2; usedNames.has(candidate.toLowerCase()); n++) candidate = `${base} (${n})${ext}`;
            usedNames.add(candidate.toLowerCase());
            return `media/${candidate}`;
        },
        async write(manifestPath, binaryString) {
            const { size, sha256 } = await writeFile(root, `${itemDirRelPath}/${manifestPath}`, binaryString);
            files.push({ path: manifestPath, sha256, size });
        },
        /**
         * Saves a file that is stored in pieces, one piece at a time.
         * `choosePath(firstPiece)` decides the file's path once the first piece is unlocked
         * (some files are named from their first bytes). Returns the chosen path.
         * If anything fails or the export is cancelled, the unfinished file is deleted.
         */
        async writeChunked(s3KeyPrefix, numberOfChunks, itemKey, choosePath, isCancelled) {
            let fileWriter = null, manifestPath = null;
            try {
                await forEachDecryptedChunk(s3KeyPrefix, numberOfChunks, itemKey, async (chunk, chunkIndex) => {
                    checkCancelled(isCancelled);
                    if (chunkIndex === 0) {
                        manifestPath = choosePath(chunk);
                        fileWriter = await openFileWriter(root, `${itemDirRelPath}/${manifestPath}`);
                    }
                    await fileWriter.append(chunk);
                });
                if (!fileWriter) { // a file with no pieces: save it as an empty file
                    manifestPath = choosePath('');
                    return this.write(manifestPath, '').then(() => manifestPath);
                }
                const { size, sha256 } = await fileWriter.finish();
                files.push({ path: manifestPath, sha256, size });
                return manifestPath;
            } catch (error) {
                if (fileWriter) await fileWriter.abort();
                throw error;
            }
        },
    };
}

/** Saves the page's gallery images. They have no filename, so the type is worked out from the file itself. */
async function exportGalleryImages(writer, imagePanels, itemKey, itemIV, isCancelled) {
    const images = [];
    for (let i = 0; i < imagePanels.length; i++) {
        checkCancelled(isCancelled);
        const panel = imagePanels[i];
        const binaryString = await readAndDecryptLargeObject(panel.s3Key, itemKey, itemIV);
        const path = writer.uniqueMediaPath(`image${i + 1}.${sniffExtension(binaryString)}`);
        await writer.write(path, binaryString);
        images.push({ path, words: panel.words });
    }
    return images;
}

/** Saves attached videos, audios or attachments, using their original filenames. */
async function exportChunkedPanels(writer, panels, fallbackName, itemKey, isCancelled) {
    const exported = [];
    for (const panel of panels) {
        checkCancelled(isCancelled);
        const fileName = sanitizeFileName(panel.fileName, fallbackName);
        const path = await writer.writeChunked(panel.s3KeyPrefix, panel.numberOfChunks, itemKey, () => writer.uniqueMediaPath(fileName), isCancelled);
        exported.push({ path, fileName, words: panel.words });
    }
    return exported;
}

function decryptInlineVideoFileName(encryptedFileNameBase64, itemKey, itemIV) {
    try {
        return decodeURI(decryptBinaryString(forge.util.decode64(encryptedFileNameBase64), itemKey, itemIV));
    } catch (error) {
        return null;
    }
}

/**
 * Saves the images and videos that are placed inside the page text.
 * Each one's id tells us where to download it from (the app reads these ids the same way):
 *   image:                "<s3Key>&..."
 *   video in pieces:      "chunks&<numberOfChunks>&<encryptedFileName>&<s3KeyPrefix>&<fileType>&<fileSize>"
 *   older one-piece video: "<s3Key>&..."
 * Returns which saved file belongs to which id. If the same image is used twice,
 * it is only downloaded once.
 */
async function exportInTextMedia(writer, contentHtml, itemKey, itemIV, isCancelled) {
    const mediaByElementId = {};
    if (!contentHtml) return mediaByElementId;
    const container = document.createElement('div');
    container.innerHTML = contentHtml;
    const pathBySource = {};
    let imageCount = 0, videoCount = 0;

    for (const img of container.querySelectorAll('.bSafesImage')) {
        checkCancelled(isCancelled);
        const s3Key = img.id.split('&')[0];
        if (!s3Key) continue;
        if (!pathBySource[s3Key]) {
            const binaryString = await readAndDecryptLargeObject(s3Key, itemKey, itemIV);
            pathBySource[s3Key] = writer.uniqueMediaPath(`inline-image${++imageCount}.${sniffExtension(binaryString)}`);
            await writer.write(pathBySource[s3Key], binaryString);
        }
        mediaByElementId[img.id] = { path: pathBySource[s3Key] };
    }

    for (const el of container.querySelectorAll('.bSafesDownloadVideo')) {
        checkCancelled(isCancelled);
        const idParts = el.id.split('&');
        const isChunked = idParts[0] === 'chunks';
        const source = isChunked ? idParts[3] : idParts[0];
        if (!source) continue;
        if (!pathBySource[source]) {
            const number = ++videoCount;
            if (isChunked) {
                const originalName = decryptInlineVideoFileName(idParts[2], itemKey, itemIV);
                pathBySource[source] = await writer.writeChunked(source, parseInt(idParts[1]), itemKey, (firstPiece) => writer.uniqueMediaPath(
                    originalName ? sanitizeFileName(originalName, 'video') : `inline-video${number}.${sniffExtension(firstPiece, 'mp4')}`
                ), isCancelled);
            } else {
                const binaryString = await readAndDecryptLargeObject(source, itemKey, itemIV);
                pathBySource[source] = writer.uniqueMediaPath(`inline-video${number}.${sniffExtension(binaryString, 'mp4')}`);
                await writer.write(pathBySource[source], binaryString);
            }
        }
        mediaByElementId[el.id] = { path: pathBySource[source] };
    }

    return mediaByElementId;
}

/**
 * Saves a drawing as a picture (drawing.png) that can be viewed but not edited.
 * The editable drawing data is not saved, on purpose.
 */
async function exportDrawing(writer, drawing, isCancelled) {
    if (!drawing || !drawing.sceneJSON) return null;
    checkCancelled(isCancelled);
    try {
        const pngBinaryString = await renderDrawingToPng(drawing.sceneJSON);
        if (!pngBinaryString) return { imagePath: null, empty: true };
        const imagePath = 'media/drawing.png';
        await writer.write(imagePath, pngBinaryString);
        return { imagePath };
    } catch (error) {
        console.error('Failed to render drawing to PNG.', error);
        return { imagePath: null, failed: true };
    }
}

/**
 * Saves one page into its own folder in the backup. It downloads and unlocks everything, then writes:
 * - page.html: the page, readable in any browser
 * - media/: all its images, videos, audios, attachments and its drawing picture
 * - manifest.json: the page's id and title, plus a fingerprint of every file.
 *   The "Open Backup" screen uses these fingerprints to spot files changed outside the app.
 * Returns what was written to manifest.json.
 */
export async function exportLeafItem(root, itemDirRelPath, itemId, decrypted, drawing, isCancelled) {
    const writer = createItemWriter(root, itemDirRelPath);
    const { itemKey, itemIV } = decrypted;

    const mediaByElementId = await exportInTextMedia(writer, decrypted.content, itemKey, itemIV, isCancelled);
    const images = await exportGalleryImages(writer, decrypted.imagePanels, itemKey, itemIV, isCancelled);
    const videos = await exportChunkedPanels(writer, decrypted.videoPanels, 'video', itemKey, isCancelled);
    const audios = await exportChunkedPanels(writer, decrypted.audioPanels, 'audio', itemKey, isCancelled);
    const attachments = await exportChunkedPanels(writer, decrypted.attachmentPanels, 'attachment', itemKey, isCancelled);
    const drawingInfo = await exportDrawing(writer, drawing, isCancelled);

    const pageHtml = buildPageHtml({
        titleHtml: decrypted.title,
        titleText: decrypted.titleText,
        tags: decrypted.tags,
        contentHtml: rewriteInlineMedia(decrypted.content, mediaByElementId),
        drawing: drawingInfo,
        images,
        videos,
        audios,
        attachments,
    });
    await writer.write('page.html', forge.util.encodeUtf8(pageHtml));

    const manifest = { id: itemId, title: decrypted.titleText, tags: decrypted.tags, files: writer.files };
    await writeFile(root, `${itemDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
    return manifest;
}

/** Saves manifest.json for a Box, Folder, Notebook, Diary or the workspace, listing what is inside it. */
export async function writeContainerManifest(root, containerDirRelPath, { id, type, title, children }) {
    const manifest = { id, type, title, children };
    await writeFile(root, `${containerDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
}

/** Saves backup-manifest.json in the chosen folder. It marks the folder as a BSafes backup and says when it was made. */
export async function writeBackupManifest(root, data) {
    await writeFile(root, 'backup-manifest.json', forge.util.encodeUtf8(JSON.stringify(data, null, 2)));
}
