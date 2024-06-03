const forge = require('node-forge');

import { showApiActivity, hideApiActivity, incrementAPICount } from '../reduxStore/accountSlice';

// For debugging messages
export function debugLog(on, msg, value="") {
    if(on) {
        console.log(msg, value);
    }
}

// Sleep
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function sleepWithPrint(ms) {
    let timer;
    let lapsed = 0;
    return new Promise(resolve=> {
        timer = setInterval(()=> {
            console.log(`sleeping ${lapsed} ms`)
            lapsed += 1000;
            if(lapsed > ms) {
                clearInterval(timer);
                resolve();
            }
        }, 1000)
    })
}

// Device related functions
export function usingServiceWorker() {
    const browserInfo = getBrowserInfo();
    const result = browserInfo.isChrome || (!browserInfo.isIPhone && !browserInfo.isIPad && !browserInfo.isAndroid) && (browserInfo.isChrome || browserInfo.isFirefox);
    console.log("usingServiceWorker: ", result);
    return result;
}

export function getBrowserInfo() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return {
        userAgent,
        isChrome:((userAgent.indexOf('chrome')) !== -1) ||
                 ((userAgent.indexOf('crios')) !== -1),
        isFirefox:((userAgent.indexOf('firefox')) !== -1) ||
                  ((userAgent.indexOf('fxios')) !== -1),
        isIPhone:((userAgent.indexOf('iphone')) !== -1),
        isIPad:((userAgent.indexOf('ipad')) !== -1),
        isAndroid:((userAgent.indexOf('android')) !== -1),
    }
}

export function clearLocalData() {
    const secretColor = localStorage.getItem('secretColor');
    localStorage.clear();
    if(secretColor) localStorage.setItem('secretColor', secretColor);
}

export function readSecretColor() {
    const secretColor = localStorage.getItem('secretColor');
    return secretColor;
}

export function writeSecretColor(color) {
    localStorage.setItem('secretColor', color);
}

// Time related functions
export function getTimeZoneOffset(timeZone) {
    const now = new Date();
    const offset = now.getTimezoneOffset() / 60;
    return -offset;
}

// API related helper functions
let accessKeyInfo = null;

export async function PostCall({ api, body, dispatch=null, tinybird=false }) {
    const hiddenApiCalls ={
        '/memberAPI/preS3Upload': true,
        '/memberAPI/postS3Upload': true,
        '/memberAPI/preS3Download': true,
        '/memberAPI/preS3ChunkUpload': true,
        '/memberAPI/preS3ChunkDownload': true,
    }

    
    if (process.env.NEXT_PUBLIC_platform === 'iOS' && !accessKeyInfo) {
        function getAccessKeyFromNative() {
            return new Promise((resolve) => {
                let interval = null;
                const accessKeyWebCall = (data) => {
                    console.log('accessKeyWebCall');
                    accessKeyInfo = data;
                    if(interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                    resolve();
                }
                
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
                    function getAccessKey() {
                        console.log('getAccessKey');
                        window.bsafesNative.accessKeyWebCall = accessKeyWebCall;
                        window.webkit.messageHandlers.toggleMessageHandler.postMessage({
                            "message": 'getAccessKey'});
                    }
                    interval = setInterval(getAccessKey, 1000);
                }
            });
        }
        await getAccessKeyFromNative();
    }

    return new Promise((resolve, reject) => {
        if(dispatch) {
            if(!hiddenApiCalls[api] )dispatch(showApiActivity());
            dispatch(incrementAPICount());
        }
        const domain = window.location.origin; 
        const useBSafes = false;
        let apiEndpoint;
        if(tinybird) {
            apiEndpoint = 'https://tinybird.bsafes.com';
        } else if(useBSafes) {
            apiEndpoint = 'https://api.bsafes.com';
        } else if(domain.includes('openbsafes.com')) {
            apiEndpoint = 'https://fo4x871jr1.execute-api.us-east-1.amazonaws.com'; //open
        } else if(domain.includes('localbsafes.com')) {
            apiEndpoint = 'http://localhost:3030';
        } else if(domain.includes('bsafes.com')) {
            apiEndpoint =  'https://api.bsafes.com'; 
        } else if(domain.includes('127.0.0.1')){
            apiEndpoint = 'http://localhost:3030';
        } else if(domain.includes('localhost')){
            apiEndpoint = 'http://localhost:3030';
        }
        
        let authToken = localStorage.getItem("authToken");
        if(!authToken) authToken = 'None';
        const finalBody = {...body, authToken};
        if(process.env.NEXT_PUBLIC_localhostAccessKeyId) finalBody.localhostAccessKeyId = process.env.NEXT_PUBLIC_localhostAccessKeyId;
        if(process.env.NEXT_PUBLIC_localhostAccessKey) finalBody.localhostAccessKey = process.env.NEXT_PUBLIC_localhostAccessKey;
        if (process.env.NEXT_PUBLIC_platform === 'iOS' && accessKeyInfo) {
            finalBody.localhostAccessKeyId = accessKeyInfo.localhostAccessKeyId;
            finalBody.localhostAccessKey = accessKeyInfo.localhostAccessKey;
        }
        const url = `${apiEndpoint}${api}`
        
            fetch(url, {
                body: JSON.stringify(finalBody),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
                credentials: "include",
            })
            .then(res => res.json())
            .then(response => {
                resolve(response.data);
            }).catch(error => {
                console.error(error);
                reject(error);
            }).finally(()=>{
                if(dispatch) dispatch(hideApiActivity());
            })
        }
    )    
}

// String encoding functions
export function encode64Custom(bytes, char63='_') {
    let newBytes = forge.util.encode64(bytes);
    newBytes = newBytes.replace(/\//g, char63);

    return newBytes;
}

// html related functions
export function extractHTMLElementText(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
};

// data storage format convertion functions
export function convertUint8ArrayToBinaryString(u8Array) {
    let i, len = u8Array.length, 
    b_str = "";
    for (i = 0; i < len; i++) {
        b_str += String.fromCharCode(u8Array[i]);
    }
    return b_str;
}
  
export  function convertBinaryStringToUint8Array(bStr) {
    let i, len = bStr.length, 
    u8_array = new Uint8Array(len);
    for (i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
}

export function Utf8ArrayToStr(array, limit) {
    let out, i, len, c;
    let char2, char3;

    out = "";
    len = array.length;
    if (len > limit) {
      len = limit;
    }
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
          break;
      }
    }

    return out;
}

export function arraryBufferToStr(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    let thisStr = "";
    for(let i=0; i < arrayBuffer.byteLength; i++) {
        thisStr += String.fromCharCode(view.getUint8(i, false));
    }
    return thisStr;
}

