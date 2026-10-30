const forge = require('node-forge');

import { writeFile, openFileWriter, listFolder, removeEntry } from './exportFsAccess';
import { sanitizeFileName } from './exportNaming';
import { rewriteInlineMedia, buildPageBody, wrapPageHtml, buildIndexHtml, indexFileName, INDEX_ITEMS_PER_PAGE } from './exportPageBuilder';
import { storeObject, storeBody, buildPageRecord, writePageRecord, removeStaleFiles } from './exportStore';
import { readAndDecryptLargeObject, forEachDecryptedChunk, sniffExtension } from './exportMediaDownload';
import { renderDrawingToPng } from './exportDrawingRenderer';
import { decryptBinaryString } from './crypto';
import { ExportCancelledError } from './exportTreeWalk';

/**
 * Version of the exported page format. Saved in each page's manifest.json; pages saved with a
 * different number are exported again. Increase it whenever the export output changes.
 */
export const EXPORT_FORMAT = 4;

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
        const written = writer.files.find((f) => f.path === path);
        exported.push({ path, fileName, words: panel.words, size: written ? written.size : null });
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
 * Saves one page into its own folder in the export. It downloads and unlocks everything, then writes:
 * - page.html: the page, readable in any browser
 * - media/: all its images, videos, audios, attachments and its drawing picture
 * - manifest.json: the page's id, version and title, plus a fingerprint of every file.
 *   The "Open Export" screen and the next export use these fingerprints to spot files changed outside the app.
 * Files left in the folder from an older copy of the page (e.g. a removed attachment) are deleted.
 * `crumbs` are the "back" links shown at the top of page.html, `styleHref` links to the
 * export's style folder, and `label` is the page's name there and in the browser tab
 * (its title, with the date in front for a diary page).
 * Every file (and the page body) is also kept in the hidden store, linked to the visible file,
 * so the page can be rebuilt without unlocking it again if it's moved later.
 * Returns { manifest, linked } (linked is false if any file had to be copied instead of linked).
 */
export async function exportLeafItem(root, itemDirRelPath, itemId, version, decrypted, drawing, crumbs, styleHref, label, isCancelled) {
    const writer = createItemWriter(root, itemDirRelPath);
    const { itemKey, itemIV } = decrypted;

    const mediaByElementId = await exportInTextMedia(writer, decrypted.content, itemKey, itemIV, isCancelled);
    const images = await exportGalleryImages(writer, decrypted.imagePanels, itemKey, itemIV, isCancelled);
    const videos = await exportChunkedPanels(writer, decrypted.videoPanels, 'video', itemKey, isCancelled);
    const audios = await exportChunkedPanels(writer, decrypted.audioPanels, 'audio', itemKey, isCancelled);
    const attachments = await exportChunkedPanels(writer, decrypted.attachmentPanels, 'attachment', itemKey, isCancelled);
    const drawingInfo = await exportDrawing(writer, drawing, isCancelled);

    const bodyHtml = buildPageBody({
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

    // Keep the media files and the page body in the hidden store (see lib/exportStore.js).
    const mediaFiles = [...writer.files];
    let linked = true;
    for (const file of mediaFiles) {
        checkCancelled(isCancelled);
        const result = await storeObject(root, `${itemDirRelPath}/${file.path}`, file.sha256, file.size);
        if (!result.linked) linked = false;
    }
    const body = await storeBody(root, bodyHtml);

    await writer.write('page.html', forge.util.encodeUtf8(wrapPageHtml(bodyHtml, { titleText: label || decrypted.titleText, crumbs, styleHref })));

    const manifest = { id: itemId, version, exportFormat: EXPORT_FORMAT, title: decrypted.titleText, tags: decrypted.tags, files: writer.files };
    await writeFile(root, `${itemDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
    await removeStaleFiles(root, itemDirRelPath, manifest.files);
    await writePageRecord(root, buildPageRecord({
        id: itemId, version, exportFormat: EXPORT_FORMAT, title: decrypted.titleText, tags: decrypted.tags, body, files: mediaFiles,
    }));
    return { manifest, linked };
}

/**
 * Saves the pages listing a folder's contents, with links, so the export can be browsed in any
 * web browser without the app. Like the app, the list is split into pages of 20:
 * index.html, index-2.html, index-3.html, ... Pages left over from a longer list are deleted.
 */
export async function writeIndexHtml(root, dirRelPath, { title, subtitle, crumbs, items, styleHref }) {
    const filePath = (name) => (dirRelPath ? `${dirRelPath}/${name}` : name);
    const pageCount = Math.max(1, Math.ceil(items.length / INDEX_ITEMS_PER_PAGE));
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        const pageItems = items.slice((pageNumber - 1) * INDEX_ITEMS_PER_PAGE, pageNumber * INDEX_ITEMS_PER_PAGE);
        const html = buildIndexHtml({ title, subtitle, crumbs, items: pageItems, styleHref, pageNumber, pageCount, totalItems: items.length });
        await writeFile(root, filePath(indexFileName(pageNumber)), forge.util.encodeUtf8(html));
    }
    for (const entry of await listFolder(root, dirRelPath)) {
        const match = !entry.isDirectory && /^index-(\d+)\.html$/.exec(entry.name);
        if (match && parseInt(match[1], 10) > pageCount) await removeEntry(root, filePath(entry.name));
    }
}

/** Saves manifest.json for a Box, Folder, Notebook, Diary or the workspace, listing what is inside it. */
export async function writeContainerManifest(root, containerDirRelPath, { id, type, title, children }) {
    const manifest = { id, type, title, children };
    await writeFile(root, `${containerDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
}

/** Saves export-manifest.json in the chosen folder. It marks the folder as a BSafes export and says when it was made. */
export async function writeExportManifest(root, data) {
    await writeFile(root, 'export-manifest.json', forge.util.encodeUtf8(JSON.stringify(data, null, 2)));
}
