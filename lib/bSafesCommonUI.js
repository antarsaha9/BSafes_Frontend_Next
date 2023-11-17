const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { debugLog, PostCall } from './helper'
import { decryptBinaryString } from './crypto';

const debugOn = false;

export async function getAnotherItem(action, containerId, itemPosition, dispatch) {
  return new Promise( (resolve, reject) => {
    PostCall({
      api:`/memberAPI/${action}`,
      body: {
        containerId,
        itemPosition
      },
      dispatch
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {
          resolve(data.itemId)
      } else {
          debugLog(debugOn, `gotoAnotherItem failed: `, data.error)
          reject(data.error);
        } 
    }).catch( error => {
      debugLog(debugOn,  `gotoAnotherItem failed.`)
      reject(error);
    })
  });
}

export async function gotoAnotherFolderPage(action, folderId, itemPosition, dispatch) {
  return new Promise( (resolve, reject) => {
    PostCall({
      api:`/memberAPI/${action}`,
      body: {
        folderId,
        itemPosition
      },
      dispatch
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

export function isItemAContainer(itemId) {
  const itemType = itemId.split(':')[0];
  if (itemType === 't' || itemType === 'b' || itemType === 'f' || itemType === 'n' || itemType === 'd') {
    return true;
  }
  return false;
}

export function isItemABoxOrFolder(itemId) {
  const itemType = itemId.split(':')[0];
  if (itemType === 'b' || itemType === 'f') {
    return true;
  }
  return false;
}

export function newResultItem(item, workspaceKey) {
  let resultItem, itemId, itemKey, itemIV, encodedTitle, title;
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
        
        title = "Error!";
      }
    }
    
  } else {
    try{
      if(resultItem.envelopeIV && resultItem.ivEnvelope && resultItem.ivEnvelopeIV) { // legacy CBC-mode
        itemKey = decryptBinaryString(forge.util.decode64(resultItem.keyEnvelope), workspaceKey, forge.util.decode64(resultItem.envelopeIV));
        itemIV = decryptBinaryString(forge.util.decode64(resultItem.ivEnvelope), workspaceKey, forge.util.decode64(resultItem.ivEnvelopeIV));
      } else {
        const decoded = forge.util.decode64(resultItem.keyEnvelope);
        itemKey = decryptBinaryString(decoded, workspaceKey);
        itemIV = null;
      }
      
      if (resultItem.title) {
        encodedTitle = decryptBinaryString(forge.util.decode64(resultItem.title), itemKey, itemIV);
        title = forge.util.decodeUtf8(encodedTitle);
        title = DOMPurify.sanitize(title);
      } else {
        title = "";
      }
    } catch(error) {
      title = "Error!";
    }
  }

  return {id, container, position, title, itemPack:resultItem};
  
}

export function getItemLink(item, newItem=false) {
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
      if (container && container.substring(0, 1) === 'f') {
        link = '/folder/p/' + itemId;
      } else {
        link = '/page/' + itemId;
      }
      break;
    case 'b':
      if(newItem) {
        link = '/box/' + itemId;
      } else {
        link = '/box/contents/' + itemId;
      }
      break;
    case 'f':
      if(newItem){
        link = '/folder/' + itemId;
      } else {
        link = '/folder/contents/' + itemId;
      }  
      break;
    case 'n':
      if (item.itemPack && item.itemPack.lastAccessedPage) {
        link = '/notebook/p/' + item.itemPack.lastAccessedPage;
      } else {
        link = '/notebook/' + itemId;
      }
      break;
    case 'np':
      link = '/notebook/p/' + itemId;
      break;
    case 'd':
      if(newItem){
        link = '/diary/' + itemId;
      } else {
        let pageIndex;
        pageIndex = getDiaryPageIndexForToday();
        link = '/diary/p/' + itemId.replace('d:', 'dp:') + ':' + pageIndex;
      }
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

export function getBookIdFromPage(pageId) {
  let bookId = null;
  if(pageId.startsWith('np')) {
    const idParts = pageId.split(':');
    bookId = 'n';
    for(let i=1; i<idParts.length-1; i++){
        bookId += `:${idParts[i]}`
    }
  } else if(pageId.startsWith('dp')){
    const idParts = pageId.split(':');
    bookId = 'd';
    for(let i=1; i<idParts.length-1; i++){
        bookId += `:${idParts[i]}`
    }
  } 
  return bookId;
}

export function getDiaryPageIndexForToday() {
  const currentTime = new Date();
  const year = currentTime.getFullYear();
  let month, date, pageIndex;
  month = currentTime.getMonth() + 1;
  if (month < 10) month = '0' + month;
  date = currentTime.getDate();
  if (date < 10) date = '0' + date;
  pageIndex = year + '-' + month + '-' + date;
  return pageIndex;
}

export function preS3ChunkUpload(itemId, chunkIndex, timeStamp, dispatch) {
  return new Promise((resolve, reject) => {
    let s3Key, s3KeyPrefix, signedURL;
    PostCall({
      api:'/memberAPI/preS3ChunkUpload',
      body: {
          itemId,
          chunkIndex: chunkIndex.toString(),
          timeStamp: timeStamp
      },
      dispatch
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {   
          s3Key = data.s3Key;                        
          s3KeyPrefix = s3Key.split('_chunk_')[0];
          signedURL = data.signedURL;
          resolve({s3Key, s3KeyPrefix, signedURL});
      } else {
          debugLog(debugOn, "preS3ChunkUpload failed: ", data.error);
          reject(data.error);
      }
    }).catch( error => {
      debugLog(debugOn, "preS3ChunkUpload failed: ", error)
      reject(error);
    })
  });
}

export function preS3ChunkDownload(itemId, chunkIndex, s3KeyPrefix, numberOfChunksRequired, dispatch) {
  return new Promise((resolve, reject) => {
    let signedURL, numberOfChunks;
    PostCall({
      api:'/memberAPI/preS3ChunkDownload',
      body: {
          itemId,
          chunkIndex: chunkIndex.toString(),
          s3KeyPrefix,
          numberOfChunksRequired
      },
      dispatch
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {   
          if(numberOfChunksRequired) {
            numberOfChunks = parseInt(data.numberOfChunks);
          }
          signedURL = data.signedURL;
          resolve({signedURL, numberOfChunks});
      } else {
          debugLog(debugOn, "preS3ChunkDownload failed: ", data.error);
          reject(data.error);
      }
    }).catch( error => {
      debugLog(debugOn, "preS3ChunkDownload failed: ", error)
      reject(error);
    })
  });
}

export function preS3Download(itemId, s3Key, dispatch) {
  return new Promise(async (resolve, reject) => {
      PostCall({
          api:'/memberAPI/preS3Download',
          body: {
              itemId,
              s3Key
          },
          dispatch
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

export function numberWithCommas(x) {
  return x?x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'';
}

export function findAnElementByClassAndId(container, className, id) {
  let elementsByClass = container.querySelectorAll(className);
  for (let i=0; i< elementsByClass.length; i++) {
    if(elementsByClass[i].id === id) {
      return elementsByClass[i];
    }
  }
  return null;
}

export function getEditorConfig() {
  return {
    videoChunkSize: 1* 512 * 1024,
    videoThumbnailIndex: 999999999,
  }
}