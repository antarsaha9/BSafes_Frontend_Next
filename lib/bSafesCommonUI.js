const forge = require('node-forge');

import { resolveHref } from 'next/dist/shared/lib/router/router';
import { debugLog, PostCall } from './helper'
import { encryptBinaryString, encryptBinaryStringCBC } from './crypto';

const debugOn = true;

export async function createANewItem(titleStr, currentContainer, selectedItemType, addAction, targetItem, expandedKey, searchKey, searchIV) {
    return new Promise( (resolve, reject) => {
      const title = '<h2>' + titleStr + '</h2>';
      const encodedTitle = forge.util.encodeUtf8(title);
    
      const salt = forge.random.getBytesSync(16);
      const randomKey = forge.random.getBytesSync(32);
      const itemKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
    
      const keyEnvelope = encryptBinaryString(itemKey, expandedKey);
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
          /*
        var targetItem = $addTargetItem.attr('id');
        var targetContainer = $addTargetItem.data('container');
        var targetPosition = $addTargetItem.data('position');
        addActionOptions = {
          "targetContainer": targetContainer,
          "targetItem": targetItem,
          "targetPosition": targetPosition,
          "type": selectedItemType,
          "keyEnvelope": forge.util.encode64(keyEnvelope),
          "ivEnvelope": forge.util.encode64(ivEnvelope),
          "envelopeIV": forge.util.encode64(envelopeIV),
          "ivEnvelopeIV": forge.util.encode64(ivEnvelopeIV),
          "title": forge.util.encode64(encryptedTitle),
          "titleTokens": JSON.stringify(titleTokens)
        };
        */
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
      link = '/box/' + itemId;
      break;
    case 'f':
      link = '/folder/' + itemId;
      break;
    case 'n':
      if (item.lastAccessedPage) {
        link = '/notebook/p/' + item.lastAccessedPage;
      } else {
        link = '/notebook/' + itemId;
      }
      break;
    case 'np':
      link = '/notebook/p/' + itemId;
      break;
    case 'd':
      link = '/diary/' + itemId;
      break;
    case 'dp':
      link = '/diary/p/' + id;
      break;
    default:
  }
  return link;
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