import { debugLog } from './helper'
const debugOn = false;

export function rotateImage(link, exifOrientation) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          const imgCV = document.createElement('canvas');
          const canvasLimit = 8064;
      
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
          if(1) {
            imgCtx = imgCV.getContext('2d');
            imgCtx.drawImage(img, 0, 0, imgCV.width, imgCV.height);
          } else
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
          const dataURL = imgCV.toDataURL("image/*", 1.0);
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

export function downScaleImage(img, exifOrientation, size) {
  return new Promise( async (resolve, reject) => {
    const imgCV = document.createElement('canvas');
    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;
    imgCV.width = imageWidth;
    imgCV.height = imageHeight;
  
    let imgCtx;
    imgCtx = imgCV.getContext('2d');
    imgCtx.drawImage(img, 0, 0, imgCV.width, imgCV.height);
  
    let scale;
    if (imageWidth > size || imageHeight > size) {
      if (imgCV.width > imgCV.height) {
        scale = size / imgCV.width;
      } else {
        scale = size / imgCV.height;
      }
    } else {
      scale = 1;
    }
  
    try {
      const canvas = await downScaleCanvas(imgCV, scale);
      const dataURI = canvas.toDataURL("image/jpeg", 1.0);
      const byteString = dataURLToBinaryString(dataURI);
      if (!byteString) {
        debugLog(debugOn, "dataURLToBinaryString error");
        reject("dataURLToBinaryString error");
      } else {
        resolve(byteString);
      }
    } catch(error) {
      debugLog(debugOn, "downScaleCanvas error");
      reject("downScaleCanvas error");
    }
  });
};

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

function downScaleCanvas(cv, scale) {
  return new Promise( async (resolve, reject) => {
    if (!(scale > 0)) {
      reject('scale must be > 0');
      return;
    }

    try {
      scale = normaliseScale(scale);
    } catch(error) {
      debugLog(debugOn, "normaliseScale error: ", error);
      reject(error);
      return;
    }
    
    const sqScale = scale * scale; // square scale =  area of a source pixel within target
    const sw = cv.width; // source image width
    const sh = cv.height; // source image height
    const tw = Math.floor(sw * scale); // target image width
    const th = Math.floor(sh * scale); // target image height
    let sx = 0, 
          sy = 0;
    let sIndex = 0; // source x,y, index within source array
    let tx = 0,
        ty = 0,
        yIndex = 0,
        tIndex = 0; // target x,y, x,y index within target array
    let tX = 0,
        tY = 0; // rounded tx, ty
    let w = 0,
        nw = 0,
        wx = 0,
        nwx = 0,
        wy = 0,
        nwy = 0; // weight / next weight x / y
  // weight is weight of current source point within target.
  // next weight is weight of current source point within next target's point.
    let crossX = false; // does scaled px cross its current px right border ?
    let crossY = false; // does scaled px cross its current px bottom border ?
    const sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    const tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    let sR = 0,
        sG = 0,
        sB = 0; // source's current point r,g,b
    let thisStart, thisEnd, thisTime;
    let currentTime, previousTime;
    previousTime = new Date().getTime();
    let chunkRuns = 0;

    function doChunk() {
      // for (sy = 0; sy < sh; sy++)
      console.log('doChunk');
      let uploadProgress = 'doChunk ' + chunkRuns;

      while (sy < sh) {
        thisStart = new Date().getTime();
        ty = sy * scale; // y src position within target
        tY = 0 | ty; // rounded : target pixel's y
        yIndex = 3 * tY * tw; // line index within target array
        crossY = (tY !== (0 | (ty + scale)));
        if (crossY) { // if pixel is crossing botton target pixel
          wy = (tY + 1 - ty); // weight of point within target pixel
          nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
          tx = sx * scale; // x src position within target		
          tX = 0 | tx; // rounded : target pixel's x
          tIndex = yIndex + tX * 3; // target pixel index within target array
          crossX = (tX !== (0 | (tx + scale)));
          if (crossX) { // if pixel is crossing target pixel's right
            wx = (tX + 1 - tx); // weight of point within target pixel
            nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
          }
          sR = sBuffer[sIndex]; // retrieving r,g,b for curr src px.
          sG = sBuffer[sIndex + 1];
          sB = sBuffer[sIndex + 2];
          if (!crossX && !crossY) { // pixel does not cross
            // just add components weighted by squared scale.
            tBuffer[tIndex] += sR * sqScale;
            tBuffer[tIndex + 1] += sG * sqScale;
            tBuffer[tIndex + 2] += sB * sqScale;
          } else if (crossX && !crossY) { // cross on X only
            w = wx * scale;
            // add weighted component for current px
            tBuffer[tIndex] += sR * w;
            tBuffer[tIndex + 1] += sG * w;
            tBuffer[tIndex + 2] += sB * w;
            // add weighted component for next (tX+1) px
            nw = nwx * scale
            tBuffer[tIndex + 3] += sR * nw;
            tBuffer[tIndex + 4] += sG * nw;
            tBuffer[tIndex + 5] += sB * nw;
          } else if (!crossX && crossY) { // cross on Y only
            w = wy * scale;
            // add weighted component for current px
            tBuffer[tIndex] += sR * w;
            tBuffer[tIndex + 1] += sG * w;
            tBuffer[tIndex + 2] += sB * w;
            // add weighted component for next (tY+1) px
            nw = nwy * scale
            tBuffer[tIndex + 3 * tw] += sR * nw;
            tBuffer[tIndex + 3 * tw + 1] += sG * nw;
            tBuffer[tIndex + 3 * tw + 2] += sB * nw;
          } else { // crosses both x and y : four target points involved
            // add weighted component for current px
            w = wx * wy;
            tBuffer[tIndex] += sR * w;
            tBuffer[tIndex + 1] += sG * w;
            tBuffer[tIndex + 2] += sB * w;
            // for tX + 1; tY px
            nw = nwx * wy;
            tBuffer[tIndex + 3] += sR * nw;
            tBuffer[tIndex + 4] += sG * nw;
            tBuffer[tIndex + 5] += sB * nw;
            // for tX ; tY + 1 px
              nw = wx * nwy;
            tBuffer[tIndex + 3 * tw] += sR * nw;
            tBuffer[tIndex + 3 * tw + 1] += sG * nw;
            tBuffer[tIndex + 3 * tw + 2] += sB * nw;
            // for tX + 1 ; tY +1 px
            nw = nwx * nwy;
            tBuffer[tIndex + 3 * tw + 3] += sR * nw;
            tBuffer[tIndex + 3 * tw + 4] += sG * nw;
            tBuffer[tIndex + 3 * tw + 5] += sB * nw;
          }
        } // end for sx
        thisEnd = new Date().getTime();
        thisTime = thisEnd - thisStart;
        sy++;
        currentTime = new Date().getTime();

        var chunkTime = currentTime - previousTime;
        if ((chunkTime > 1000) && (sy < sh)) {
          previousTime = currentTime;

          chunkRuns++;
          setTimeout(doChunk, 1);
          return;
        }
      } // end for sy
      // create result canvas
      const resCV = document.createElement('canvas');
      resCV.width = tw;
      resCV.height = th;
      const resCtx = resCV.getContext('2d');
      const imgRes = resCtx.getImageData(0, 0, tw, th);
      const tByteBuffer = imgRes.data;
      // convert float32 array into a UInt8Clamped Array
      let pxIndex = 0; //
      for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
        tByteBuffer[tIndex] = 0 | (tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = 0 | (tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = 0 | (tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = 255;
      }
      // writing result to canvas.
      resCtx.putImageData(imgRes, 0, 0);
      const newImg = resCV;

      resolve(newImg);
    }
    setTimeout(doChunk, 1000);
  });
};

function log2(v) {
  // taken from http://graphics.stanford.edu/~seander/bithacks.html
  var b = [0x2, 0xC, 0xF0, 0xFF00, 0xFFFF0000];
  var S = [1, 2, 4, 8, 16];
  var i = 0,
    r = 0;

  for (i = 4; i >= 0; i--) {
    if (v & b[i]) {
      v >>= S[i];
      r |= S[i];
    }
  }
  return r;
};

// normalize a scale <1 to avoid some rounding issue with js numbers
function normaliseScale(s) {
  if (s > 1) throw ('s must be <1');

  s = 0 | (1 / s);
  var l = log2(s);
  var mask = 1 << l;
  var accuracy = 4;

  while (accuracy && l) {
    l--;
    mask |= 1 << l;
    accuracy--;
  }

  return 1 / (s & mask);
};