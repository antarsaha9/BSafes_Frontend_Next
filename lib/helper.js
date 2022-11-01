import { encryptBinaryString } from './crypto';

const forge = require('node-forge');
const axios = require('axios');

// For debugging messages
export function debugLog(on, msg, value = "") {
    if (on) {
        console.log(msg, value);
    }
}

// API related helper functions
export function PostCall({ api, body }) {
    return new Promise((resolve, reject) => {
        //const domain = 'https://hivqf9prf7.execute-api.us-east-1.amazonaws.com';
        const domain = 'http://localhost:3000';
        const url = `${domain}${api}`

        axios({
            url,
            method: 'POST',
            headers:{'Content-Type':"application/json"},
            data: JSON.stringify(body),
            withCredentials: true
        })
            // fetch(url, {
            //     body: JSON.stringify(body),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     method: "POST",
            //     credentials: "include",
            // })
            // .then(res => res.json())
            .then(response => {
                resolve(response.data.data);
            }).catch(error => {
                console.error(error);
                reject(error);
            })
    }
    )
}

// String encoding functions
export function encode64Custom(bytes, char63 = '_') {
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

// rendering related functions
export function updateComponentAfterRender(fn) {
    setTimeout(() => {
        fn();
    }, 100);
}

// data storage format convertion functions
export function convertUint8ArrayToBinaryString(u8Array) {
    let i, len = u8Array.length,
        b_str = "";
    for (i = 0; i < len; i++) {
        b_str += String.fromCharCode(u8Array[i]);
    }
    return b_str;
}

export function convertBinaryStringToUint8Array(bStr) {
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
    for (let i = 0; i < arrayBuffer.byteLength; i++) {
        thisStr += String.fromCharCode(view.getUint8(i, false));
    }
    return thisStr;
}

export function tokenfieldToEncryptedArray(thisArray, key, iv) {
    var encryptedArray = [];

    for (var i = 0; i < thisArray.length; i++) {
        console.log(i, thisArray[i]);
        if (thisArray[i].length) {
            var encodedElement = forge.util.encodeUtf8(thisArray[i]);
            var encryptedElement = encryptBinaryString(encodedElement, key, iv);
            encryptedArray.push(forge.util.encode64(encryptedElement));
        }
    }
    return encryptedArray;
}

export function tokenfieldToEncryptedTokens(thisArray, searchKey) {
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

export function ECBEncryptBinaryString(binaryString, key) {
    var thisBuffer = forge.util.createBuffer();
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

export function formatTimeDisplay(timeValue) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var currentTime = Date.now();

    var date = new Date(timeValue);
    var dateParts = date.toString().split('GMT');
    var dateStr = dateParts[0];

    var elapsed = currentTime - timeValue;

    if (elapsed < msPerMinute) {
        var elapsedStr = Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        var elapsedStr = Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        var elapsedStr = Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerDay * 7) {
        var elapsedStr = Math.round(elapsed / msPerDay) + ' days ago';
    }

    if (elapsedStr !== undefined) {
        dateStr = elapsedStr;
    }

    return dateStr;
}
export function timeToString(timeValue) {
    var date = new Date(timeValue);
    var dateParts = date.toString().split('GMT');
    var dateStr = dateParts[0];
    return dateStr;
};