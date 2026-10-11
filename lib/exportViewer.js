const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { readFile } from './exportFsAccess';
import { sha256Hex } from './exportNaming';
import { convertBinaryStringToUint8Array } from './helper';

const MIME_BY_EXTENSION = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    avif: 'image/avif', heic: 'image/heic', bmp: 'image/bmp', tif: 'image/tiff', ico: 'image/x-icon', svg: 'image/svg+xml',
    mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska',
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg',
    pdf: 'application/pdf',
};

function guessMimeFromExtension(fileName) {
    const dotIndex = fileName.lastIndexOf('.');
    const ext = dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
    return MIME_BY_EXTENSION[ext] || 'application/octet-stream';
}

async function readAndParseJson(root, relPath) {
    const binaryString = await readFile(root, relPath);
    return JSON.parse(forge.util.decodeUtf8(binaryString));
}

export async function readBackupManifest(root) {
    return readAndParseJson(root, 'backup-manifest.json');
}

export async function readContainerManifest(root, relPath) {
    return readAndParseJson(root, `${relPath}/manifest.json`);
}

/**
 * Checks that a saved page hasn't been changed since it was backed up.
 * It reads the page's manifest.json and compares each file's fingerprint
 * with the one saved during backup.
 * If any file is missing or different, the whole page is marked as changed,
 * and the app won't show it.
 * This check only reads files; it never changes them.
 */
export async function readAndVerifyItem(root, relPath) {
    const manifest = await readAndParseJson(root, `${relPath}/manifest.json`);
    const tamperedFiles = [];
    const fileContents = {};
    for (const fileRecord of manifest.files) {
        let binaryString;
        try {
            binaryString = await readFile(root, `${relPath}/${fileRecord.path}`);
        } catch (error) {
            tamperedFiles.push({ path: fileRecord.path, reason: 'missing' });
            continue;
        }
        const actualHash = await sha256Hex(binaryString);
        if (actualHash !== fileRecord.sha256) {
            tamperedFiles.push({ path: fileRecord.path, reason: 'hash-mismatch' });
            continue;
        }
        fileContents[fileRecord.path] = binaryString;
    }
    return { manifest, tampered: tamperedFiles.length > 0, tamperedFiles, fileContents };
}

/**
 * Gets a checked page ready to show inside the app.
 * It takes the page.html content, removes anything unsafe,
 * and points images, videos and links to the page's saved files.
 * Returns the page content plus a list of temporary links.
 * Call revokeBlobUrls with that list when leaving the page, to free memory.
 */
export function buildViewableFragment(fileContents) {
    const pageHtmlBinaryString = fileContents['page.html'];
    if (!pageHtmlBinaryString) return { bodyHtml: '<p>This item has no page content.</p>', blobUrls: [] };

    const pageHtmlText = forge.util.decodeUtf8(pageHtmlBinaryString);
    const document_ = new DOMParser().parseFromString(pageHtmlText, 'text/html');
    // Clean the page first, then add the file links. The cleaner (DOMPurify) would remove
    // these temporary "blob:" links. They're safe, because we create them from the checked files.
    const parsed = document.createElement('div');
    parsed.innerHTML = DOMPurify.sanitize(document_.body.innerHTML);
    const blobUrls = [];

    const rewrite = (el, attr) => {
        const relPath = el.getAttribute(attr);
        if (!relPath || !fileContents[relPath]) return;
        const bytes = convertBinaryStringToUint8Array(fileContents[relPath]);
        const blob = new Blob([bytes], { type: guessMimeFromExtension(relPath) });
        const url = URL.createObjectURL(blob);
        blobUrls.push(url);
        el.setAttribute(attr, url);
    };

    parsed.querySelectorAll('img[src], video[src]').forEach((el) => rewrite(el, 'src'));
    parsed.querySelectorAll('audio[src]').forEach((el) => rewrite(el, 'src'));
    parsed.querySelectorAll('a[href]').forEach((el) => rewrite(el, 'href'));

    return { bodyHtml: parsed.innerHTML, blobUrls };
}

export function revokeBlobUrls(blobUrls) {
    (blobUrls || []).forEach((url) => URL.revokeObjectURL(url));
}
