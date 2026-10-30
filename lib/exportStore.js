const forge = require('node-forge');

import { writeFile, readFile, hashFile, linkFile, listFolder, removeEntry, hideEntry } from './exportFsAccess';
import { sha256Hex } from './exportNaming';
import { wrapPageHtml } from './exportPageBuilder';

/**
 * The hidden store inside the export folder. It keeps every exported page's unlocked files once,
 * named by their fingerprint, plus a small record per page. The visible files are hard links to
 * the stored ones (the same file on disk, so no extra space is used).
 * When a page is moved or renamed in the app, the next export rebuilds it from here,
 * without reading or unlocking it again.
 *
 *   .bsafes-data/objects/ab/<sha256>   file contents, named by fingerprint
 *   .bsafes-data/pages/<id>.json       one record per page (see buildPageRecord)
 */
export const STORE_DIR = '.bsafes-data';
const README = `This folder is used by BSafes to make exports faster.
It holds the same files as the export, stored once.
Please don't change, move or delete anything in it.
If it is deleted, the next export simply rebuilds it.
`;

const objectPath = (sha256) => `${STORE_DIR}/objects/${sha256.slice(0, 2)}/${sha256}`;
const recordPath = (itemId) => `${STORE_DIR}/pages/${itemId.replace(/[^A-Za-z0-9_-]/g, '_')}.json`;

/** Creates the store folder (with a README) and hides it in Windows File Explorer. */
export async function ensureStoreFolder(root) {
    await writeFile(root, `${STORE_DIR}/README.txt`, README);
    try {
        await hideEntry(root, STORE_DIR);
    } catch (error) {
        // Not hidden on Windows; everything still works.
    }
}

/**
 * Adds a just-written visible file to the store and links the two together.
 * If the store already has the same content (e.g. the same image on another page),
 * the visible file is replaced by a link to the stored one, so it's kept only once.
 * Returns { linked } (false if the drive can't make hard links and a copy was made).
 */
export async function storeObject(root, visibleRelPath, sha256, size) {
    const storedPath = objectPath(sha256);
    let alreadyStored = false;
    try {
        const stored = await hashFile(root, storedPath, size);
        alreadyStored = stored.size === size && stored.sha256 === sha256;
    } catch (error) {
        alreadyStored = false;
    }
    return alreadyStored ? linkFile(root, storedPath, visibleRelPath) : linkFile(root, visibleRelPath, storedPath);
}

/** Saves a page's body (the page.html content without its "back" links) in the store. Returns { sha256, size }. */
export async function storeBody(root, bodyHtml) {
    const binaryString = forge.util.encodeUtf8(bodyHtml);
    const sha256 = await sha256Hex(binaryString);
    const size = binaryString.length;
    try {
        const stored = await hashFile(root, objectPath(sha256), size);
        if (stored.size === size && stored.sha256 === sha256) return { sha256, size };
    } catch (error) {
        // not stored yet
    }
    await writeFile(root, objectPath(sha256), binaryString);
    return { sha256, size };
}

/**
 * A page's record in the store:
 * { id, version, exportFormat, title, tags, body: { sha256, size }, files: [{ path, sha256, size }] }
 * `files` are the page's media files (not page.html, which depends on where the page sits).
 */
export function buildPageRecord({ id, version, exportFormat, title, tags, body, files }) {
    return { id, version, exportFormat, title, tags, body, files };
}

export async function writePageRecord(root, record) {
    await writeFile(root, recordPath(record.id), forge.util.encodeUtf8(JSON.stringify(record, null, 2)));
}

/** Returns the stored record for a page, or null if there isn't a usable one. */
export async function readPageRecord(root, itemId) {
    try {
        const record = JSON.parse(forge.util.decodeUtf8(await readFile(root, recordPath(itemId))));
        return record && record.id === itemId && record.body && Array.isArray(record.files) ? record : null;
    } catch (error) {
        return null;
    }
}

/**
 * Checks every stored file of a page (and its body) is still there and unchanged.
 * This matters because a visible file edited "in place" also changes its stored copy
 * (they are the same file on disk).
 */
export async function verifyRecordObjects(root, record) {
    try {
        for (const { sha256, size } of [record.body, ...record.files]) {
            const stored = await hashFile(root, objectPath(sha256), size);
            if (stored.size !== size || stored.sha256 !== sha256) return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

/** Deletes files in a page folder (and its media/ folder) that the page's manifest doesn't list. */
export async function removeStaleFiles(root, itemDirRelPath, files) {
    const keep = new Set(['manifest.json', ...files.map((f) => f.path)]);
    for (const dir of ['', 'media']) {
        const entries = await listFolder(root, dir ? `${itemDirRelPath}/${dir}` : itemDirRelPath);
        for (const entry of entries) {
            if (entry.isDirectory) continue;
            const path = dir ? `${dir}/${entry.name}` : entry.name;
            if (!keep.has(path)) await removeEntry(root, `${itemDirRelPath}/${path}`);
        }
    }
}

/**
 * Rebuilds a page's folder from the store, without unlocking anything:
 * links its media files, rebuilds page.html (with "back" links and the style link for its new place,
 * and `label` as its name, see exportLeafItem)
 * and writes its manifest.json. Returns { linked } (false if any file had to be copied).
 */
export async function restorePageFromStore(root, pageRelPath, record, crumbs, styleHref, label) {
    let linked = true;
    for (const file of record.files) {
        const result = await linkFile(root, objectPath(file.sha256), `${pageRelPath}/${file.path}`);
        if (!result.linked) linked = false;
    }
    const bodyHtml = forge.util.decodeUtf8(await readFile(root, objectPath(record.body.sha256)));
    const pageHtml = forge.util.encodeUtf8(wrapPageHtml(bodyHtml, { titleText: label || record.title, crumbs, styleHref }));
    const pageFile = await writeFile(root, `${pageRelPath}/page.html`, pageHtml);
    const files = [...record.files, { path: 'page.html', sha256: pageFile.sha256, size: pageFile.size }];
    const manifest = { id: record.id, version: record.version, exportFormat: record.exportFormat, title: record.title, tags: record.tags, files };
    await writeFile(root, `${pageRelPath}/manifest.json`, forge.util.encodeUtf8(JSON.stringify(manifest, null, 2)));
    await removeStaleFiles(root, pageRelPath, files);
    return { linked };
}

/**
 * Cleans the store after a complete export: removes records of pages that no longer exist
 * (not in `seenIds`), then every stored file no remaining record uses.
 * Only call it when the export finished fully, so nothing still needed is removed.
 * Returns how many files were removed.
 */
export async function collectGarbage(root, seenIds) {
    const inUse = new Set();
    for (const entry of await listFolder(root, `${STORE_DIR}/pages`)) {
        if (entry.isDirectory || !entry.name.endsWith('.json')) continue;
        const relPath = `${STORE_DIR}/pages/${entry.name}`;
        let record = null;
        try {
            record = JSON.parse(forge.util.decodeUtf8(await readFile(root, relPath)));
        } catch (error) {
            record = null;
        }
        if (!record || !seenIds.has(record.id)) {
            await removeEntry(root, relPath);
            continue;
        }
        if (record.body) inUse.add(record.body.sha256);
        (record.files || []).forEach((f) => inUse.add(f.sha256));
    }
    let removed = 0;
    for (const dir of await listFolder(root, `${STORE_DIR}/objects`)) {
        if (!dir.isDirectory) continue;
        for (const entry of await listFolder(root, `${STORE_DIR}/objects/${dir.name}`)) {
            if (inUse.has(entry.name)) continue;
            await removeEntry(root, `${STORE_DIR}/objects/${dir.name}/${entry.name}`);
            removed++;
        }
    }
    return removed;
}
