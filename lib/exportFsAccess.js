import { convertBinaryStringToUint8Array, convertUint8ArrayToBinaryString } from './helper';

/**
 * Lets the app pick a folder on the computer, and write or read files in it.
 *
 * It uses the browser's built-in folder access, which works inside the Electron app
 * without any extra desktop code. If that isn't available, it uses window.desktopAPI instead.
 *
 * File data goes in and out as "binary strings" (one character per byte), the same format
 * used across this app. For text such as HTML or JSON:
 * - before writing, convert it with forge.util.encodeUtf8(text)
 * - after reading, convert it back with forge.util.decodeUtf8(data)
 *
 * The pick functions return a "root" for the chosen folder. Pass it to writeFile and readFile as-is.
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
            if (error && error.name === 'AbortError') return null; // the user closed the folder picker
            throw error;
        }
    }
    return null;
}

export async function pickExportFolder() {
    const viaFsAccess = await pickFolder('readwrite');
    if (viaFsAccess) return viaFsAccess;
    if (isFileSystemAccessSupported()) return null; // the user closed the folder picker
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
