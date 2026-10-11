import { preS3Download, preS3ChunkDownload, getS3Object } from './s3Helper';
import { decryptLargeBinaryString, decryptChunkBinaryStringToBinaryStringAsync } from './crypto';

/**
 * Fetches a single (non-chunked) encrypted S3 object and decrypts it as a large binary blob.
 * Used for page-content HTML/drawing blobs and for plain images.
 */
export async function downloadAndDecryptLargeObject(itemId, s3Key, itemKey, itemIV) {
    const signedURL = await preS3Download(itemId, s3Key);
    const downloaded = await getS3Object(signedURL);
    return decryptLargeBinaryString(downloaded.binaryString, itemKey, itemIV);
}

/**
 * Fetches every chunk of a chunk-uploaded file (video/audio/attachment) and reassembles it,
 * decrypting each chunk independently (per-chunk GCM, no shared IV - matches upload scheme).
 */
export async function downloadAndDecryptChunkedFile(itemId, s3KeyPrefix, numberOfChunks, itemKey, onProgress) {
    let binaryString = '';
    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
        const { signedURL } = await preS3ChunkDownload(itemId, chunkIndex, s3KeyPrefix, false);
        const downloaded = await getS3Object(signedURL);
        const decryptedChunk = await decryptChunkBinaryStringToBinaryStringAsync(downloaded.binaryString, itemKey);
        binaryString += decryptedChunk;
        if (onProgress) onProgress(chunkIndex + 1, numberOfChunks);
    }
    return binaryString;
}

const IMAGE_MAGIC_BYTES = [
    { ext: 'jpg', bytes: [0xFF, 0xD8, 0xFF] },
    { ext: 'png', bytes: [0x89, 0x50, 0x4E, 0x47] },
    { ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
];

/**
 * Sniffs an image extension from decrypted bytes (images carry no stored filename/mime).
 * `binaryString` is a forge-style binary string (one char per byte).
 */
export function sniffImageExtension(binaryString) {
    const bytesToCheck = Math.min(12, binaryString.length);
    const bytes = new Array(bytesToCheck);
    for (let i = 0; i < bytesToCheck; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    for (const { ext, bytes: magic } of IMAGE_MAGIC_BYTES) {
        if (magic.every((b, i) => bytes[i] === b)) return ext;
    }
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return 'webp';
    }
    return 'bin';
}
