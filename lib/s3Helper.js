import { debugLog, PostCall } from './helper'

const axios = require('axios');

const debugOn = false;

export function putS3Object(s3Key, signedURL, data, config, dispatch) {

    return new Promise(async (resolve, reject) => {
        try {
            const result = await axios.put(signedURL, Buffer.from(data, 'binary'), config);
            resolve(result);
        } catch(error) {
            debugLog(debugOn, "putS3Object failed: ", error);
            reject(error);
            return;
        }
        try {
            await postS3Upload(s3Key, dispatch);
        } catch(error) {
            debugLog(debugOn, "postS3Upload failed: ", error);
        }
    });
}

export function postS3Upload(s3Key, dispatch) {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/postS3Upload',
            body: { s3Key },
            dispatch,
            tinybird: true
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve({ status: "ok" });
            } else {
                debugLog(debugOn, "postS3Upload failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "postS3Upload failed: ", error)
            reject(error);
        })
    });
}

export function preS3ChunkUpload(itemId, chunkIndex, timeStamp, dispatch) {
    return new Promise((resolve, reject) => {
        let s3Key, s3KeyPrefix, signedURL;
        PostCall({
            api: '/memberAPI/preS3ChunkUpload',
            body: {
                itemId,
                chunkIndex: chunkIndex.toString(),
                timeStamp: timeStamp
            },
            dispatch
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                s3Key = data.s3Key;
                s3KeyPrefix = s3Key.split('_chunk_')[0];
                signedURL = data.signedURL;
                resolve({ s3Key, s3KeyPrefix, signedURL });
            } else {
                debugLog(debugOn, "preS3ChunkUpload failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "preS3ChunkUpload failed: ", error)
            reject(error);
        })
    });
}

export function preS3ChunkDownload(itemId, chunkIndex, s3KeyPrefix, numberOfChunksRequired, dispatch) {
    return new Promise((resolve, reject) => {
        let signedURL, numberOfChunks;
        PostCall({
            api: '/memberAPI/preS3ChunkDownload',
            body: {
                itemId,
                chunkIndex: chunkIndex.toString(),
                s3KeyPrefix,
                numberOfChunksRequired
            },
            dispatch
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                if (numberOfChunksRequired) {
                    numberOfChunks = parseInt(data.numberOfChunks);
                }
                signedURL = data.signedURL;
                resolve({ signedURL, numberOfChunks });
            } else {
                debugLog(debugOn, "preS3ChunkDownload failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "preS3ChunkDownload failed: ", error)
            reject(error);
        })
    });
}

export function preS3Download(itemId, s3Key, dispatch) {
    return new Promise(async (resolve, reject) => {
      PostCall({
        api: '/memberAPI/preS3Download',
        body: {
          itemId,
          s3Key
        },
        dispatch
      }).then(data => {
        debugLog(debugOn, data);
        if (data.status === 'ok') {
          const signedURL = data.signedURL;
          resolve(signedURL);
        } else {
          debugLog(debugOn, "preS3Download failed: ", data.error);
          reject(data.error);
        }
      }).catch(error => {
        debugLog(debugOn, "preS3Download failed: ", error)
        reject("preS3Download failed!");
      })
    });
  }
  