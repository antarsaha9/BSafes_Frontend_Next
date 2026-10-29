const forge = require('node-forge');

import { readFile, hashFile } from './exportFsAccess';

const CONTAINER_TYPES = new Set(['Workspace', 'Box', 'Folder', 'Notebook', 'Diary']);

async function readAndParseJson(root, relPath) {
    const binaryString = await readFile(root, relPath);
    return JSON.parse(forge.util.decodeUtf8(binaryString));
}

export async function readExportManifest(root) {
    return readAndParseJson(root, 'export-manifest.json');
}

/**
 * Returns the id of the account whose export is already in the folder, or null if the folder
 * holds no export (or one that doesn't say which account made it).
 */
export async function readExportOwner(root) {
    try {
        const exportManifest = await readExportManifest(root);
        return (exportManifest && exportManifest.memberId) || null;
    } catch (error) {
        return null; // no export here yet
    }
}

export async function readContainerManifest(root, relPath) {
    return readAndParseJson(root, `${relPath}/manifest.json`);
}

/** Checks one saved page: every file its manifest.json lists must exist, unchanged. Returns the problems found. */
async function checkPage(root, relPath) {
    let manifest;
    try {
        manifest = await readAndParseJson(root, `${relPath}/manifest.json`);
    } catch (error) {
        return [{ path: 'manifest.json', reason: 'missing' }];
    }
    const problems = [];
    for (const file of manifest.files || []) {
        try {
            const actual = await hashFile(root, `${relPath}/${file.path}`, file.size);
            if (actual.size !== file.size || actual.sha256 !== file.sha256) problems.push({ path: file.path, reason: 'changed' });
        } catch (error) {
            problems.push({ path: file.path, reason: error.code === 'ENOENT' ? 'missing' : 'unreadable' });
        }
    }
    return problems;
}

/**
 * Checks a whole export for files that were changed or deleted outside the app.
 * It goes through the manifest.json files the export wrote, folder by folder, and compares
 * every saved file's size and fingerprint with the ones recorded at export time.
 * This only reads; it never changes anything.
 *
 * - onProgress(pagesChecked) is called after each page.
 * - If isCancelled() returns true, it stops and returns { cancelled: true }.
 *
 * Returns { pagesChecked, problems: [{ title, relPath, files: [{ path, reason }] }] },
 * where reason is 'changed', 'missing' or 'unreadable'.
 */
export async function checkExport(root, exportManifest, { onProgress, isCancelled } = {}) {
    const problems = [];
    let pagesChecked = 0;

    async function checkContainer(relPath, title) {
        let manifest;
        try {
            manifest = await readContainerManifest(root, relPath);
        } catch (error) {
            problems.push({ title, relPath, files: [{ path: 'manifest.json', reason: 'missing' }] });
            return false;
        }
        for (const child of manifest.children || []) {
            if (isCancelled && isCancelled()) return true;
            const childRelPath = `${relPath}/${child.relPath}`;
            if (CONTAINER_TYPES.has(child.type)) {
                if (await checkContainer(childRelPath, child.title)) return true;
            } else {
                const files = await checkPage(root, childRelPath);
                if (files.length) problems.push({ title: child.title, relPath: childRelPath, files });
                pagesChecked++;
                if (onProgress) onProgress(pagesChecked);
            }
        }
        return false;
    }

    const cancelled = await checkContainer(exportManifest.root, 'Export');
    return cancelled ? { cancelled: true } : { pagesChecked, problems };
}
