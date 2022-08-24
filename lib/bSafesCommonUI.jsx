const forge = require('node-forge');

import { debugLog, PostCall } from '../lib/helper'
import { encryptBinaryString, encryptBinaryStringCBC } from './crypto';

const debugOn = true;

export function createANewItem(titleStr, currentContainer, selectedItemType, addAction, targetItem, expandedKey, searchKey, searchIV) {

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
      api:'memberAPI/' + addAction,
      body: addActionOptions
    }).then( data => {
      debugLog(debugOn, data);
      if(data.status === 'ok') {
          debugLog(debugOn, `${addAction} succeeded`);
      } else {
          debugLog(debugOn, `${addAction} failed: `, data.error)
      } 
    }).catch( error => {
      debugLog(debugOn,  `${addAction} failed.`)
    })
/*
    $.post('/memberAPI/' + addAction,
      addActionOptions,
      function(data, textStatus, jQxhr) {
        hideLoadingInContainer();
        if (data.status === 'ok') {
          var item = data.item;
          var $resultItem = newResultItem(item);
          var $itemLink = $resultItem.find('.itemLink');
          var link = $itemLink.attr('href');
          setTimeout(function() {
            window.location.href = link;
          }, 1500);
        } else {
          alert(data.err);
        }
      }, 'json');
 */ 
};

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