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

function encryptBinaryString(binaryString, key) {
    return window.bsafesFroala.encryptBinaryString(binaryString, key);
}

function encryptLargeBinaryString(binaryStr, itemKey, itemIV) {
    return window.bsafesFroala.encryptLargeBinaryString(binaryStr, itemKey, itemIV);
}

function preS3Upload() {
    return  window.bsafesFroala.preS3Upload();
}

async function postS3Upload(s3Object) {
    return  window.bsafesFroala.postS3Upload(s3Object);
}

function uploadData(data, signedURL, onProgress) {
    return window.bsafesFroala.uploadData(data, signedURL, onProgress);    
}