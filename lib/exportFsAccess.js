import { convertBinaryStringToUint8Array, convertUint8ArrayToBinaryString } from './helper';

/**
 * Folder-pick/write/read abstraction for the local export feature. Primary path is the
 * File System Access API (available directly in Electron's Chromium renderer, no main-
 * process/IPC code needed). Falls back to `window.desktopAPI` if that API is unavailable
 * in this build's Electron configuration (older Electron, contextIsolation/sandbox
 * restrictions, or `file://` not counting as a secure context).
 *
 * Every function in this module reads/writes "binary strings" - the same one-char-per-byte
 * convention already used throughout this codebase (forge.util binary strings). Callers
 * writing UTF-8 text (HTML/JSON) must `forge.util.encodeUtf8(text)` first; callers reading
 * text back must `forge.util.decodeUtf8(binaryString)` after.
 *
 * A "root" returned by the pick* functions is an opaque handle: { kind: 'fsAccess', handle }
 * or { kind: 'desktopAPI', path }. Pass it straight through to writeFile/readFile.
 */

export function isFileSystemAccessSupported() {
    return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

async function pickFolder(mode) {
    if (isFileSystemAccessSupported()) {
        try {
            const handle = await window.showDirectoryPicker({ mode });
            return { kind: 'fsAccess', handle };
        } catch (error) {
            if (error && error.name === 'AbortError') return null; // user cancelled
            throw error;
        }
    }
    return null;
}

export async function pickExportFolder() {
    const viaFsAccess = await pickFolder('readwrite');
    if (viaFsAccess) return viaFsAccess;
    if (isFileSystemAccessSupported()) return null; // user cancelled the native picker
    if (window.desktopAPI && window.desktopAPI.chooseExportFolder) {
        const result = await window.desktopAPI.chooseExportFolder();
        if (result.status === 'cancelled') return null;
        if (result.status !== 'ok') throw new Error(result.error || 'Failed to choose export folder.');
        return { kind: 'desktopAPI', path: result.path };
    }
    throw new Error('No folder-picking capability available in this build.');
}

export async function pickBackupFolderToOpen() {
    const viaFsAccess = await pickFolder('read');
    if (viaFsAccess) return viaFsAccess;
    if (isFileSystemAccessSupported()) return null;
    if (window.desktopAPI && window.desktopAPI.chooseBackupFolder) {
        const result = await window.desktopAPI.chooseBackupFolder();
        if (result.status === 'cancelled') return null;
        if (result.status !== 'ok') throw new Error(result.error || 'Failed to choose backup folder.');
        return { kind: 'desktopAPI', path: result.path };
    }
    throw new Error('No folder-picking capability available in this build.');
}

function splitRelativePath(relativePath) {
    const parts = relativePath.split('/').filter(Boolean);
    const fileName = parts.pop();
    return { dirParts: parts, fileName };
}

async function getSubdirectoryHandle(dirHandle, relativeDirParts, create) {
    let current = dirHandle;
    for (const part of relativeDirParts) {
        current = await current.getDirectoryHandle(part, { create });
    }
    return current;
}

export async function writeFile(root, relativePath, binaryString) {
    const { dirParts, fileName } = splitRelativePath(relativePath);
    if (root.kind === 'fsAccess') {
        const dirHandle = await getSubdirectoryHandle(root.handle, dirParts, true);
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(convertBinaryStringToUint8Array(binaryString));
        await writable.close();
        return;
    }
    if (root.kind === 'desktopAPI') {
        const result = await window.desktopAPI.writeExportFile(root.path, relativePath, binaryString);
        if (result.status !== 'ok') throw new Error(result.error || `Failed to write ${relativePath}`);
        return;
    }
    throw new Error('Unknown export root kind.');
}

export async function readFile(root, relativePath) {
    const { dirParts, fileName } = splitRelativePath(relativePath);
    if (root.kind === 'fsAccess') {
        const dirHandle = await getSubdirectoryHandle(root.handle, dirParts, false);
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        return convertUint8ArrayToBinaryString(new Uint8Array(arrayBuffer));
    }
    if (root.kind === 'desktopAPI') {
        const result = await window.desktopAPI.readExportFile(root.path, relativePath);
        if (result.status !== 'ok') throw new Error(result.error || `Failed to read ${relativePath}`);
        return result.binaryString;
    }
    throw new Error('Unknown export root kind.');
}
