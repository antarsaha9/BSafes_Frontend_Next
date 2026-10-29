const forge = require('node-forge');

import { readFile, hashFile, listFolder, removeEntry } from './exportFsAccess';
import { EXPORT_FORMAT } from './exportWriter';

async function readJson(root, relPath) {
    return JSON.parse(forge.util.decodeUtf8(await readFile(root, relPath)));
}

/**
 * Checks whether a page's saved copy can be kept as it is, so the export can skip it.
 * True only if its manifest.json is for the same page and version, was made by this
 * version of the export, and every file it lists is still there, unchanged
 * (same size and fingerprint). Anything else (missing, edited, unreadable) returns false,
 * so the page is exported again, which also repairs it.
 */
export async function isPageUpToDate(root, pageRelPath, itemId, version) {
    try {
        const manifest = await readJson(root, `${pageRelPath}/manifest.json`);
        if (manifest.id !== itemId || manifest.version !== version || manifest.exportFormat !== EXPORT_FORMAT) return false;
        if (!Array.isArray(manifest.files) || !manifest.files.length) return false;
        for (const file of manifest.files) {
            const actual = await hashFile(root, `${pageRelPath}/${file.path}`, file.size);
            if (actual.size !== file.size || actual.sha256 !== file.sha256) return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Removes sub-folders of an export folder that belong to items which no longer exist
 * (deleted, moved to the trash, or renamed in the app).
 * `keepNames` are the folder names of everything still there in this export.
 * Only folders the export itself made (ones with a manifest.json that has an id) are
 * removed; any other files or folders the user put there are left alone.
 * Returns how many folders were removed.
 */
export async function pruneContainerFolder(root, containerRelPath, keepNames) {
    let removed = 0;
    for (const entry of await listFolder(root, containerRelPath)) {
        if (!entry.isDirectory || keepNames.has(entry.name)) continue;
        const folderRelPath = `${containerRelPath}/${entry.name}`;
        let manifest;
        try {
            manifest = await readJson(root, `${folderRelPath}/manifest.json`);
        } catch (error) {
            continue; // not made by the export
        }
        if (!manifest || typeof manifest.id !== 'string' || !manifest.id) continue;
        await removeEntry(root, folderRelPath);
        removed++;
    }
    return removed;
}
