import { convertBinaryStringToUint8Array, convertUint8ArrayToBinaryString } from './helper';

/**
 * Lets the app pick an export folder on the computer, and write or read files in it,
 * using the desktop app's own (native) file functions on window.desktopAPI.
 *
 * File data goes in and out of these functions as "binary strings" (one character per byte),
 * the same format used across this app. For text such as HTML or JSON:
 * - before writing, convert it with forge.util.encodeUtf8(text)
 * - after reading, convert it back with forge.util.decodeUtf8(data)
 *
 * A chosen folder ("root") is a plain object: { kind: 'native', path, name }.
 * Pass it to the other functions as-is. The desktop app only allows reading and writing
 * inside folders the user picked, and never outside them.
 */

function desktopAPI() {
    const api = typeof window !== 'undefined' ? window.desktopAPI : null;
    if (!api || typeof api.chooseExportFolder !== 'function') {
        throw new Error('This version of the desktop app cannot export to a folder. Please update the app.');
    }
    return api;
}

function failure(result, fallbackMessage) {
    const error = new Error((result && result.error) || fallbackMessage);
    if (result && result.code) error.code = result.code;
    return error;
}

async function chooseFolder(purpose) {
    const result = await desktopAPI().chooseExportFolder({ purpose });
    if (result.status === 'cancelled') return null;
    if (result.status !== 'ok') throw failure(result, 'Failed to choose a folder.');
    return { kind: 'native', path: result.path, name: result.name };
}

/** Asks the user to pick a folder to save an export into. Returns null if they cancel. */
export function pickExportFolder() {
    return chooseFolder('export');
}

/** Asks the user to pick an export folder to open. Returns null if they cancel. */
export function pickExportFolderToOpen() {
    return chooseFolder('open');
}

/** Checks a remembered folder still exists and can be read (and written, if `write` is true). */
export async function checkFolder(root, { write = false } = {}) {
    if (!root || root.kind !== 'native') return false;
    try {
        const result = await desktopAPI().checkExportFolder(root.path, { write });
        return result.status === 'ok' && result.exists && (!write || result.writable);
    } catch (error) {
        return false;
    }
}

/**
 * Saves a whole file. Returns { size, sha256 }: the fingerprint of the bytes actually written,
 * worked out by the desktop app.
 */
export async function writeFile(root, relativePath, binaryString) {
    const result = await desktopAPI().writeExportFile(root.path, relativePath, convertBinaryStringToUint8Array(binaryString));
    if (result.status !== 'ok') throw failure(result, `Failed to write ${relativePath}`);
    return { size: result.size, sha256: result.sha256 };
}

/**
 * Saves a big file piece by piece, so it never has to be held in memory whole.
 * Call append() for each piece, then finish() (returns { size, sha256 }).
 * If anything goes wrong, call abort(): the unfinished file is deleted.
 */
export async function openFileWriter(root, relativePath) {
    const api = desktopAPI();
    const begun = await api.beginExportFile(root.path, relativePath);
    if (begun.status !== 'ok') throw failure(begun, `Failed to start writing ${relativePath}`);
    const fileId = begun.fileId;
    return {
        async append(binaryString) {
            const result = await api.appendExportFile(fileId, convertBinaryStringToUint8Array(binaryString));
            if (result.status !== 'ok') throw failure(result, `Failed to write ${relativePath}`);
        },
        async finish() {
            const result = await api.finishExportFile(fileId);
            if (result.status !== 'ok') throw failure(result, `Failed to finish writing ${relativePath}`);
            return { size: result.size, sha256: result.sha256 };
        },
        async abort() {
            try {
                await api.abortExportFile(fileId);
            } catch (error) {
                // Nothing more to do; the desktop app also cleans up unfinished files itself.
            }
        },
    };
}

/** Reads a whole file. A missing file throws an error with code 'ENOENT'. */
export async function readFile(root, relativePath) {
    const result = await desktopAPI().readExportFile(root.path, relativePath);
    if (result.status !== 'ok') throw failure(result, `Failed to read ${relativePath}`);
    return convertUint8ArrayToBinaryString(result.data);
}

/** Opens the folder in Finder / File Explorer, if the desktop app supports it. */
export async function showFolder(root) {
    const api = window.desktopAPI;
    if (root && api && typeof api.showExportFolder === 'function') await api.showExportFolder(root.path);
}

export function canShowFolder() {
    return typeof window !== 'undefined' && !!window.desktopAPI && typeof window.desktopAPI.showExportFolder === 'function';
}

/**
 * Gets a file's size and fingerprint, worked out by the desktop app without sending the file here.
 * If `expectedSize` is given and the size is different, sha256 is null (no need to read the file).
 * A missing file throws an error with code 'ENOENT'.
 */
export async function hashFile(root, relativePath, expectedSize) {
    const result = await desktopAPI().hashExportFile(root.path, relativePath, expectedSize);
    if (result.status !== 'ok') throw failure(result, `Failed to check ${relativePath}`);
    return { size: result.size, sha256: result.sha256 };
}

/** Lists what's in a folder: [{ name, isDirectory }]. A missing folder returns an empty list. */
export async function listFolder(root, relativePath) {
    const result = await desktopAPI().listExportFolder(root.path, relativePath);
    if (result.status === 'error' && result.code === 'ENOENT') return [];
    if (result.status !== 'ok') throw failure(result, `Failed to list ${relativePath}`);
    return result.entries || [];
}

/** Deletes a file, or a folder with everything in it. */
export async function removeEntry(root, relativePath) {
    const result = await desktopAPI().removeExportEntry(root.path, relativePath);
    if (result.status !== 'ok') throw failure(result, `Failed to remove ${relativePath}`);
}

/**
 * Opens the export's starting page (index.html) in the user's default web browser.
 * Throws an error with code 'ENOENT' if the export has no index.html.
 */
export async function openInBrowser(root) {
    const result = await desktopAPI().openExportInBrowser(root.path);
    if (result.status !== 'ok') throw failure(result, 'Failed to open the export in the browser.');
}

/**
 * Makes `toRelPath` a hard link to `fromRelPath`: the same file on disk under a second name,
 * without copying it. Replaces whatever was at `toRelPath`. If the drive doesn't support hard
 * links (e.g. some USB drives), the desktop app copies the file instead.
 * Returns { linked } (false when it had to copy). A missing source throws code 'ENOENT'.
 */
export async function linkFile(root, fromRelPath, toRelPath) {
    const result = await desktopAPI().linkExportFile(root.path, fromRelPath, toRelPath);
    if (result.status !== 'ok') throw failure(result, `Failed to link ${toRelPath}`);
    return { linked: result.linked !== false };
}

/** Hides a file or folder in Windows File Explorer (names starting with "." are already hidden on Mac/Linux). */
export async function hideEntry(root, relativePath) {
    const result = await desktopAPI().hideExportEntry(root.path, relativePath);
    if (result.status !== 'ok') throw failure(result, `Failed to hide ${relativePath}`);
}
