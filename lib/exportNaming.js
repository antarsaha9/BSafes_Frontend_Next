import { convertBinaryStringToUint8Array } from './helper';

const ILLEGAL_CHARS_RE = /[/\\:*?"<>|\x00-\x1F]/g;
const WINDOWS_RESERVED_NAMES = new Set([
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);
const MAX_NAME_LENGTH = 80;

/**
 * Turns a title or filename into a name that is allowed for files and folders
 * on Windows, Mac and Linux. Characters that aren't allowed are replaced with "-",
 * and very long names are shortened. Other languages and symbols are kept.
 * The original title is still saved in manifest.json.
 */
export function sanitizeFsName(text, fallback = 'untitled') {
    let name = (text || '').trim();
    name = name.replace(ILLEGAL_CHARS_RE, '-');
    name = name.replace(/\s+/g, ' ').trim();
    name = name.replace(/[. ]+$/, ''); // Windows doesn't allow names ending in a dot or space
    if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH).trim();
    if (!name) name = fallback;
    if (WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) name = name + '_';
    return name;
}

function shortId(itemId) {
    const cleaned = itemId.replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.slice(-8) || 'item';
}

/** Name for an item's folder: its title plus a short part of its id, so two items with the same title don't clash. */
export function uniqueEntryName(titleText, itemId, fallback = 'untitled') {
    return `${sanitizeFsName(titleText, fallback)}-${shortId(itemId)}`;
}

/** Makes a filename like "My Photo.JPG" safe to save, keeping its extension (in lowercase). */
export function sanitizeFileName(fileName, fallbackBase = 'file') {
    const raw = (fileName || '').trim();
    const dotIndex = raw.lastIndexOf('.');
    const rawBase = dotIndex > 0 ? raw.slice(0, dotIndex) : raw;
    const rawExt = dotIndex > 0 ? raw.slice(dotIndex + 1) : '';
    const base = sanitizeFsName(rawBase, fallbackBase);
    const ext = rawExt.replace(ILLEGAL_CHARS_RE, '').slice(0, 10).toLowerCase();
    return ext ? `${base}.${ext}` : base;
}

/** Makes a SHA-256 "fingerprint" of the data. If the data changes even slightly, the fingerprint changes. */
export async function sha256Hex(binaryString) {
    const bytes = convertBinaryStringToUint8Array(binaryString);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
