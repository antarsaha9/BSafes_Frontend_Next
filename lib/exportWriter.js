const forge = require('node-forge');

import { writeFile } from './exportFsAccess';
import { sanitizeFileName, sha256Hex } from './exportNaming';
import { rewriteInlineMedia, buildPageHtml } from './exportPageBuilder';
import { downloadAndDecryptLargeObject, downloadAndDecryptChunkedFile, sniffImageExtension } from './exportMediaDownload';
import { ExportCancelledError } from './exportTreeWalk';

async function writeFileWithHash(root, fsRelativePath, manifestRelativePath, binaryString) {
    await writeFile(root, fsRelativePath, binaryString);
    const sha256 = await sha256Hex(binaryString);
    return { path: manifestRelativePath, sha256, size: binaryString.length };
}

function checkCancelled(isCancelled) {
    if (isCancelled && isCancelled()) throw new ExportCancelledError('Export cancelled');
}

async function exportImages(root, itemId, itemDirRelPath, imagePanels, itemKey, itemIV, isCancelled) {
    const files = [];
    const infoByS3Key = {};
    for (let i = 0; i < imagePanels.length; i++) {
        checkCancelled(isCancelled);
        const panel = imagePanels[i];
        const binaryString = await downloadAndDecryptLargeObject(itemId, panel.s3Key, itemKey, itemIV);
        const ext = sniffImageExtension(binaryString);
        const fileName = `img${i + 1}.${ext}`;
        const manifestPath = `media/${fileName}`;
        const fileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${manifestPath}`, manifestPath, binaryString);
        files.push(fileRecord);
        infoByS3Key[panel.s3Key] = { path: manifestPath, words: panel.words };
    }
    return { files, infoByS3Key };
}

async function exportVideos(root, itemId, itemDirRelPath, videoPanels, itemKey, isCancelled) {
    const files = [];
    const infoByS3KeyPrefix = {};
    for (const panel of videoPanels) {
        checkCancelled(isCancelled);
        const fileName = sanitizeFileName(panel.fileName, 'video');
        const manifestPath = `media/${fileName}`;
        const binaryString = await downloadAndDecryptChunkedFile(itemId, panel.s3KeyPrefix, panel.numberOfChunks, itemKey);
        const fileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${manifestPath}`, manifestPath, binaryString);
        files.push(fileRecord);
        infoByS3KeyPrefix[panel.s3KeyPrefix] = { path: manifestPath, words: panel.words };
    }
    return { files, infoByS3KeyPrefix };
}

async function exportAudios(root, itemId, itemDirRelPath, audioPanels, itemKey, isCancelled) {
    const files = [];
    const audios = [];
    for (const panel of audioPanels) {
        checkCancelled(isCancelled);
        const fileName = sanitizeFileName(panel.fileName, 'audio');
        const manifestPath = `media/${fileName}`;
        const binaryString = await downloadAndDecryptChunkedFile(itemId, panel.s3KeyPrefix, panel.numberOfChunks, itemKey);
        const fileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${manifestPath}`, manifestPath, binaryString);
        files.push(fileRecord);
        audios.push({ path: manifestPath, fileName, words: panel.words });
    }
    return { files, audios };
}

async function exportAttachments(root, itemId, itemDirRelPath, attachmentPanels, itemKey, isCancelled) {
    const files = [];
    const attachments = [];
    for (const panel of attachmentPanels) {
        checkCancelled(isCancelled);
        const fileName = sanitizeFileName(panel.fileName, 'attachment');
        const manifestPath = `media/${fileName}`;
        const binaryString = await downloadAndDecryptChunkedFile(itemId, panel.s3KeyPrefix, panel.numberOfChunks, itemKey);
        const fileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${manifestPath}`, manifestPath, binaryString);
        files.push(fileRecord);
        attachments.push({ path: manifestPath, fileName });
    }
    return { files, attachments };
}

/**
 * Downloads, decrypts, and writes every file for one leaf page (Notebook/Diary/Folder
 * page) under `${itemDirRelPath}/` inside `root`: page.html (with inline media rewritten
 * to local relative paths), a media/ folder with every image/video/audio/attachment, and
 * a manifest.json carrying identity + a SHA-256 hash of every file for later tamper
 * detection by the "Open Backup" viewer. Returns the manifest that was written.
 */
export async function exportLeafItem(root, itemDirRelPath, itemId, decrypted, drawing, isCancelled) {
    const allFiles = [];

    const { files: imageFiles, infoByS3Key } = await exportImages(root, itemId, itemDirRelPath, decrypted.imagePanels, decrypted.itemKey, decrypted.itemIV, isCancelled);
    allFiles.push(...imageFiles);

    const { files: videoFiles, infoByS3KeyPrefix } = await exportVideos(root, itemId, itemDirRelPath, decrypted.videoPanels, decrypted.itemKey, isCancelled);
    allFiles.push(...videoFiles);

    const { files: audioFiles, audios } = await exportAudios(root, itemId, itemDirRelPath, decrypted.audioPanels, decrypted.itemKey, isCancelled);
    allFiles.push(...audioFiles);

    const { files: attachmentFiles, attachments } = await exportAttachments(root, itemId, itemDirRelPath, decrypted.attachmentPanels, decrypted.itemKey, isCancelled);
    allFiles.push(...attachmentFiles);

    let drawingImagePath = null;
    if (drawing) {
        checkCancelled(isCancelled);
        const drawingManifestPath = 'media/drawing.png';
        const drawingFileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${drawingManifestPath}`, drawingManifestPath, drawing.imageBinaryString);
        allFiles.push(drawingFileRecord);
        drawingImagePath = drawingManifestPath;
        if (drawing.sceneJSON) {
            const sceneManifestPath = 'drawing.excalidraw.json';
            const sceneFileRecord = await writeFileWithHash(root, `${itemDirRelPath}/${sceneManifestPath}`, sceneManifestPath, forge.util.encodeUtf8(drawing.sceneJSON));
            allFiles.push(sceneFileRecord);
        }
    }

    const rewrittenContent = rewriteInlineMedia(decrypted.content, infoByS3Key, infoByS3KeyPrefix);
    const pageHtml = buildPageHtml({
        titleHtml: decrypted.title,
        titleText: decrypted.titleText,
        tags: decrypted.tags,
        contentHtml: rewrittenContent,
        drawingImagePath,
        audios,
        attachments,
    });
    const pageFileRecord = await writeFileWithHash(root, `${itemDirRelPath}/page.html`, 'page.html', forge.util.encodeUtf8(pageHtml));
    allFiles.push(pageFileRecord);

    const manifest = { id: itemId, title: decrypted.titleText, tags: decrypted.tags, files: allFiles };
    await writeFile(root, `${itemDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
    return manifest;
}

/** Writes a container's (Box/Folder/Notebook/Diary/workspace root) manifest.json listing its children. */
export async function writeContainerManifest(root, containerDirRelPath, { id, type, title, children }) {
    const manifest = { id, type, title, children };
    await writeFile(root, `${containerDirRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
}

/** Writes the top-level backup-manifest.json at the root of the chosen export folder. */
export async function writeBackupManifest(root, data) {
    await writeFile(root, 'backup-manifest.json', forge.util.encodeUtf8(JSON.stringify(data, null, 2)));
}
