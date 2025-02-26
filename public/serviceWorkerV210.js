let videoChunkSize;
const broadcastChannelName = 'streamService';
let streams = {};
let videoStreams = {};
let streamWaitingList = {};

// ======== Support functions =================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// indexedDB
const DBName = "streams";
const chunkStoreName = "videoChunksStore";
const streamStoreName = "streamStore";
const notebookPagesStoreName = "notebookPagesStore";
const notebookTokensStoreName = "notebookTokensStore";
const diaryPagesStoreName = "diaryPagesStore";
const itemVersionsStoreName = "itemVersions";
const s3ObjectsStoreName = "s3Objects";

const myIndexedDB = self.indexedDB;

let streamDB = null;

function helloDB() {
  console.log("Hello indexedDB :", myIndexedDB);
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = myIndexedDB.open(DBName, 1);
    let upgradedNeeded = false;


    request.onerror = (e) => {
      console.log("openDB error: ", error);
      reject(error);
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!upgradedNeeded) resolve(db);
    }

    request.onupgradeneeded = (e) => {
      upgradedNeeded = true;
      const db = e.target.result;
      const transaction = e.target.transaction;
      db.createObjectStore(chunkStoreName, { keyPath: "chunkId" });
      db.createObjectStore(streamStoreName, { keyPath: "videoId" });
      db.createObjectStore(notebookPagesStoreName, { keyPath: "itemId" });
      db.createObjectStore(notebookTokensStoreName, { keyPath: "token" });
      db.createObjectStore(diaryPagesStoreName, { keyPath: "month" });
      db.createObjectStore(itemVersionsStoreName, { keyPath: "itemId" });
      db.createObjectStore(s3ObjectsStoreName, { keyPath: "s3Key" });
      transaction.oncomplete = (e) => {
        resolve(db);
      }
    }
  })
}

function deleteDB() {
  return new Promise((resolve, reject) => {
    streamDB.close();
    streamDB = null;
    const request = myIndexedDB.deleteDatabase(DBName);

    request.onerror = (e) => {
      console.log("Couldn't delete database");
      reject();
    };

    request.onsuccess = (e) => {
      console.log("Deleted database successfully");
      resolve();
    }

    request.onblocked = function () {
      console.log("Couldn't delete database due to the operation being blocked");
    };
  })
}

function addChunkToDB(videoId, chunkIndex, dataInBinary) {
  return new Promise((resolve) => {

    const chunkId = `${videoId}_${chunkIndex}`;

    const chunkDataInBinary = {
      chunkId,
      dataInBinary
    }

    const request = streamDB
      .transaction(chunkStoreName, "readwrite")
      .objectStore(chunkStoreName)
      .put(chunkDataInBinary);

    request.onsuccess = async (e) => {
      console.log("chunk added: ", e.target.result);
      const chunksMap = await updateChunksMap('Add', videoId, chunkIndex);
      resolve(chunksMap);
    }

    request.onerror = (e) => {
      console.log("addChunkToDB failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      }
    }

  })

}

function updateChunksMap(action, videoId, chunkIndex) {
  return new Promise(async (resolve, reject) => {
    const chunksMapId = videoId + '_chunksMap'
    let chunksMap = await getChunkFromDB(videoId, 'chunksMap');
    if (chunksMap) {
      chunksMap.map[chunkIndex] = (action === 'Add') ? true : false;
    } else {
      chunksMap = { chunkId: chunksMapId, map: {} };
      chunksMap.map[chunkIndex] = (action === 'Add') ? true : false;
    }

    const request = streamDB
      .transaction(chunkStoreName, "readwrite")
      .objectStore(chunkStoreName)
      .put(chunksMap);

    request.onsuccess = (e) => {
      console.log("chunksMap updated: ", e.target.result);
      resolve(chunksMap);
    }

    request.onerror = (e) => {
      console.log("Updating chunksMap failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      }
    }
  });
}

function deleteChunkInDB(chunkId) {
  return new Promise((resolve) => {

    streamDB
      .transaction(chunkStoreName, "readwrite")
      .objectStore(chunkStoreName)
      .delete(chunkId)
      .onsuccess = (e) => {
        console.log("chunk deleted: ", chunkId);
        resolve();
      }

  })
}

function getChunkFromDB(videoId, chunkIndex) {

  return new Promise((resolve) => {
    const chunkId = `${videoId}_${chunkIndex}`;
    let time1, time2;
    time1 = Date.now();
    const request = streamDB
      .transaction(chunkStoreName)
      .objectStore(chunkStoreName)
      .get(chunkId);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      time2 = Date.now();
      //console.log("getChunkFromDB takes time: ", time2-time1)
      resolve(e.target.result);
    }

    request.onerror = (e) => {
      console.log("getChunkFromDB failed: ", e.target.error);
      resolve(null);
    }

  })
}

function addStreamToDB(streamId, streamInfo) {
  return new Promise((resolve) => {

    const data = {
      streamId,
      streamInfo
    }

    const request = streamDB
      .transaction(streamStoreName, "readwrite")
      .objectStore(streamStoreName)
      .add(data);

    request.onsuccess = (e) => {
      console.log("stream added: ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("addStreamToDB failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      }
    }

  })

}

function deleteStreamInDB(streamId) {
  return new Promise((resolve) => {

    streamDB
      .transaction(streamStoreName, "readwrite")
      .objectStore(streamStoreName)
      .delete(streamId)
      .onsuccess = (e) => {
        console.log("stream deleted: ", streamId);
        resolve();
      }

  })
}

function getStreamFromDB(streamId) {

  return new Promise((resolve) => {

    const request = streamDB
      .transaction(streamStoreName)
      .objectStore(streamStoreName)
      .get(streamId);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      resolve(e.target.result);
    }

    request.onerror = (e) => {
      console.log("getStreamFromDB failed: ", e.target.error);
      resolve(null);
    }

  })
}

function setNotebookPages(itemId, pages) {
  return new Promise((resolve) => {
    const data = {
      itemId,
      pages
    }
    const request = streamDB
      .transaction(notebookPagesStoreName, "readwrite")
      .objectStore(notebookPagesStoreName)
      .put(data);

    request.onsuccess = (e) => {
      console.log("setNotebookPages succeeded ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("setNotebookPages failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  });
}

const findTheIndexForANumber = (numbersArray, theNumber) => {
  let newArrayStartingIndex = 0, newArrayEndingIndex = numbersArray.length - 1, midIndex;
  let theIndex = 0, found = false;
  while (1) {
    if (newArrayStartingIndex === newArrayEndingIndex) break;
    if ((newArrayStartingIndex + 1) === newArrayEndingIndex) {
      break;
    }
    midIndex = Math.floor((newArrayStartingIndex + newArrayEndingIndex) / 2);
    if (theNumber < numbersArray[midIndex]) {
      newArrayEndingIndex = midIndex;
    } else if (theNumber > numbersArray[midIndex]) {
      newArrayStartingIndex = midIndex;
    } else {
      found = true;
      theIndex = midIndex;
      break;
    }
  }
  if (!found) {
    if (theNumber > numbersArray[newArrayEndingIndex]) {
      theIndex = newArrayEndingIndex + 1;
    } else if (theNumber < numbersArray[newArrayStartingIndex]) {
      theIndex = newArrayStartingIndex ? newArrayStartingIndex - 1 : 0;
    } else {
      theIndex = newArrayStartingIndex + 1;
    }
  }
  if (theIndex) {
    if ((theNumber === numbersArray[theIndex - 1]) || (theNumber === numbersArray[theIndex]) || (theNumber === numbersArray[theIndex + 1])) {
      theIndex = -1;
    }
  } else {
    if ((theNumber === numbersArray[theIndex]) || (theNumber === numbersArray[theIndex + 1])) {
      theIndex = -1;
    }
  }
  return theIndex;
}

function getNotebookPages(itemId) {
  return new Promise((resolve) => {
    const request = streamDB
      .transaction(notebookPagesStoreName)
      .objectStore(notebookPagesStoreName)
      .get(itemId);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      if (e.target.result) {
        resolve(e.target.result.pages);
      } else {
        resolve(null);
      }
    }

    request.onerror = (e) => {
      console.log("getNotebookPages failed: ", e.target.error);
      resolve(null);
    }
  })
}

function addAPageToNotebookContents(itemId, pageNumber) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getNotebookPages(itemId);
      if (pages) {
        const theIndex = findTheIndexForANumber(pages, pageNumber);
        if (theIndex !== -1) {
          pages.splice(theIndex, 0, pageNumber);
        } else {
          resolve();
          return;
        }
      } else {
        pages = [pageNumber];
      }
      await setNotebookPages(itemId, pages);
      resolve();
    } catch (error) {
      console.log("addAPageToNotebookContents failed: ", error);
      reject();
    }
  })
}

function getNotebookContents(itemId, from, itemsPerPage) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getNotebookPages(itemId);
      if (pages === null) {
        resolve({ status: 'ok', hits: { total: 0 } });
        return;
      }
      const total = pages.length;
      if (from > total - 1) throw new Error("Invalid page.");
      const hits = [];
      const startingIndex = from;
      let endingIndex = startingIndex + itemsPerPage - 1;
      if (endingIndex > total - 1) {
        endingIndex = total - 1;
      }
      for (let i = startingIndex; i <= endingIndex; i++) {
        const pageItemId = itemId.replace("n:", "np:") + `:${pages[i]}`;
        const item = await getAnItemVersionFromDB(pageItemId);
        if (item) hits.push(item.item);
      }
      resolve({ status: 'ok', hits: { total, hits } });
    } catch (error) {
      console.log("getNotebookContents failed: ", error);
      resolve({ status: 'error', error });
    }
  })
}

function getNotebookFirstPage(itemId) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getNotebookPages(itemId);
      if (pages === null) {
        pageItemId = -1;
        return;
      } else {
        pageItemId = itemId.replace("n:", "np:") + `:${pages[0]}`;
      }
      resolve({ status: 'ok', pageItemId });
    } catch (error) {
      console.log("getNotebookFirstPage failed: ", error);
      resolve({ status: 'error', error });
    }
  });
}

function getNotebookLastPage(itemId) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getNotebookPages(itemId);
      if (pages === null) {
        pageItemId = -1;
        return;
      } else {
        pageItemId = itemId.replace("n:", "np:") + `:${pages[pages.length - 1]}`;
      }
      resolve({ status: 'ok', pageItemId });
    } catch (error) {
      console.log("getNotebookLastPage failed: ", error);
      resolve({ status: 'error', error });
    }
  });
}

function getNotebookPagesByAToken(token) {
  return new Promise((resolve) => {
    const request = streamDB
      .transaction(notebookTokensStoreName)
      .objectStore(notebookTokensStoreName)
      .get(token);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      if (e.target.result) {
        resolve(e.target.result.pages);
      } else {
        resolve(null);
      }
    }

    request.onerror = (e) => {
      console.log("getNotebookPagesByAToken failed: ", e.target.error);
      reject();
    }
  })
}

function setNotebookTokenPages(token, pages) {
  return new Promise((resolve) => {
    const data = {
      token,
      pages
    }
    const request = streamDB
      .transaction(notebookTokensStoreName, "readwrite")
      .objectStore(notebookTokensStoreName)
      .put(data);

    request.onsuccess = (e) => {
      console.log("setNotebookTokenPages succeeded ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("setNotebookTokenPages failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  });
}

function indexANotebookPage(container, pageNumber, tokens) {
  return new Promise(async (resolve, reject) => {
    try {
      let token;
      for (let i = 0; i < tokens.length; i++) {
        token = tokens[i];
        let pages = await getNotebookPagesByAToken(token);
        if (pages) {
          const theIndex = findTheIndexForANumber(pages, pageNumber);
          if (theIndex !== -1) {
            pages.splice(theIndex, 0, pageNumber);
          } else {
            continue;
          }
        } else {
          pages = [pageNumber];
        }
        await setNotebookTokenPages(token, pages);
      }
      resolve();
    } catch (error) {
      console.log("indexANotebookPage failed: ", error);
      reject();
    }
  })
}

function getNotebookPagesByTokens(itemId, tokens) {
  return new Promise(async (resolve, reject) => {
    try {
      let token;
      let pages = null;
      for (let i = 0; i < 1; i++) {
        token = tokens[i];
        pages = await getNotebookPagesByAToken(token);
      }
      if (pages === null) {
        resolve({ status: 'ok', hits: { total: 0 } });
        return;
      }
      const total = pages.length;
      const hits = [];
      const endingIndex = Math.min(total, 20);
      for (let i = 0; i < endingIndex; i++) {
        const pageItemId = itemId.replace("n:", "np:") + `:${pages[i]}`;
        const item = await getAnItemVersionFromDB(pageItemId);
        if (item) hits.push(item.item);
      }
      resolve({ status: 'ok', hits: { total, hits } });
    } catch (error) {
      console.log("getNotebookPagesByTokens failed: ", error);
      reject();
    }
  });
}

function getDiaryPagesForAMonth(month) {
  return new Promise((resolve) => {
    const request = streamDB
      .transaction(diaryPagesStoreName)
      .objectStore(diaryPagesStoreName)
      .get(month);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      if (e.target.result) {
        resolve(e.target.result.pages);
      } else {
        resolve(null);
      }
    }

    request.onerror = (e) => {
      console.log("getDiaryPagesForAMonth failed: ", e.target.error);
      resolve(null);
    }
  })
}

function setDiaryPages(month, pages) {
  return new Promise((resolve) => {
    const data = {
      month,
      pages
    }
    const request = streamDB
      .transaction(diaryPagesStoreName, "readwrite")
      .objectStore(diaryPagesStoreName)
      .put(data);

    request.onsuccess = (e) => {
      console.log("setDiaryPages succeeded ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("setDiaryPages failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  });
}

function addAPageToDiaryContents(month, pageNumber) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getDiaryPagesForAMonth(month);
      if (pages) {
        const theIndex = findTheIndexForANumber(pages, pageNumber);
        if (theIndex !== -1) {
          pages.splice(theIndex, 0, pageNumber);
        } else {
          resolve();
          return;
        }
      } else {
        pages = [pageNumber];
      }
      await setDiaryPages(month, pages);
      resolve();
    } catch (error) {
      console.log("addAPageToNotebookContents failed: ", error);
      reject();
    }
  })
}

function getDiaryContents(itemId, month) {
  return new Promise(async (resolve, reject) => {
    try {
      let pages = await getDiaryPagesForAMonth(month);
      if (pages === null) {
        resolve({ status: 'ok', hits: { total: 0 } });
        return;
      }
      const total = pages.length;
      const hits = [];

      for (let i = 0; i < total; i++) {
        const pageNumberInString = pages[i].toString();
        const pageNumber = pageNumberInString.substring(0,4) + '-' + pageNumberInString.substring(4,6) + '-' + pageNumberInString.substring(6,8);
        const pageItemId = itemId.replace("d:", "dp:") + `:${pageNumber}`;
        const item = await getAnItemVersionFromDB(pageItemId);
        if (item) hits.push(item.item);
      }
      resolve({ status: 'ok', hits: { total, hits } });
    } catch (error) {
      console.log("getNotebookContents failed: ", error);
      resolve({ status: 'error', error });
    }
  })
}

function addAnItemVersionToDB(itemId, item) {
  return new Promise((resolve) => {
    const data = {
      itemId,
      item
    }
    const request = streamDB
      .transaction(itemVersionsStoreName, "readwrite")
      .objectStore(itemVersionsStoreName)
      .add(data);

    request.onsuccess = (e) => {
      console.log("item added: ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("addAnItemVersionToDB failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  })
}

function updateAnItemVersion(itemId, item) {
  return new Promise(async (resolve, reject) => {
    const data = {
      itemId,
      item
    }
    const request = streamDB
      .transaction(itemVersionsStoreName, "readwrite")
      .objectStore(itemVersionsStoreName)
      .put(data);

    request.onsuccess = (e) => {
      console.log("updateAnItemVersion succeeded ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("updateAnItemVersion failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  });
}

function deleteAnItemVersionInDB(itemId) {
  return new Promise((resolve) => {
    streamDB
      .transaction(itemVersionsStoreName, "readwrite")
      .objectStore(itemVersionsStoreName)
      .delete(itemId)
      .onsuccess = (e) => {
        console.log("itemVersion deleted: ", itemId);
        resolve();
      }
  })
}

function getAnItemVersionFromDB(itemId) {

  return new Promise((resolve) => {

    const request = streamDB
      .transaction(itemVersionsStoreName)
      .objectStore(itemVersionsStoreName)
      .get(itemId);

    request.onsuccess = (e) => {
      //console.log("got chunk: ", e.target.result );
      resolve(e.target.result);
    }

    request.onerror = (e) => {
      console.log("getStreamFromDB failed: ", e.target.error);
      resolve(null);
    }
  })
}

function addAS3ObjectToDB(s3Key, object) {
  return new Promise((resolve) => {
    const data = {
      s3Key,
      object
    }
    const request = streamDB
      .transaction(s3ObjectsStoreName, "readwrite")
      .objectStore(s3ObjectsStoreName)
      .put(data);

    request.onsuccess = async (e) => {
      console.log("object added: ", e.target.result);
      resolve();
    }

    request.onerror = (e) => {
      console.log("addAS3ObjectToDB failed: ", e.target.error);
      if (e.target.error.name == "ConstraintError") {
        resolve();
      } else {
        reject();
      }
    }
  })

}

function deleteAS3ObjectInDB(s3Key) {
  return new Promise((resolve) => {
    streamDB
      .transaction(s3ObjectsStoreName, "readwrite")
      .objectStore(s3ObjectsStoreName)
      .delete(s3Key)
      .onsuccess = (e) => {
        console.log("objet deleted: ", s3Key);
        resolve();
      }
  })
}

function getAS3ObjectFromDB(s3Key) {
  return new Promise((resolve) => {
    const request = streamDB
      .transaction(s3ObjectsStoreName)
      .objectStore(s3ObjectsStoreName)
      .get(s3Key);

    request.onsuccess = (e) => {
      resolve(e.target.result);
    }

    request.onerror = (e) => {
      console.log("getAS3ObjectFromDB failed: ", e.target.error);
      resolve(null);
    }
  })
}

self.addEventListener('install', event => {
  // Bypass the waiting lifecycle stage,
  // just in case there's an older version of this SW registration.
  console.log('Service worker installed.');
  event.waitUntil(self.skipWaiting());
});

// ============================================================

self.addEventListener('activate', event => {
  // Take control of all pages under this SW's scope immediately,
  // instead of waiting for reload/navigation. https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request

  function beforeActivate() {
    return new Promise(async (resolve, reject) => {
      try {
        await self.clients.claim();

        console.log('Activating service worker');
        resolve();
      } catch (error) {
        console.log("beforeActivate error: ", error)
        reject(error);
      }
    })
  }

  event.waitUntil(beforeActivate());
});

function findNextChunkToDownload(id, numberOfChunks, from) {
  return new Promise(async (resolve) => {
    console.log(`findNextChunkToDownload: ${id}, ${numberOfChunks}, ${from}`)
    const chunksMap = await getChunkFromDB(id, 'chunksMap');
    if (chunksMap) {
      let fromIndex = from;
      if ((fromIndex >= numberOfChunks) || from < 0) {
        fromIndex = 1;
      }
      let i = 0;
      console.log('fromIndex: ', fromIndex)
      for (i = fromIndex; i < numberOfChunks; i++) {
        let result = chunksMap.map[i];
        if (!result) {
          break;
        }
      }
      console.log('next chunk to download: ', i)
      resolve((i === numberOfChunks) ? -99999 : i);
    } else {
      resolve(from);
    }
  })
}

self.addEventListener("message", async (event) => {
  console.log("Service worker received message: ", event.data);
  if (!streamDB) {
    streamDB = await openDB();
  }
  function setupNewStream(event) {
    let newStream;
    let port;

    newStream = new ReadableStream({
      start: async controller => {
        port = event.ports[0];
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(''));
        port.onmessage = event => {
          if (event.data) {
            switch (event.data.type) {
              case 'BINARY':
                let chunkLength = event.data.chunk.length;
                console.log("chunk length: ", chunkLength);
                let chunkArrary = new Uint8Array(chunkLength);
                for (let i = 0; i < chunkLength; i++) {
                  chunkArrary[i] = event.data.chunk.charCodeAt(i);
                }
                controller.enqueue(chunkArrary);
                break;
              case 'END_OF_FILE':
                console.log("END_OF_FILE ");
                controller.close();
                port.postMessage({ type: "STREAM_CLOSED" });
                break;
              default:
            }
          }
        }
      }
    });

    let fileName = event.data.fileName;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;

    let id = encodeURI(fileName + Date.now());
    let streamInfo = {
      id,
      fileName,
      fileSize,
      browserInfo,
      stream: newStream
    };
    streams[id] = streamInfo;
    port.postMessage({ type: "STREAM_OPENED", stream: { id } });
  }

  async function setupVideoStream(event) {

    let port = event.ports[0];
    let timeStamp = event.data.s3KeyPrefix.split(':').pop();
    let fileName = event.data.fileName;
    let fileType = event.data.fileType;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;
    let resumeForNewStream = event.data.resumeForNewStream;
    let start = event.data.start;
    videoChunkSize = event.data.videoChunkSize;
    let numberOfChunks = Math.floor(fileSize / videoChunkSize);
    if (fileSize % videoChunkSize) numberOfChunks += 1;
    let id = encodeURI(`${timeStamp}_${fileName}`);
    let streamInfo = {
      port,
      id,
      fileType,
      fileName,
      fileSize,
      browserInfo,
      numberOfChunks,
      twoBytesSent: false,
      nextChunkIndex: (numberOfChunks === 1) ? -99999 : 1,
      chunksInfo: {}
    };

    videoStreams[id] = streamInfo;
    if (streamWaitingList[id]) {
      let target = streamWaitingList[id].target;
      target.dispatchEvent(new CustomEvent("STREAM_AVAILABLE", { detail: streamInfo }));
    }

    let initialChunkIndex = await findNextChunkToDownload(id, numberOfChunks, 0);
    let nextChunkIndex = await findNextChunkToDownload(id, numberOfChunks, initialChunkIndex + 1);
    streamInfo.nextChunkIndex = nextChunkIndex;

    console.log(`Service Worker SEND: STREAM_OPENED initialChunkIndex: ${initialChunkIndex}`)
    port.postMessage({ type: "STREAM_OPENED", stream: { id }, initialChunkIndex });
    streamInfo.requestedChunkIndex = initialChunkIndex;

    port.onmessage = async event => {
      if (event.data) {
        try {
          switch (event.data.type) {
            case 'BINARY':
              let chunkLength = event.data.chunk.length;
              console.log("chunk length: ", chunkLength);
              console.log(`Service Worker RECEIVE: chunkIndex: ${event.data.chunkIndex}`)
              const chunksMap = await addChunkToDB(id, event.data.chunkIndex, event.data.chunk);

              if (streamInfo.chunksInfo[event.data.chunkIndex] && streamInfo.chunksInfo[event.data.chunkIndex].pendingFetches) {
                console.log(`Pending fetches exist for chunkIndex: ${event.data.chunkIndex}`);
                streamInfo.chunksInfo[event.data.chunkIndex].pendingFetches.forEach((target) => {
                  console.log(`dispatch CHUNK_AVAILABLE for chunkIndex:${event.data.chunkIndex}`)
                  target.dispatchEvent(new Event("CHUNK_AVAILABLE"));
                })
              }
              if (streamInfo.jumpToChunk) {
                console.log("jumpToChunk: ", streamInfo.jumpToChunk);
                streamInfo.nextChunkIndex = streamInfo.jumpToChunk;
                streamInfo.jumpToChunk = null;
              }
              console.log(`Service Worker SEND: NEXT_CHUNK nextChunkIndex: ${streamInfo.nextChunkIndex}`)
              port.postMessage({ type: "NEXT_CHUNK", chunksMap, nextChunkIndex: streamInfo.nextChunkIndex });
              streamInfo.requestedChunkIndex = streamInfo.nextChunkIndex;

              nextChunkIndex = await findNextChunkToDownload(id, numberOfChunks, streamInfo.nextChunkIndex + 1)
              streamInfo.nextChunkIndex = nextChunkIndex;

              break;
            default:
          }
        } catch (error) {
          console.log("port.onmessage failed: ", error)
        }

      }
    }
  }

  async function setupEditorVideoStream(event) {

    let port = event.ports[0];
    let timeStamp = event.data.s3KeyPrefix.split(':').pop();
    let fileName = event.data.fileName;
    let fileType = event.data.fileType;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;
    videoChunkSize = event.data.videoChunkSize;
    let numberOfChunks = Math.floor(fileSize / videoChunkSize);

    if (fileSize % videoChunkSize) numberOfChunks += 1;

    let id = encodeURI(`${timeStamp}_${fileName}`);

    let streamInfo = {
      id,
      fileType,
      fileName,
      fileSize,
      browserInfo,
      numberOfChunks
    };

    videoStreams[id] = streamInfo;
    //await addStreamToDB(id, streamInfo);

    port.postMessage({ type: "STREAM_OPENED", stream: { id } });

    port.onmessage = async event => {
      if (event.data) {
        try {
          switch (event.data.type) {
            case 'BINARY':
              let chunkLength = event.data.chunk.length;
              console.log("chunk length: ", chunkLength);

              await addChunkToDB(id, event.data.chunkIndex, event.data.chunk);

              break;
            default:
          }
        } catch (error) {
          console.log("port.onmessage failed: ", error)
        }

      }
    }
  }
  let data, port, result;
  if (event.data) {
    await self.clients.claim();
    switch (event.data.type) {
      case 'INIT_PORT':
        setupNewStream(event);
        break;
      case 'INIT_VIDEO_PORT':
        setupVideoStream(event);
        break;
      case 'INIT_EDITOR_VIDEO_PORT':
        setupEditorVideoStream(event);
        break;
      case 'DELETE_DB':
        await deleteDB();
        break;
      case 'READ_FROM_DB_TABLE':
        switch (event.data.table) {
          case itemVersionsStoreName:
            try {
              const item = await getAnItemVersionFromDB(event.data.key);
              data = { status: 'ok' }
              if (item) {
                data.item = item.item;
              }
            } catch (error) {
              data = { status: 'error', error }
            }
            port = event.ports[0];
            port.postMessage({ type: "DATA", data });
            break;
          case s3ObjectsStoreName:
            try {
              const object = await getAS3ObjectFromDB(event.data.key);
              data = { status: 'ok' }
              if (object) {
                data.object = object.object;
              }
            } catch (error) {
              data = { status: 'error', error }
            }
            port = event.ports[0];
            port.postMessage({ type: "DATA", data });
            break;
        }
        break;
      case 'WRITE_TO_DB_TABLE':
        switch (event.data.table) {
          case itemVersionsStoreName:
            try {
              await updateAnItemVersion(event.data.key, event.data.data);
              if (event.data.key.startsWith("np:")) {
                const itemdIdParts = event.data.key.split(":");
                const notenookId = `n:${itemdIdParts[1]}:${itemdIdParts[2]}:${itemdIdParts[3]}`;
                const pageNumber = parseInt(itemdIdParts[4]);
                await addAPageToNotebookContents(notenookId, pageNumber);
              } else if (event.data.key.startsWith("dp:")) {
                const itemIdParts = event.data.key.split(":");
                const lastPart = itemIdParts[itemIdParts.length - 1];
                const pageNumberParts = lastPart.split("-");
                const monthForThePage = pageNumberParts[0] + pageNumberParts[1];
                const pageNumber = parseInt(lastPart.replace(/-/g, ""));
                await addAPageToDiaryContents(monthForThePage, pageNumber);
              }
              data = { status: 'ok' }
            } catch (error) {
              data = { status: 'error', error }
            }
            port = event.ports[0];
            port.postMessage({ type: "WRITE_RESULT", data });
            break;
          case s3ObjectsStoreName:
            try {
              await addAS3ObjectToDB(event.data.key, event.data.data);
              data = { status: 'ok' }
            } catch (error) {
              data = { status: 'error', error }
            }
            port = event.ports[0];
            port.postMessage({ type: "WRITE_RESULT", data });
            break;
        }
        break;
      case 'WRITE_TO_DB':
        switch (event.data.action) {
          case 'INDEX_A_PAGE':
            if (event.data.itemId.startsWith('np')) {
              try {
                const pageNumber = parseInt(event.data.itemId.split(':').pop())
                await indexANotebookPage(event.data.container, pageNumber, event.data.tokens);
                result = { status: 'ok' };
              } catch (error) {
                result = { status: 'error', error }
              }
            }
            break;
          default:
            result = { status: 'error', error: "Invalid action." }
        }
        port = event.ports[0];
        port.postMessage({ type: "DATA", data: result });
        break;
      case 'READ_FROM_DB':
        switch (event.data.action) {
          case 'GET_CONTENTS':
            if (event.data.container.startsWith('n')) {
              try {
                result = await getNotebookContents(event.data.container, event.data.from, event.data.size);
              } catch (error) {
                result = { status: 'error', error }
              }
            } else if (event.data.container.startsWith('d')) {
              try {
                result = await getDiaryContents(event.data.container, event.data.month);
              } catch (error) {
                result = { status: 'error', error }
              }
            }
            break;
          case 'GET_FIRST_PAGE':
            if (event.data.container.startsWith('n')) {
              try {
                result = await getNotebookFirstPage(event.data.container);
              } catch (error) {
                result = { status: 'error', error }
              }
            }
            break;
          case 'GET_LAST_PAGE':
            if (event.data.container.startsWith('n')) {
              try {
                result = await getNotebookLastPage(event.data.container);
              } catch (error) {
                result = { status: 'error', error }
              }
            }
            break;
          case 'GET_PAGES_BY_TOKENS':
            if (event.data.container.startsWith('n')) {
              try {
                result = await getNotebookPagesByTokens(event.data.container, event.data.tokens);
              } catch (error) {
                result = { status: 'error', error }
              }
            }
            break;
          default:
            result = { status: 'error', error: "Invalid action." }
        }
        port = event.ports[0];
        port.postMessage({ type: "DATA", data: result });
        break;
      default:
    }
  }
})

self.addEventListener("fetch", async (event) => {
  console.log(`Handling fetch event for ${event.request.url}`);

  let idParts = event.request.url.split('/downloadFile/');
  if (!idParts[1]) return null;

  idParts = idParts[1].split('/');
  const isVideo = (idParts[0] === 'video');
  const id = idParts.pop();

  let streamInfo;

  if (isVideo) {

    function waitForResponse() {
      let range = event.request.headers.get('Range');
      let start, end;
      console.log(`new video request range: ${range}`);
      range = range.split('=')[1].split('-');
      start = parseInt(range[0]);
      end = range[1];
      console.log(`new video request range start: ${start} end: ${end}`);

      function getStreamInfo(client) {
        return new Promise(resolve => {
          let streamInfo = videoStreams[id];
          if (streamInfo) {
            resolve(streamInfo);
          } else {
            // Send a message to the client.
            client.postMessage({
              type: "STREAM_NOT_FOUND",
              id,
              start
            });

            let target = new EventTarget();
            streamWaitingList[id] = {
              target
            }
            target.addEventListener("STREAM_AVAILABLE", async (e) => {
              console.log("STREAM_AVAILABLE: ", e.detail);
              resolve(e.detail);
            });
          }
        })
      }

      return new Promise(async (resolve, reject) => {
        console.log("waitForStream");
        let client;
        client = await self.clients.get(event.clientId)
        console.log("client: ", client);

        streamInfo = await getStreamInfo(client);

        if (streamInfo) {
          let fileName = encodeURIComponent(streamInfo.fileName).replace(/['()]/g).replace(/\*/g, '%2A')
          let fileSize = streamInfo.fileSize;
          let fileType = streamInfo.fileType;

          let timeOut = streamInfo.timeOut;
          if (timeOut) clearTimeout(timeOut);

          let chunkIndex = Math.floor(start / videoChunkSize);
          if (end === "") {
            if (!streamInfo.twoBytesSent) {
              end = start + 1;
              streamInfo.twoBytesSent = true;
            } else {
              end = start + (chunkIndex + 1) * videoChunkSize - 1;
            }
          } else {
            end = parseInt(end);
          }

          if (end >= fileSize) {
            end = fileSize - 1;
          }

          const waitForResult = () => {
            function responseFromDBResult(result) {
              let responseData, response;
              if (end < (chunkIndex + 1) * videoChunkSize - 1) {
                responseData = result.dataInBinary.substring(start % videoChunkSize, end % videoChunkSize + 1)
              } else {
                responseData = result.dataInBinary.substring(start % videoChunkSize);
                end = (chunkIndex + 1) * videoChunkSize - 1;
              }
              let headers = {
                'Content-Type': fileType || 'application/octet-stream; charset=utf-8',
              }
              headers['Accept-Ranges'] = 'bytes';
              headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
              headers['Content-Length'] = responseData.length;
              console.log("Response Content-Range: ", headers['Content-Range']);

              let responseHeader = {
                status: 206,
                statusText: 'OK',
                headers
              };

              let responseDataInUint8Arrary = new Uint8Array(responseData.length);
              for (let i = 0; i < responseData.length; i++) {
                responseDataInUint8Arrary[i] = responseData.charCodeAt(i);
              }
              response = new Response(responseDataInUint8Arrary, responseHeader);
              return response;
            }

            return new Promise(async (resolve) => {
              let numberOfChunks = streamInfo.numberOfChunks;
              let result = await getChunkFromDB(id, chunkIndex);
              if (result) {
                let response = responseFromDBResult(result);
                resolve(response);
              } else {
                console.log(`chunkIndex: ${chunkIndex} not in DB`);
                if (chunkIndex !== streamInfo.requestedChunkIndex) {
                  console.log(`chunkIndex: ${chunkIndex} becomes next chunk`);

                  if (streamInfo.requestedChunkIndex < 0) {
                    console.log("service worker onfetch: requestedChunkIndex < 0 ");
                    let port = streamInfo.port;
                    port.postMessage({ type: "NEXT_CHUNK", nextChunkIndex: chunkIndex });
                    streamInfo.requestedChunkIndex = chunkIndex;

                    let nextChunkIndex = await findNextChunkToDownload(id, numberOfChunks, chunkIndex + 1)
                    streamInfo.nextChunkIndex = nextChunkIndex;
                  } else {
                    streamInfo.jumpToChunk = chunkIndex;
                  }
                }

                let eventTarget = new EventTarget();
                eventTarget.addEventListener("CHUNK_AVAILABLE", async (e) => {
                  console.log("CHUNK_AVAILABLE: ", chunkIndex);
                  let result = await getChunkFromDB(id, chunkIndex);
                  let response = responseFromDBResult(result);
                  resolve(response);
                });

                console.log(`Add eventTarget for chunkIndex: ${chunkIndex}`)

                if (!streamInfo.chunksInfo[chunkIndex]) {
                  streamInfo.chunksInfo[chunkIndex] = {
                    pendingFetches: [eventTarget],
                  }
                } else {
                  let pendingFetches = streamInfo.chunksInfo[chunkIndex].pendingFetches;
                  if (pendingFetches) {
                    pendingFetches.push(eventTarget);
                  } else {
                    pendingFetches = [eventTarget];
                  }
                  streamInfo.chunksInfo[chunkIndex].pendingFetches = pendingFetches;
                }
              }
              /*timeOut = setTimeout(()=> {
                streamInfo.nextChunkIndex = -99998;
              }, 3000);
              streamInfo.timeOut = timeOut;*/
            });

          }

          try {
            let result = await waitForResult();
            resolve(result);
          } catch (error) {
            reject();
          }
        }
      })
    }

    event.respondWith(waitForResponse());

  } else {
    streamInfo = streams[id];

    if (!streamInfo) {
      return null;
    }

    let fileName = encodeURIComponent(streamInfo.fileName).replace(/['()]/g).replace(/\*/g, '%2A')
    let fileSize = streamInfo.fileSize;
    let fileType = streamInfo.fileType;

    let headers = {
      'Content-Type': fileType || 'application/octet-stream; charset=utf-8',
      'Content-Disposition': "attachment; filename*=UTF-8''" + fileName,
      'Content-Length': fileSize,
      //'Content-Security-Policy': "default-src 'none'",
      //'X-Content-Security-Policy': "default-src 'none'",
      //'X-WebKit-CSP': "default-src 'none'",
      //'X-XSS-Protection': '1; mode=block'
    }

    var responseHeader = {
      // status/statusText default to 200/OK, but we're explicitly setting them here.
      status: 200,
      statusText: 'OK',
      headers
    };

    var response = new Response(streamInfo.stream, responseHeader);
    event.respondWith(response);

  }

});
