import DOMPurify from 'dompurify';
import { formatTimeDisplay } from './bSafesCommonUI';

const forge = require('node-forge');

// For debugging messages
export function debugLog(on, msg, value="") {
    if(on) {
        console.log(msg, value);
    }
}

// API related helper functions
export function PostCall({ api, body }) {
    return new Promise((resolve, reject) => {
        //const domain = 'https://hivqf9prf7.execute-api.us-east-1.amazonaws.com';
        const domain = 'http://localhost:3000';
        const url = `${domain}${api}`
        
            fetch(url, {
                body: JSON.stringify(body),
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

export function separateActivities(activities, getTitle) {
    var previousId;
    return activities.reduce((acc, activity) => {
        const _title = activity._id.charAt(0) === 't' ? "Trash Box" : getTitle(activity);
        const updatedTime = formatTimeDisplay(activity._source.createdTime);

        let temp = document.createElement('span');
        temp.innerHTML = _title;
        const title = temp.textContent || temp.innerText;

        const formatedActivity = {
            id: activity._id,
            title,
            updatedText: activity._source.version === 1 ? "Creation" : "Updated " + activity._source.update,
            updatedBy: DOMPurify.sanitize(activity._source.displayName ? activity._source.displayName : activity._source.updatedBy),
            updatedTime,
        }
        if (previousId !== activity._source.id) {
            previousId = activity._source.id;
            acc.push([formatedActivity]);
        } else {
            acc[acc.length - 1].push(formatedActivity)
        }
        return acc;
    }, []);
}