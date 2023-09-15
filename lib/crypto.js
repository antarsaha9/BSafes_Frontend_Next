const forge = require('node-forge');
const argon2 = require('argon2-browser');
const bcrypt = require('bcryptjs');

import { debugLog, sleep, encode64Custom } from './helper'

const debugOn = false;

const __sliceLength = 512 * 1024;
const __encryptedDataSliceSize = 524304;
const GCMTag = "%GCM371%";
const __GCMOverhead = 8 + 12 + 16; //header + IV + tag 

// Crypto related helper functions
export function encryptBinaryStringCBC(binaryString, key, iv) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    let cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({
      iv: iv
    });
    cipher.update(thisBuffer);
    cipher.finish();
    const encryptedBinaryString = cipher.output.data;
    return encryptedBinaryString
}

export function decryptBinaryStringCBC(binaryString, key, iv) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    let decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({
      iv: iv
    });
    decipher.update(thisBuffer);
    decipher.finish();
    const decryptedBinaryString = decipher.output.data;
    return decryptedBinaryString;
};
  
export function encryptBinaryStringGCM(binaryString, key) {
    const thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
  
    const uniqueIV = forge.random.getBytesSync(12);
    const cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({
      iv: uniqueIV, // should be a 12-byte binary-encoded string or byte buffer
      tagLength: 128 // optional, defaults to 128 bits
    });
    cipher.update(forge.util.createBuffer(binaryString));
    cipher.finish();
    const encrypted = cipher.output;
    const tag = cipher.mode.tag;
  
    const encryptedBinaryString = GCMTag + uniqueIV + cipher.mode.tag.data + cipher.output.data;
    return encryptedBinaryString
}

export function decryptBinaryStringGCM(binaryString, key) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString.slice(__GCMOverhead));
    let uniqueIV = binaryString.slice(8, 20);
    let tag = forge.util.createBuffer();
    tag.putBytes(binaryString.slice(20, __GCMOverhead));
  
    let decipher = forge.cipher.createDecipher('AES-GCM', key);
    decipher.start({
      iv: uniqueIV,
      tagLength: 128, // optional, defaults to 128 bits
      tag: tag // authentication tag from encryption
    });
    decipher.update(thisBuffer);
    let pass = decipher.finish();
    // pass is false if there was a failure (eg: authentication tag didn't match)
    let decryptedBinaryString = null;
    if(pass) {
        // outputs decrypted hex
        decryptedBinaryString = decipher.output.data;
    } else {
        debugLog(debugOn, "corrupted data.");
    }
    return decryptedBinaryString;
  };
  
export function ECBEncryptBinaryString(binaryString, key) {
    const thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    const cipher = forge.cipher.createCipher('AES-ECB', key);
    cipher.start({
      iv: ""
    });
    cipher.update(thisBuffer);
    cipher.finish();
    const encryptedBinaryString = cipher.output.data;
    return encryptedBinaryString
}

export function ECBDecryptBinaryString(binaryString, key) {
    const thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    const decipher = forge.cipher.createDecipher('AES-ECB', key);
    decipher.start({
      iv: ""
    });
    decipher.update(thisBuffer);
    decipher.finish();
    const decryptedBinaryString = decipher.output.data;
    return decryptedBinaryString;
}

export function encryptBinaryString(binaryString, key) {
    return encryptBinaryStringGCM(binaryString, key);
}

export function decryptBinaryString(binaryString, key, iv) {
    let header = binaryString.slice(0,8);
    if(header === GCMTag) {
        return decryptBinaryStringGCM(binaryString, key);
    }   else {
        return decryptBinaryStringCBC(binaryString, key, iv);
    }
};

export function encryptLargeBinaryString(binaryString, key) {
    let start = 0;
    const sliceLength = __sliceLength;
    let end;
    let encryptedString = "";
    let numberOfSlices = 0;

    debugLog(debugOn, "encryptLargeBinaryString");
  
    while (1) {
        numberOfSlices++;
        end = start + sliceLength;
        if (end >= (binaryString.length)) {
            let sliceStr = binaryString.slice(start, binaryString.length);
            let encryptedSlice = encryptBinaryString(sliceStr, key);
            encryptedString += encryptedSlice;
            debugLog(debugOn, `slice length: ${sliceStr.length}, encryptedSlice length: ${encryptedSlice.length}, encryptedString length:${encryptedString.length}`);
            break;
      } else {
        let sliceStr = binaryString.slice(start, end);
        let encryptedSlice = encryptBinaryString(sliceStr, key);
        encryptedString += encryptedSlice;
        start = end;
        debugLog(debugOn, `slice length: ${sliceStr.length}, encryptedSlice length: ${encryptedSlice.length}, encryptedString length:${encryptedString.length}`);
      }
    }
  
    return encryptedString;
  }
  
export function decryptLargeBinaryString(binaryString, key, iv) {
    const header = binaryString.slice(0, 8);
    let GCMMode = false;
    debugLog(debugOn, 'decryptLargeBinaryString');
    if(header === GCMTag) {
        GCMMode = true;
    }
    let start = 0;
    let sliceLength = __encryptedDataSliceSize;
    if(GCMMode) {
        sliceLength = __sliceLength + __GCMOverhead;
    }
    let end;
    let decryptedString = "";
    let numberOfSlices = 0;
    while (1) {
        numberOfSlices++;
        end = start + sliceLength;
        if (end >= (binaryString.length)) {
            let sliceStr = binaryString.slice(start, binaryString.length);
            let decryptedSlice = decryptBinaryString(sliceStr, key, iv);
            decryptedString += decryptedSlice;
            debugLog(debugOn, `slice length: ${sliceStr.length}, decrypted slice length: ${decryptedSlice.length}, decrypted string length:${decryptedString.length}`);
            break;
        } else {
            let sliceStr = binaryString.slice(start, end);
            let decryptedSlice = decryptBinaryString(sliceStr, key, iv);
            decryptedString += decryptedSlice;
            start = end;
            debugLog(debugOn, `slice length: ${sliceStr.length}, decrypted slice length: ${decryptedSlice.length}, decrypted string length:${decryptedString.length}`);
        }
    }
    return decryptedString;
}

function __estimateEncryptedDataSize(dataSize) {
    const numberOfSlice = Math.floor(dataSize / __sliceLength);
    const lastSliceLength = dataSize % __sliceLength;
    let encryptedDataSize;
  
    if (lastSliceLength) {
      encryptedDataSize = lastSliceLength + __GCMOverhead + numberOfSlice * (__sliceLength + __GCMOverhead);
    } else {
      encryptedDataSize = numberOfSlice * (__sliceLength + __GCMOverhead);
    }
  
    return encryptedDataSize;
};

function __estimateDecryptedDataSize(dataSize, mode) {
	var encryptedDataSliceSize = __encryptedDataSliceSize;
	if(mode === "GCMMode") {
		encryptedDataSliceSize = __sliceLength + __GCMOverhead;
	}
  var numberOfSlice = Math.floor(dataSize / encryptedDataSliceSize);
  var lastSliceLength = dataSize % encryptedDataSliceSize;
	if(lastSliceLength) {
		if(mode === "GCMMode") {
			var decryptedDataSize = numberOfSlice * __sliceLength + lastSliceLength - __GCMOverhead;
  	} else {
			var decryptedDataSize = numberOfSlice * __sliceLength + lastSliceLength - 1;
		}
	} else {
		var decryptedDataSize = numberOfSlice * __sliceLength;
	}
  return decryptedDataSize;
};

export function compareArraryBufferAndUnit8Array(thisBuffer, thisArray) {
  const view = new DataView(thisBuffer);
  let charCode;
  if(thisBuffer.byteLength !== thisArray.length) {
    return false;
  }
  for(let i=0; i<thisBuffer.byteLength; i++) {
    charCode = view.getUint8(i, false);
    if(charCode !== thisArray[i]){
      return false;
    }
  }
  return true;
}

export function encryptChunkArrayBufferToBinaryStringAsync(arrayBuffer, key) {
  return new Promise(async (resolve, reject) => { 
    const view = new DataView(arrayBuffer);
    const encryptedDataSize = __estimateEncryptedDataSize(arrayBuffer.byteLength);
    debugLog(debugOn, "string.length, encryptedDataSize", arrayBuffer.byteLength, encryptedDataSize);  
    
    let encryptedBinaryString = "";

    let sliceLength = __sliceLength;
    let numberOfSlices = Math.floor(arrayBuffer.byteLength/sliceLength) + 1;
    let sliceIndex, start=0, end, sliceStr, offset, encryptedSlice;
    
    function encryptASlice(index){
      return new Promise((resolve)=> {
        sliceStr = ""
        let t1, t2, t3, t4;
        if(index === numberOfSlices-1){
          debugLog(debugOn, `copying sliceStr: ${Date.now()}`);
          for (offset = start; offset < arrayBuffer.byteLength; offset++) {
            sliceStr += String.fromCharCode(view.getUint8(offset, false));
          }
          debugLog(debugOn, `encryptBinaryString: ${Date.now()}`);
          encryptedSlice = encryptBinaryString(sliceStr, key);
          debugLog(debugOn, 'encryptedSlice.length:', encryptedSlice.length);
          debugLog(debugOn, `copying encryptedSlice: ${Date.now()}`);
          encryptedBinaryString += encryptedSlice;
          debugLog(debugOn, `copied encryptedSlice done: ${Date.now()}`);
        } else {
          end = start + sliceLength;
          t1 = Date.now();  
          debugLog(debugOn, `copying sliceStr: ${t1}`);
          for (offset = start; offset < end; offset++) {
            sliceStr += String.fromCharCode(view.getUint8(offset, false));
          }
          t2 = Date.now();  
          debugLog(debugOn, `encryptBinaryString: ${t2} delta:${t2-t1} ms`);
          encryptedSlice = encryptBinaryString(sliceStr, key);
          debugLog(debugOn, 'encryptedSlice.length:', encryptedSlice.length);
          t3 = Date.now();
          debugLog(debugOn, `copying encryptedSlice: ${t3} delta:${t3-t2} ms`);
          encryptedBinaryString += encryptedSlice;
          t4 = Date.now();
          debugLog(debugOn, `copied encryptedSlice done: ${t4} delta:${t4-t3} ms`);
          start = end;
        }
        resolve();
      });
    }

    for(sliceIndex = 0; sliceIndex < numberOfSlices; sliceIndex ++){
      debugLog(debugOn, `encryptASlice ${sliceIndex}: ${Date.now()}`);
      await encryptASlice(sliceIndex);
      debugLog(debugOn, `encryptASlice ${sliceIndex} done: ${Date.now()}`);
      await sleep(1);
    }
    resolve(encryptedBinaryString);
  })     
}

export function decryptChunkBinaryStringToUinit8ArrayAsync(encryptedString, key, iv) {
  return new Promise(async (resolve, reject) => { 
    let mode = "";
    let header = "";
    for(let i=0; i< 8; i++) {
      header += encryptedString[i];
    }
    if(header === GCMTag) {
      mode = "GCMMode";
    }
    let start = 0;
    let decryptedStart = 0;
    let sliceLength = __encryptedDataSliceSize;
    if(mode === "GCMMode") {
      sliceLength = __sliceLength + __GCMOverhead;
    }
    let end;
    let sliceStr;
    let decryptedSlice;
    let decryptedDataSize = __estimateDecryptedDataSize(encryptedString.length, mode);
    let decryptedUint8Array = new Uint8Array(decryptedDataSize);
    let numberOfSlices = Math.floor(encryptedString.length/sliceLength) + 1;
    let decryptedLength = 0;
    let actualDataInUnit8Array;

    function decryptASlice(index) {
      return new Promise(async (resolve) => {
        debugLog(debugOn, 'decrypting slice:', index);
        sliceStr = "";
        if (index === numberOfSlices-1) {
          for (let offset = start; offset < encryptedString.length; offset++) {
            sliceStr += encryptedString[offset];
          }
          debugLog(debugOn, 'sliceStr length:', sliceStr.length);
          decryptedSlice = decryptBinaryString(sliceStr, key, iv);
          decryptedLength += decryptedSlice.length;
          debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedLength);
          for (var offset = decryptedStart; offset < decryptedStart + decryptedSlice.length; offset++) {
            decryptedUint8Array[offset] = decryptedSlice.charCodeAt(offset - decryptedStart);
          }
        } else {
          end = start + sliceLength;
          for (var offset = start; offset < end; offset++) {
            sliceStr += encryptedString[offset];
          }
          debugLog(debugOn, 'sliceStr length:', sliceStr.length);
          decryptedSlice = decryptBinaryString(sliceStr, key, iv);
          decryptedLength += decryptedSlice.length;
          debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedLength);
          for (var offset = decryptedStart; offset < decryptedStart + __sliceLength; offset++) {
            decryptedUint8Array[offset] = decryptedSlice.charCodeAt(offset - decryptedStart);
          }
          decryptedStart += __sliceLength;
          start = end;
        } 
        resolve();
      });    
    }

    for(let i=0; i<numberOfSlices; i++) {
      await decryptASlice(i);
      await sleep(1);
    }
    actualDataInUnit8Array = decryptedUint8Array.subarray(0, decryptedLength);
    resolve(actualDataInUnit8Array);
  });
}

export function encryptChunkBinaryStringToBinaryStringAsync(chunkStr, key) {
  return new Promise(async (resolve) => { 
    const encryptedDataSize = __estimateEncryptedDataSize(chunkStr.length);
    debugLog(debugOn, "string.length, encryptedDataSize", chunkStr.length, encryptedDataSize);  
    
    let encryptedBinaryString = "";

    let sliceLength = __sliceLength;
    let numberOfSlices = Math.floor(chunkStr.length/sliceLength) + 1;
    let sliceIndex, start=0, end, sliceStr, offset, encryptedSlice;
    
    function encryptASlice(index){
      return new Promise((resolve)=> {
        sliceStr = ""
        let t1, t2, t3, t4;
        if(index === numberOfSlices-1){
          debugLog(debugOn, `copying sliceStr: ${Date.now()}`);
          sliceStr = chunkStr.slice(start)
          debugLog(debugOn, `encryptBinaryString: ${Date.now()}`);
          encryptedSlice = encryptBinaryString(sliceStr, key);
          debugLog(debugOn, 'encryptedSlice.length:', encryptedSlice.length);
          debugLog(debugOn, `copying encryptedSlice: ${Date.now()}`);
          encryptedBinaryString += encryptedSlice;
          debugLog(debugOn, `copied encryptedSlice done: ${Date.now()}`);
        } else {
          end = start + sliceLength;
          t1 = Date.now();  
          debugLog(debugOn, `copying sliceStr: ${t1}`);
          sliceStr = chunkStr.slice(start, end)
          t2 = Date.now();  
          debugLog(debugOn, `encryptBinaryString: ${t2} delta:${t2-t1} ms`);
          encryptedSlice = encryptBinaryString(sliceStr, key);
          debugLog(debugOn, 'encryptedSlice.length:', encryptedSlice.length);
          t3 = Date.now();
          debugLog(debugOn, `copying encryptedSlice: ${t3} delta:${t3-t2} ms`);
          encryptedBinaryString += encryptedSlice;
          t4 = Date.now();
          debugLog(debugOn, `copied encryptedSlice done: ${t4} delta:${t4-t3} ms`);
          start = end;
        }
        resolve();
      });
    }

    for(sliceIndex = 0; sliceIndex < numberOfSlices; sliceIndex ++){
      debugLog(debugOn, `encryptASlice ${sliceIndex}: ${Date.now()}`);
      await encryptASlice(sliceIndex);
      debugLog(debugOn, `encryptASlice ${sliceIndex} done: ${Date.now()}`);
      await sleep(1);
    }
    resolve(encryptedBinaryString);
  })     
}

export function decryptChunkBinaryStringToBinaryStringAsync(encryptedString, key, iv) {
  return new Promise(async (resolve, reject) => { 
    let mode = "";
    let header = "";
    let decryptedString = "";
    for(let i=0; i< 8; i++) {
      header += encryptedString[i];
    }
    if(header === GCMTag) {
      mode = "GCMMode";
    }
    let start = 0;
    let decryptedStart = 0;
    let sliceLength = __encryptedDataSliceSize;
    if(mode === "GCMMode") {
      sliceLength = __sliceLength + __GCMOverhead;
    }
    let end;
    let sliceStr;
    let decryptedSlice;
    let numberOfSlices = Math.floor(encryptedString.length/sliceLength) + 1;

    function decryptASlice(index) {
      return new Promise(async (resolve) => {
        debugLog(debugOn, 'decrypting slice:', index);
        sliceStr = "";
        if (index === numberOfSlices-1) {
          for (let offset = start; offset < encryptedString.length; offset++) {
            sliceStr += encryptedString[offset];
          }
          debugLog(debugOn, 'sliceStr length:', sliceStr.length);
          decryptedSlice = decryptBinaryString(sliceStr, key), iv;
          decryptedString += decryptedSlice;
          debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedString.length);
        } else {
          end = start + sliceLength;
          for (var offset = start; offset < end; offset++) {
            sliceStr += encryptedString[offset];
          }
          debugLog(debugOn, 'sliceStr length:', sliceStr.length);
          decryptedSlice = decryptBinaryString(sliceStr, key, iv);
          decryptedString += decryptedSlice;
          debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedString.length);
          start = end;
        } 
        resolve();
      });    
    }

    for(let i=0; i<numberOfSlices; i++) {
      await decryptASlice(i);
      await sleep(1);
    }
    
    resolve(decryptedString);
  });
}

export function decryptArrayBufferAsync(arrayBuffer, key, iv) {
    return new Promis(async (resolve) => { 
      const view = new DataView(arrayBuffer);
      let mode = "";
      let header = "";
      for(let i=0; i< 8; i++) {
        header += String.fromCharCode(view.getUint8(i, false));
      }
      if(header === GCMTag) {
        mode = "GCMMode";
      }
      let start = 0;
      let decryptedStart = 0;
      let sliceLength = __encryptedDataSliceSize;
      if(mode === "GCMMode") {
        sliceLength = __sliceLength + __GCMOverhead;
      }
      let end;
      let sliceStr;
      let decryptedSlice;
      let decryptedDataSize = __estimateDecryptedDataSize(arrayBuffer.byteLength, mode);
      let decryptedUint8Array = new Uint8Array(decryptedDataSize);
      let numberOfSlices = Math.floor(arrayBuffer.byteLength/sliceLength) + 1;
      let decryptedLength = 0;
      let actualDataInUnit8Array;
  
      function decryptASlice(index) {
        return new Promis(async (resolve) => {
          debugLog(debugOn, 'decrypting slice:', index);
          sliceStr = "";
          if (index === numberOfSlices-1) {
            for (let offset = start; offset < arrayBuffer.byteLength; offset++) {
              sliceStr += String.fromCharCode(view.getUint8(offset, false));
            }
            debugLog(debugOn, 'sliceStr length:', sliceStr.length);
            decryptedSlice = decryptBinaryString(sliceStr, key, iv);
            decryptedLength += decryptedSlice.length;
            debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedLength);
            for (var offset = decryptedStart; offset < decryptedStart + decryptedSlice.length; offset++) {
              decryptedUint8Array[offset] = decryptedSlice.charCodeAt(offset - decryptedStart);
            }
          } else {
            end = start + sliceLength;
            for (var offset = start; offset < end; offset++) {
              sliceStr += String.fromCharCode(view.getUint8(offset, false));
            }
            debugLog(debugOn, 'sliceStr length:', sliceStr.length);
            decryptedSlice = decryptBinaryString(sliceStr, key, iv);
            decryptedLength += decryptedSlice.length;
            debugLog(debugOn, 'decryptedSlice length, totalLength:', decryptedSlice.length, decryptedLength);
            for (var offset = decryptedStart; offset < decryptedStart + __sliceLength; offset++) {
              decryptedUint8Array[offset] = decryptedSlice.charCodeAt(offset - decryptedStart);
            }
            decryptedStart += __sliceLength;
            start = end;
          } 
          resolve();
        });    
      }
  
      for(let i=0; i<numberOfSlices; i++) {
        await decryptASlice(i);
        await sleep(1);
      }
      actualDataInUnit8Array = decryptedUint8Array.subarray(0, decryptedLength);
      resolve(actualDataInUnit8Array);
    });
}

export function stringToEncryptedTokensCBC(str, searchKey, searchIV) {
    var thisStr = str.toLowerCase();
    var re = /\s*[\s,.;!?]\s*/;
    var slices = thisStr.split(re);
    var encryptedTokens = [];
  
    for (var i = 0; i < slices.length; i++) {
      if (slices[i].length) {
        var encodedSlice = forge.util.encodeUtf8(slices[i]);
        var encryptedToken = encryptBinaryStringCBC(encodedSlice, searchKey, searchIV);
        var base64Token = forge.util.encode64(encryptedToken);
        encryptedTokens.push(base64Token);
      }
    }
    return encryptedTokens;
};

export function stringToEncryptedTokensECB(str, searchKey) {
  var thisStr = str.toLowerCase();
  var re = /\s*[\s,.;!?]\s*/;
  var slices = thisStr.split(re);
  var encryptedTokens = [];

  for (var i = 0; i < slices.length; i++) {
    if (slices[i].length) {
      var encodedSlice = forge.util.encodeUtf8(slices[i]);
      var encryptedToken = ECBEncryptBinaryString(encodedSlice, searchKey);
      var base64Token = forge.util.encode64(encryptedToken);
      encryptedTokens.push(base64Token);
    }
  }
  return encryptedTokens;
};

export function tokenfieldToEncryptedArray(thisArray, key) {
    var encryptedArray = [];
  
    for (var i = 0; i < thisArray.length; i++) {
      if (thisArray[i].length) {
        var encodedElement = forge.util.encodeUtf8(thisArray[i]);
        var encryptedElement = encryptBinaryString(encodedElement, key);
        encryptedArray.push(forge.util.encode64(encryptedElement));
      }
    }
    return encryptedArray;
}

export function tokenfieldToEncryptedTokensCBC(thisArray, searchKey, searchIV) {
    var encryptedTokens = [];
  
    for (var i = 0; i < thisArray.length; i++) {
      if (thisArray[i].length) {
        var thisStr = thisArray[i].toLowerCase();
        var encodedToken = forge.util.encodeUtf8(thisStr);
        var encryptedToken = encryptBinaryStringCBC(encodedToken, searchKey, searchIV);
        var base64Token = forge.util.encode64(encryptedToken);
        encryptedTokens.push(base64Token);
        var re = /\s*[\s,.;!?]\s*/;
        var slices = thisStr.split(re);
        if (slices.length > 1) {
          for (var j = 0; j < slices.length; j++) {
            if (slices[j].length) {
              var encodedSlice = forge.util.encodeUtf8(slices[j]);
              var encryptedToken = encryptBinaryStringCBC(encodedSlice, searchKey, searchIV);
              var base64Token = forge.util.encode64(encryptedToken);
              encryptedTokens.push(base64Token);
            }
          }
        }
      }
    }
    return encryptedTokens;
};

export function tokenfieldToEncryptedTokensECB(thisArray, searchKey) {
  var encryptedTokens = [];

  for (var i = 0; i < thisArray.length; i++) {
    if (thisArray[i].length) {
      var thisStr = thisArray[i].toLowerCase();
      var encodedToken = forge.util.encodeUtf8(thisStr);
      var encryptedToken = ECBEncryptBinaryString(encodedToken, searchKey);
      var base64Token = forge.util.encode64(encryptedToken);
      encryptedTokens.push(base64Token);
      var re = /\s*[\s,.;!?]\s*/;
      var slices = thisStr.split(re);
      if (slices.length > 1) {
        for (var j = 0; j < slices.length; j++) {
          if (slices[j].length) {
            var encodedSlice = forge.util.encodeUtf8(slices[j]);
            var encryptedToken = ECBEncryptBinaryString(encodedSlice, searchKey);
            var base64Token = forge.util.encode64(encryptedToken);
            encryptedTokens.push(base64Token);
          }
        }
      }
    }
  }
  return encryptedTokens;
};

export async function calculateCredentials(nickname, password, logInOnly = false) {
    let credentials = {};
    credentials.secret = {};
    credentials.keyPack = { schemeVersion: 3 };
    const startTime = Date.now();

    // Deriving the salt from nickname
    let md = forge.md.sha256.create();
    md.update(nickname);      
    let result = forge.util.hexToBytes(md.digest().toHex());
    md = forge.md.sha256.create();
    md.update(result);
    result = forge.util.hexToBytes(md.digest().toHex());

    const keySalt = result.substring(0, 16);
    debugLog(debugOn,  "keySalt:", keySalt.length);
    credentials.secret.keySalt = keySalt;
    credentials.secret.keySalt64 = encode64Custom(keySalt);

    const idSalt = result.substring(16, 32);

    try {
        let result;
        result= await argon2.hash({
            pass: password, 
            salt: keySalt,
            time: 2,
            mem: 100 * 1024,
            hashLen: 32,
            parallelism: 2,
            type: argon2.ArgonType.Argon2id
        })
        debugLog(debugOn,  result.hashHex);
        credentials.secret.expandedKeyHex = result.hashHex;

        const expandedKey = forge.util.hexToBytes(result.hashHex);
        debugLog(debugOn,  expandedKey);
        credentials.secret.expandedKey = expandedKey;

        const expandedKey64 = encode64Custom(expandedKey);
        credentials.secret.expandedKey64 = expandedKey64;
                
        const keySaltIV = ";)H{BP_f@)QhrJqy";
        const encryptedKeySalt = encryptBinaryStringCBC(keySalt, credentials.secret.expandedKey, keySaltIV);
        const encryptedKeySalt64 = encode64Custom(encryptedKeySalt).substring(0, 20);
 
        const idSaltIV = "q_f7^HQy{jdhrJ@)";
        const encryptedIdSalt = encryptBinaryStringCBC(idSalt, credentials.secret.expandedKey, idSaltIV);
        let newBytes = forge.util.encode64(encryptedIdSalt);
        newBytes = newBytes.replace(/\+/g, '0');
        credentials.keyPack.idSalt = "$2a$10$" + newBytes;

        result = await new Promise ((resolve, reject) => {
            
            bcrypt.hash(expandedKey, credentials.keyPack.idSalt, function(err, hash) {
                if(err) {
                        reject(null);
                } else {
                        let keyHash = hash.substring(28, hash.length)
                        resolve(keyHash);
                }
            });
            
        });
        const keyHash64 = encode64Custom(result);

        credentials.keyPack.id = encryptedKeySalt64 + keyHash64;

        const generateRSAKeyPair = async () => {
            return new Promise ((resolve, reject) => {
                const pki = forge.pki;
                const rsa = forge.pki.rsa;
                rsa.generateKeyPair({
                bits: 2048,
                workers: 2
                }, function(err, keypair) {
                    if(err) {
                        reject(null);
                    } else {
                        const publicKey = keypair.publicKey;
                        const privateKey = keypair.privateKey;
                        const publicKeyPem = pki.publicKeyToPem(publicKey);          
                        const privatePem = pki.privateKeyToPem(privateKey);
                        resolve({publicKey: publicKeyPem, privateKey: privatePem});
                    }   
                });
            });
        };

        if(!logInOnly) {
            const keyPair = await generateRSAKeyPair();
            credentials.secret.keyPair = keyPair;

            // Calculating encrypted privateKey
            const privateKeyEnvelope = encryptBinaryString(keyPair.privateKey, credentials.secret.expandedKey);
            const encodedPrivateKeyEnvelope = forge.util.encode64(privateKeyEnvelope);
            credentials.keyPack.publicKey = forge.util.encode64(credentials.secret.keyPair.publicKey);
            credentials.keyPack.privateKeyEnvelope = encodedPrivateKeyEnvelope;
        
            // Calculating search key
            const salt = forge.random.getBytesSync(32);
            const randomKey = forge.random.getBytesSync(32);
            const searchKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
            const searchKeyEnvelope = encryptBinaryString(searchKey, expandedKey);
            const encodedSearchKeyEnvelope = forge.util.encode64(searchKeyEnvelope);
            credentials.keyPack.searchKeyEnvelope = encodedSearchKeyEnvelope;
            const searchIV = forge.random.getBytesSync(16);
            const searchIVEnvelope = encryptBinaryString(searchIV, expandedKey);
            const encodedSearchIVEnvelope = forge.util.encode64(searchIVEnvelope);
            credentials.keyPack.searchIVEnvelope = encodedSearchIVEnvelope;
        }
        const endTime = Date.now();

        credentials.calculationTime = endTime - startTime;
        
        return credentials;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function saveLocalCredentials(credentials, sessionKey, sessionIV, accountVersion='v2') {
    const cipher = forge.cipher.createCipher('AES-GCM', sessionKey);
    cipher.start({
      iv: sessionIV, // should be a 12-byte binary-encoded string or byte buffer
      tagLength: 128 // optional, defaults to 128 bits
    });
    cipher.update(forge.util.createBuffer(credentials.secret.expandedKey));
    cipher.finish();

    let encodedGold = forge.util.encode64(cipher.mode.tag.data + cipher.output.data);
    localStorage.setItem("memberId", credentials.memberId);
    localStorage.setItem("displayName", credentials.displayName);
    localStorage.setItem("encodedGold", encodedGold);
    localStorage.setItem("publicKey", credentials.keyPack.publicKey);
    localStorage.setItem("encodedPrivateKeyEnvelope", credentials.keyPack.privateKeyEnvelope);
    localStorage.setItem("encodedSearchKeyEnvelope", credentials.keyPack.searchKeyEnvelope);

    if(accountVersion === 'v1') {
      localStorage.setItem("accountVersion", 'v1');
      localStorage.setItem("encodedEnvelopeIV", credentials.keyPack.envelopeIV);
      localStorage.setItem("encodedSearchIV",credentials.keyPack.searchKeyIV);
    } else if(accountVersion === 'v2') {
      localStorage.setItem("accountVersion", 'v2');
      localStorage.setItem("encodedSearchIVEnvelope", credentials.keyPack.searchIVEnvelope);
    }

}

export function clearLocalCredentials(accountVersion) {
  localStorage.removeItem("memberId");
  localStorage.removeItem("displayName");
  localStorage.removeItem("encodedGold");
  localStorage.removeItem("publicKey");
  localStorage.removeItem("encodedPrivateKeyEnvelope");
  localStorage.removeItem("encodedSearchKeyEnvelope");

  if(accountVersion === 'v1') {
    localStorage.removeItem("accountVersion", 'v1');
    localStorage.removeItem("encodedEnvelopeIV");
    localStorage.removeItem("encodedSearchIV");
  } else if(accountVersion === 'v2') {
    localStorage.removeItem("accountVersion", 'v2');
    localStorage.removeItem("encodedSearchIVEnvelope");
  }

}

export function readLocalCredentials(sessionKey, sessionIV) {
    let thisDiscovery = localStorage.getItem("encodedGold");
    if(!thisDiscovery) return null;
    let credentials = {secret:{}, keyPack:{}};
    const accountVersion = localStorage.getItem("accountVersion");
    
    credentials.accountVersion = accountVersion;
    credentials.memberId = localStorage.getItem("memberId");
    credentials.displayName = localStorage.getItem("displayName");
    
    let decoded = forge.util.decode64(thisDiscovery);

    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(decoded.slice(16/*tag bytes*/)); 
    let tag = forge.util.createBuffer();
    tag.putBytes(decoded.slice(0, 16));
  
    let decipher = forge.cipher.createDecipher('AES-GCM', sessionKey);
    decipher.start({
      iv: sessionIV,
      tagLength: 128, // optional, defaults to 128 bits
      tag: tag // authentication tag from encryption
    });
    decipher.update(thisBuffer);
    let pass = decipher.finish();
    // pass is false if there was a failure (eg: authentication tag didn't match)
    let decryptedBinaryString = null;
    if(pass) {
        // outputs decrypted hex
        decryptedBinaryString = decipher.output.data;
    } else {
        debugLog(debugOn, "corrupted data.");
    }
    credentials.secret.expandedKey = decryptedBinaryString;
    credentials.keyPack.publicKey = forge.util.decode64(localStorage.getItem("publicKey"));
    
    let encodedPrivateKeyEnvelope = localStorage.getItem("encodedPrivateKeyEnvelope");
    let privateKeyEnvelope = forge.util.decode64(encodedPrivateKeyEnvelope);
    
    if(accountVersion === 'v1'){
      const envelopeIV = forge.util.decode64(localStorage.getItem("encodedEnvelopeIV"));
      credentials.secret.privateKey = decryptBinaryString(privateKeyEnvelope, credentials.secret.expandedKey, envelopeIV);
    } else if (accountVersion === 'v2'){
      credentials.secret.privateKey = decryptBinaryString(privateKeyEnvelope, credentials.secret.expandedKey);
    }
    
    if(accountVersion === 'v1'){
      const searchKeyEnvelope = forge.util.decode64(localStorage.getItem("encodedSearchKeyEnvelope"));
      const searchKeyIV = forge.util.decode64(localStorage.getItem("encodedSearchIV"));
      credentials.secret.searchKey = decryptBinaryString(searchKeyEnvelope, credentials.secret.expandedKey, searchKeyIV);
    } else if (accountVersion === 'v2'){
      let encodedSearchKeyEnvelope = localStorage.getItem("encodedSearchKeyEnvelope");
      let searchKeyEnvelope = forge.util.decode64(encodedSearchKeyEnvelope);
      credentials.secret.searchKey = decryptBinaryString(searchKeyEnvelope, credentials.secret.expandedKey);

      let encodedSearchIVEnvelope = localStorage.getItem("encodedSearchIVEnvelope");
      let searchIVEnvelope = forge.util.decode64(encodedSearchIVEnvelope);
      credentials.secret.searchIV = decryptBinaryString(searchIVEnvelope, credentials.secret.expandedKey);
    }
    
    return credentials;
}
