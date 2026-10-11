const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { readFile } from './exportFsAccess';
import { sha256Hex } from './exportNaming';
import { convertBinaryStringToUint8Array } from './helper';

const MIME_BY_EXTENSION = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
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
 * Reads an exported leaf item's manifest.json and re-hashes every file it lists,
 * comparing against the hash recorded at export time. Any mismatch marks the whole
 * item untrusted (fail closed) - the raw files on disk are untouched either way and
 * remain readable outside the app regardless of this check's outcome.
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
 * Turns a verified item's page.html + its already-read (and hash-verified) media files
 * into a safe-to-render HTML fragment: parses the standalone document, rewrites every
 * media reference to a blob: URL (bytes we already have in hand, no re-read/re-fetch),
 * takes just the <body> contents, and sanitizes once more for defense in depth. Returns
 * the fragment plus the created blob URLs so the caller can revoke them on navigation.
 */
export function buildViewableFragment(fileContents) {
    const pageHtmlBinaryString = fileContents['page.html'];
    if (!pageHtmlBinaryString) return { bodyHtml: '<p>This item has no page content.</p>', blobUrls: [] };

    const pageHtmlText = forge.util.decodeUtf8(pageHtmlBinaryString);
    const parsed = new DOMParser().parseFromString(pageHtmlText, 'text/html');
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

    const bodyHtml = DOMPurify.sanitize(parsed.body.innerHTML);
    return { bodyHtml, blobUrls };
}

export function revokeBlobUrls(blobUrls) {
    (blobUrls || []).forEach((url) => URL.revokeObjectURL(url));
}
