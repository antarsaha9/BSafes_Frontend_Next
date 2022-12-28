const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { debugLog, PostCall } from './helper'
import { encryptBinaryString, decryptBinaryString, encryptBinaryStringCBC } from './crypto';

const debugOn = false;

export function setupNewItemKey() {
  const salt = forge.random.getBytesSync(16);
  const randomKey = forge.random.getBytesSync(32);
  const itemKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
  return itemKey;
}

export async function createANewItem(titleStr, currentContainer, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, searchKey, searchIV) {
    return new Promise( (resolve, reject) => {
      const title = '<h2>' + titleStr + '</h2>';
      const encodedTitle = forge.util.encodeUtf8(title);
    
      const itemKey = setupNewItemKey();
      const keyEnvelope = encryptBinaryString(itemKey, workspaceKey);
      const encryptedTitle = encryptBinaryString(encodedTitle, itemKey);
    
      const titleTokens = stringToEncryptedTokens(titleStr, searchKey, searchIV);
    
      let addActionOptions;
      if (addAction === "addAnItemOnTop") {
        addActionOptions = {
          "targetContainer": currentContainer,
          "type": selectedItemType,
          "keyEnvelope": forge.util.encode64(keyEnvelope),
          "title": forge.util.encode64(encryptedTitle),
          "titleTokens": JSON.stringify(titleTokens)
        };
      } else {
        addActionOptions = {
          "targetContainer": currentContainer,
          "targetItem": targetItem,
          "targetPosition": targetPosition,
          "type": selectedItemType,
          "keyEnvelope": forge.util.encode64(keyEnvelope),
          "title": forge.util.encode64(encryptedTitle),
          "titleTokens": JSON.stringify(titleTokens)
        };
      }
      
      PostCall({
        api:'/memberAPI/' + addAction,
        body: addActionOptions
      }).then( data => {
        debugLog(debugOn, data);
        if(data.status === 'ok') {
            debugLog(debugOn, `${addAction} succeeded`);
            resolve(data.item)
        } else {
            debugLog(debugOn, `${addAction} failed: `, data.error)
            reject(data.error);
          } 
      }).catch( error => {
        debugLog(debugOn,  `${addAction} failed.`)
        reject(error);
      })
    });
};

export async function getLastAccessedItem(itemId) {
  return new Promise( (resolve, reject) => {
    PostCall({
      api:'/memberAPI/getLastAccessedPage',
      body: {itemId}
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {
          resolve(data.item.lastAccessedPage)
      } else {
          debugLog(debugOn, `getLastAccessedItem failed: `, data.error)
          reject(data.error);
        } 
    }).catch( error => {
      debugLog(debugOn,  `getLastAccessedItem failed.`)
      reject(error);
    })
  });
}

export async function gotoAnotherFolderPage(action, folderId, itemPosition) {
  let result;
  return new Promise( (resolve, reject) => {
    PostCall({
      api:`/memberAPI/${action}`,
      body: {
        folderId,
        itemPosition
      }
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {
          resolve(data.itemId)
      } else {
          debugLog(debugOn, `gotoAnotherFolderPage failed: `, data.error)
          reject(data.error);
        } 
    }).catch( error => {
      debugLog(debugOn,  `gotoAnotherFolderPage failed.`)
      reject(error);
    })
  });
}

export function newResultItem(item, workspaceKey) {
  let resultItem, itemId, itemKey, encodedTitle, title;
  if (item._source) {
    itemId = item._id;
    resultItem = item._source;
  } else {
    itemId = item.id;
    resultItem = item;
  }
  const id = itemId;
  const container = resultItem.container;
  const position = resultItem.position;

  const keyVersion = id.split(':')[2];
  if(keyVersion === '3') {
    if ((resultItem.keyEnvelope === undefined)) {
      title = "Error!";
    } else {
      try {
        itemKey = decryptBinaryString(forge.util.decode64(resultItem.keyEnvelope), workspaceKey);
        if (resultItem.title) {
          encodedTitle = decryptBinaryString(forge.util.decode64(resultItem.title), itemKey);
          title = forge.util.decodeUtf8(encodedTitle);
          title = DOMPurify.sanitize(title);
        } else {
          title = "";
        }
      } catch(error) {
        debugLog(debugOn, "newResultItem error: ", error);
        title = "Error!";
      }
    }
    return {id, container, position, title, itemPack:resultItem};
  } else {

  }
  
}

export async function createNewItemVersion(itemCopy) {
  return new Promise( (resolve, reject) => {
    itemCopy.version = itemCopy.version + 1;
    debugLog(debugOn, "item copy version: ", itemCopy.version);
  
    PostCall({
      api:'/memberAPI/createNewItemVersion',
      body: {
        itemId: itemCopy.id,
        itemVersion: JSON.stringify(itemCopy)
      }
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {
          debugLog(debugOn, `createNewItemVersion succeeded`);
          resolve(data)
      } else {
          debugLog(debugOn, `createNewItemVersion failed: `, data.error)
          reject(data.error);
        } 
    }).catch( error => {
      debugLog(debugOn,  `createNewItemVersion failed.`)
      reject(error);
    })

  });
};

export function getItemLink(item) {
  let itemId;
  if (item._source) {
    itemId = item._id;
    item = item._source;
  } else {
    itemId = item.id;
  }
  const itemType = itemId.split(':')[0];
  const container = item.container;

  let link = null;
  switch (itemType) {
    case 'p':
      if (container.substring(0, 1) === 'f') {
        link = '/folder/p/' + itemId;
      } else {
        link = '/page/' + itemId;
      }
      break;
    case 'b':
      link = '/box/contents/' + itemId;
      break;
    case 'f':
      link = '/folder/contents/' + itemId;
      break;
    case 'n':
      if (item.lastAccessedPage) {
        link = '/notebook/p/' + item.lastAccessedPage;
      } else {
        link = '/notebook/contents/' + itemId;
      }
      break;
    case 'np':
      link = '/notebook/p/' + itemId;
      break;
    case 'd':
      link = '/diary/contents/' + itemId;
      break;
    case 'dp':
      link = '/diary/p/' + itemId;
      break;
    default:
  }
  return link;
}

export function getCoverAndContentsLink(itemId) {

  const itemType = itemId.split(':')[0];

  let converLink = null, contentsLink = null;
  switch (itemType) {
    case 'b':
      converLink = '/box/' + itemId;
      contentsLink = '/box/contents/' + itemId;
      break;
    case 'f':
      converLink = '/folder/' + itemId;
      contentsLink = '/folder/contents/' + itemId;
      break;
    case 'u':
      converLink = '/safe/';
      break;
    default:
  }
  return {converLink, contentsLink};
}

export function preS3Download(itemId, s3Key) {
  return new Promise(async (resolve, reject) => {
      PostCall({
          api:'/memberAPI/preS3Download',
          body: {
              itemId,
              s3Key
          }
      }).then( data => {
          debugLog(debugOn, data);
          if(data.status === 'ok') {                                  
              const signedURL = data.signedURL;
              resolve(signedURL);
          } else {
              debugLog(debugOn, "preS3Download failed: ", data.error);
              reject(data.error);
          }
      }).catch( error => {
          debugLog(debugOn, "preS3Download failed: ", error)
          reject("preS3Download failed!");
      })
  });
}

function stringToEncryptedTokens(str, searchKey, searchIV) {
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

export function timeToString(timeValue) {
  var date = new Date(timeValue);
  var dateParts = date.toString().split('GMT');
  var dateStr = dateParts[0];
  return dateStr;
};

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