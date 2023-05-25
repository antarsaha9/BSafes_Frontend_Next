//const domain = 'https://hivqf9prf7.execute-api.us-east-1.amazonaws.com';
const domain = 'http://localhost:3000';
window.bsafesFroala ={
    name: "abc",
}

export function bSafesPreflight(fn) {
    window.bsafesFroala.bSafesPreflight(fn);
}

export function rotateImage(link, exifOrientation, callback) {
    window.bsafesFroala.rotateImage(link, exifOrientation, callback);
}

export function convertUint8ArrayToBinaryString(u8Array) {
    return window.bsafesFroala.convertUint8ArrayToBinaryString(u8Array);
}

export function compareArraryBufferAndUnit8Array(thisBuffer, thisArray) {
    return window.bsafesFroala.compareArraryBufferAndUnit8Array(thisBuffer, thisArray);
}

export function encryptBinaryString(binaryString, key) {
    return window.bsafesFroala.encryptBinaryString(binaryString, key);
}

export function encryptLargeBinaryString(binaryStr, itemKey, itemIV) {
    return window.bsafesFroala.encryptLargeBinaryString(binaryStr, itemKey, itemIV);
}

export function encryptChunkArrayBufferToBinaryStringAsync(arrayBuffer, key) {
    return window.bsafesFroala.encryptChunkArrayBufferToBinaryStringAsync(arrayBuffer, key);
}

export function preS3Upload() {
    return  window.bsafesFroala.preS3Upload();
}

export function preS3ChunkUpload(itemId, chunkIndex, timeStamp){
    return window.bsafesFroala.preS3ChunkUpload(itemId, chunkIndex, timeStamp);
}

export async function postS3Upload(s3Object) {
    return  window.bsafesFroala.postS3Upload(s3Object);
}

export function uploadData(data, signedURL, onProgress) {
    return window.bsafesFroala.uploadData(data, signedURL, onProgress);    
}