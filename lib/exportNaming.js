import { convertBinaryStringToUint8Array } from './helper';

const ILLEGAL_CHARS_RE = /[/\\:*?"<>|\x00-\x1F]/g;
const WINDOWS_RESERVED_NAMES = new Set([
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);
const MAX_NAME_LENGTH = 80;

/**
 * Makes a decrypted title (or filename) safe as a filesystem entry name on
 * Windows/macOS/Linux, while preserving as much of the original (including
 * non-Latin scripts) as possible. Not reversible - only meant for display/
 * navigation; the manifest.json id field is the source of truth for identity.
 */
export function sanitizeFsName(text, fallback = 'untitled') {
    let name = (text || '').trim();
    name = name.replace(ILLEGAL_CHARS_RE, '-');
    name = name.replace(/\s+/g, ' ').trim();
    name = name.replace(/[. ]+$/, ''); // trailing dots/spaces are stripped by Windows
    if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH).trim();
    if (!name) name = fallback;
    if (WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) name = name + '_';
    return name;
}

function shortId(itemId) {
    const cleaned = itemId.replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.slice(-8) || 'item';
}

/** Folder/file base name for an item: sanitized title + a short id suffix for uniqueness. */
export function uniqueEntryName(titleText, itemId, fallback = 'untitled') {
    return `${sanitizeFsName(titleText, fallback)}-${shortId(itemId)}`;
}

/** Splits "name.ext" into sanitized {base, ext} (ext excludes the dot, lowercased). */
export function sanitizeFileName(fileName, fallbackBase = 'file') {
    const raw = (fileName || '').trim();
    const dotIndex = raw.lastIndexOf('.');
    const rawBase = dotIndex > 0 ? raw.slice(0, dotIndex) : raw;
    const rawExt = dotIndex > 0 ? raw.slice(dotIndex + 1) : '';
    const base = sanitizeFsName(rawBase, fallbackBase);
    const ext = rawExt.replace(ILLEGAL_CHARS_RE, '').slice(0, 10).toLowerCase();
    return ext ? `${base}.${ext}` : base;
}

/** SHA-256 hex digest of a binary string (one-char-per-byte), via WebCrypto. */
export async function sha256Hex(binaryString) {
    const bytes = convertBinaryStringToUint8Array(binaryString);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
