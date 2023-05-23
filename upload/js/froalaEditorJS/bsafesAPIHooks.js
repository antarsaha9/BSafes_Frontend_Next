//const domain = 'https://hivqf9prf7.execute-api.us-east-1.amazonaws.com';
const domain = 'http://localhost:3000';
window.bsafesFroala ={
    name: "abc",
}

function bSafesPreflight(fn) {
    window.bsafesFroala.bSafesPreflight(fn);
}

function rotateImage(link, exifOrientation, callback) {
    window.bsafesFroala.rotateImage(link, exifOrientation, callback);
}

function convertUint8ArrayToBinaryString(u8Array) {
    return window.bsafesFroala.convertUint8ArrayToBinaryString(u8Array);
}

function compareArraryBufferAndUnit8Array(thisBuffer, thisArray) {
    return window.bsafesFroala.compareArraryBufferAndUnit8Array(thisBuffer, thisArray);
}

function encryptBinaryString(binaryString, key) {
    return window.bsafesFroala.encryptBinaryString(binaryString, key);
}

function encryptLargeBinaryString(binaryStr, itemKey, itemIV) {
    return window.bsafesFroala.encryptLargeBinaryString(binaryStr, itemKey, itemIV);
}

function encryptChunkArrayBufferToBinaryStringAsync(arrayBuffer, key) {
    return window.bsafesFroala.encryptChunkArrayBufferToBinaryStringAsync(arrayBuffer, key);
}

function preS3Upload() {
    return  window.bsafesFroala.preS3Upload();
}

function preS3ChunkUpload(itemId, chunkIndex, timeStamp){
    return window.bsafesFroala.preS3ChunkUpload(itemId, chunkIndex, timeStamp);
}

async function postS3Upload(s3Object) {
    return  window.bsafesFroala.postS3Upload(s3Object);
}

function uploadData(data, signedURL, onProgress) {
    return window.bsafesFroala.uploadData(data, signedURL, onProgress);    
}