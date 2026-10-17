import { decryptLargeBinaryString, decryptChunkBinaryStringToBinaryStringAsync } from './crypto';
import { getLocalS3Object } from '../reduxStore/localBackupSlice';

async function readLocalObject(s3Key) {
    const encrypted = await getLocalS3Object(s3Key);
    if (!encrypted) throw new Error(`File ${s3Key} is not in the local backup yet.`);
    return encrypted;
}

/**
 * Reads one file from the local backup (a file stored in a single piece) and unlocks it.
 * Used for images, long page text and drawings.
 */
export async function readAndDecryptLargeObject(s3Key, itemKey, itemIV) {
    return decryptLargeBinaryString(await readLocalObject(s3Key), itemKey, itemIV);
}

/**
 * Reads a file stored in several pieces (videos, audios, attachments) from the local backup,
 * unlocks each piece, and joins them back into the original file.
 */
export async function readAndDecryptChunkedFile(s3KeyPrefix, numberOfChunks, itemKey) {
    let binaryString = '';
    await forEachDecryptedChunk(s3KeyPrefix, numberOfChunks, itemKey, async (chunk) => {
        binaryString += chunk;
    });
    return binaryString;
}

/**
 * Same as readAndDecryptChunkedFile, but hands over each unlocked piece to `onChunk`
 * (in order) instead of joining them, so a big file never has to be held in memory whole.
 */
export async function forEachDecryptedChunk(s3KeyPrefix, numberOfChunks, itemKey, onChunk) {
    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
        const encryptedChunk = await readLocalObject(`${s3KeyPrefix}_chunk_${chunkIndex}`);
        await onChunk(await decryptChunkBinaryStringToBinaryStringAsync(encryptedChunk, itemKey), chunkIndex);
    }
}

const MAGIC_BYTES = [
    { ext: 'jpg', bytes: [0xFF, 0xD8, 0xFF] },
    { ext: 'png', bytes: [0x89, 0x50, 0x4E, 0x47] },
    { ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
    { ext: 'bmp', bytes: [0x42, 0x4D] },
    { ext: 'tif', bytes: [0x49, 0x49, 0x2A, 0x00] },
    { ext: 'tif', bytes: [0x4D, 0x4D, 0x00, 0x2A] },
    { ext: 'ico', bytes: [0x00, 0x00, 0x01, 0x00] },
    { ext: 'webm', bytes: [0x1A, 0x45, 0xDF, 0xA3] },
];

// Some file types (AVIF, HEIC, MP4, MOV...) start with "ftyp" and a short type code. This maps the code to an extension.
const FTYP_BRANDS = {
    avif: 'avif', avis: 'avif',
    heic: 'heic', heix: 'heic', heim: 'heic', heis: 'heic', hevc: 'heic', hevx: 'heic', mif1: 'heic', msf1: 'heic',
    'qt  ': 'mov',
    'M4A ': 'm4a',
};

/**
 * Works out a file's type (jpg, png, mp4...) by looking at its first few bytes.
 * Needed for images and some videos, because they are saved without a filename.
 * Returns `fallback` (e.g. "bin") when the type is not recognised.
 */
export function sniffExtension(binaryString, fallback = 'bin') {
    const head = binaryString.slice(0, 32);
    const byteAt = (i) => head.charCodeAt(i);
    for (const { ext, bytes } of MAGIC_BYTES) {
        if (bytes.every((b, i) => byteAt(i) === b)) return ext;
    }
    if (head.slice(0, 4) === 'RIFF' && head.slice(8, 12) === 'WEBP') return 'webp';
    if (head.slice(4, 8) === 'ftyp') {
        if (head.slice(8).includes('avif')) return 'avif';
        const brand = head.slice(8, 12);
        return FTYP_BRANDS[brand] || 'mp4'; // any other code is treated as an MP4 video
    }
    const text = head.trimStart();
    if (text.startsWith('<svg') || (text.startsWith('<?xml') && binaryString.slice(0, 1024).includes('<svg'))) return 'svg';
    return fallback;
}
