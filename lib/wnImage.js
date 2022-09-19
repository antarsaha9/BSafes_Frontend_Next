import { debugLog } from './helper'
const debugOn = true;

function dataURLToBinaryString(dataURI) {
    const dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
    let matches,
        mediaType,
        isBase64,
        dataString,
        byteString;
    // Parse the dataURI components as per RFC 2397
    matches = dataURI.match(dataURIPattern)
    if (!matches) {
        return null;
    }
    // Default to text/plain;charset=US-ASCII
    mediaType = matches[2] ? matches[1] : 'text/plain' + (matches[3] || ';charset=US-ASCII');
    isBase64 = !!matches[4];
    dataString = dataURI.slice(matches[0].length);
    console.log('dataString', dataString.length);
    if (isBase64) {
      // Convert base64 to raw binary data held in a string:
        byteString = atob(dataString);
    } else {
      // Convert base64/URLEncoded data component to raw binary:
        byteString = decodeURIComponent(dataString);
    }
    return byteString;
}

function dataURLToBlobAndBinaryString(dataURI) {
    return new Promise((resolve, reject) => {
        debugLog(debugOn, 'dataURLToBlobAndBinaryString');
        const byteString = dataURLToBinaryString(dataURI);
        if (!byteString) 
        { 
            reject("dataURLToBinaryString error", null, null);
            return;
        }
  
        debugLog(debugOn, 'byteString length: ', byteString.length);
        // Write the bytes of the string to an ArrayBuffer:
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i)
        }
        debugLog(debugOn, 'intArray', intArray.byteLength);
        // Write the ArrayBuffer (or ArrayBufferView) to a blob:
        const blob = new Blob([intArray], {
            type: 'image/jpeg'
        });
        debugLog(debugOn, 'blob size:', blob.size);
        resolve({blob, byteString});
    })
};

export function rotateImage(link, exifOrientation) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          const imgCV = document.createElement('canvas');
          const canvasLimit = 2048;
      
          if (img.naturalWidth > img.naturalHeight && img.naturalWidth > canvasLimit) {
            imgCV.width = canvasLimit;
            imgCV.height = img.naturalHeight / img.naturalWidth * canvasLimit;
          } else if (img.naturalHeight > img.naturalWidth && img.naturalHeight > canvasLimit) {
            imgCV.width = img.naturalWidth / img.naturalHeight * canvasLimit;
            imgCV.height = canvasLimit;
          } else {
            imgCV.width = img.naturalWidth;
            imgCV.height = img.naturalHeight;
          }
      
          let imgCtx;
          if (exifOrientation && (exifOrientation === 6 || exifOrientation === 8)) {
            const tmp = imgCV.width;
            imgCV.width = imgCV.height;
            imgCV.height = tmp;
            imgCtx = imgCV.getContext('2d');
            if (exifOrientation === 6) {
              imgCtx.rotate(90 * Math.PI / 180);
              imgCtx.drawImage(img, 0, -imgCV.width, imgCV.height, imgCV.width);
            } else {
              imgCtx.translate(imgCV.width, 0);
              imgCtx.rotate(-90 * Math.PI / 180);
              imgCtx.drawImage(img, -imgCV.height, -imgCV.width, imgCV.height, imgCV.width);
            }
          } else if (exifOrientation && exifOrientation === 3) {
            imgCtx = imgCV.getContext('2d');
            imgCtx.translate(0, imgCV.height);
            imgCtx.rotate(-180 * Math.PI / 180);
            imgCtx.drawImage(img, -imgCV.width, 0, imgCV.width, imgCV.height);
          } else {
            imgCtx = imgCV.getContext('2d');
            imgCtx.drawImage(img, 0, 0, imgCV.width, imgCV.height);
          }
          const dataURL = imgCV.toDataURL("image/jpeg", 1.0);
          try {
            const result = await dataURLToBlobAndBinaryString(dataURL)
            resolve(result);
          } catch( error) {
            debugLog(debugOn, 'dataURLToBlobAndBinaryString error:', error);
            reject(error);
          }
        }
        img.src = link;
    });
  };