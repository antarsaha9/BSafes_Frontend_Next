const chunkSize = 512 * 1024;

let streams = {};
let videoStreams = {};

// ======== Support functions =================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// indexedDB
const DBName = "videoChunks";
const storeName = "videoChunksStore";

const myIndexedDB = self.indexedDB;
let videoChunksDB;

function helloDB() {
  console.log("Hello indexedDB :", myIndexedDB);
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = myIndexedDB.open(DBName, 4);
    let upgradedNeeded = false;

    request.onerror = (e) => {
      console.log("openDB error: ", error);
      reject(error);
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      if(!upgradedNeeded) resolve(db);
    }
    
    request.onupgradeneeded = (e) => {
      upgradedNeeded = true;
      const db = e.target.result;
      const transaction = e.target.transaction;
      db.createObjectStore(storeName, {keyPath: "chunkId"});
      transaction.oncomplete = (e) => {
        resolve(db);
      }
    }
  })
  
}

function addChunkToDB(videoId, chunkIndex, dataInBinary) { 
  return new Promise((resolve) => {
   
    const chunkId = `${videoId}_${chunkIndex}`; 
    
    const chunkDataInBinary = {
      chunkId,
      dataInBinary
    }

    const request = videoChunksDB
    .transaction(storeName, "readwrite")
    .objectStore(storeName)
    .add(chunkDataInBinary);

    request.onsuccess = (e) => {
      console.log("chunk added: ", e.target.result);
      const stream = videoStreams[videoId];
      
      resolve();
    }

    request.onerror = (e) => {
      console.log("addChunkToDB failed: ", e.target.error);
      if(e.target.error.name == "ConstraintError"){
        const stream = videoStreams[videoId];
        
        resolve();
      }
    }

  })
  
}

function deleteChunkInDB(chunkId) {
  return new Promise((resolve) => {

    videoChunksDB
    .transaction(storeName, "readwrite")
    .objectStore(storeName)
    .delete(chunkId)
    .onsuccess = (e) => {
      console.log("chunk deleted: ",chunkId);
      resolve();
    }
    
  })
}

function getChunkFromDB(videoId, chunkIndex) {

  return new Promise((resolve) => {
    const chunkId = `${videoId}_${chunkIndex}`; 

    const request = videoChunksDB
    .transaction(storeName)
    .objectStore(storeName)
    .get(chunkId);

    request.onsuccess = (e) => {
      console.log("got chunk: ", e.target.result );
      resolve(e.target.result);
    } 

    request.onerror = (e) => {
      console.log("getChunkFromDB failed: ", e.target.error);
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
        videoChunksDB = await openDB();
        
        console.log('Activating service worker');
        resolve();
      } catch( error) {
        console.log("beforeActivate error: ", error)
        reject(error);
      }
    })
  }

  event.waitUntil(beforeActivate());
});

self.addEventListener("message", (event)=> {
  console.log("Service worker received message: ", event.data);
  
  function setupNewStream(event) {
    let newStream;
    let port;

    newStream = new ReadableStream({ start: async controller => {
      port = event.ports[0];
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(''));
      port.onmessage = event => {
        if(event.data) {
          switch(event.data.type){
            case 'BINARY':
              let chunkLength = event.data.chunk.length;
              console.log("chunk length: ", chunkLength);
              let chunkArrary = new Uint8Array(chunkLength);
              for (let i=0; i< chunkLength; i++) {
                chunkArrary[i] = event.data.chunk.charCodeAt(i);
              }
              controller.enqueue(chunkArrary);
              break;
            case 'END_OF_FILE':
              console.log("END_OF_FILE ");
              controller.close();
              port.postMessage({ type:"STREAM_CLOSED"});        
              break;
            default:
          }
        }  
      }
    }});

    let fileName = event.data.fileName;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;

    let id = encodeURI( 'video/' + fileName + Date.now());
    let streamInfo = {
      id,
      fileName,
      fileSize,
      browserInfo,
      stream: newStream
    };
    streams[id] = streamInfo;
    port.postMessage({ type:"STREAM_OPENED", stream: {id}}); 
  }

  async function setupVideoStream(event) {
    
    let port = event.ports[0];
    let timeStamp = event.data.s3KeyPrefix.split(':').pop();
    let fileName = event.data.fileName;
    let fileType = event.data.fileType;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;
    let numberOfChunks = Math.floor(fileSize/chunkSize);
    if(fileSize%chunkSize) numberOfChunks += 1;

    let eventTarget = new EventTarget();
    eventTarget.addEventListener("CHUNK_AVAILABLE", (e)=> {
      console.log("CHUNK_AVAILABLE");
    })
        
    let id = encodeURI( `${timeStamp}_${fileName}`);

    let streamInfo = {
      id,
      fileType,
      fileName,
      fileSize,
      browserInfo,
      numberOfChunks,
      twoBytesSent: false,
      nextChunkIndex: 1,
      chunksInfo: {}
    };

    videoStreams[id] = streamInfo;
    
    let i = 0;
    for(i=0; i<numberOfChunks; i++){
      let result = await getChunkFromDB(id, i);
      if(result) {
      
      } else {
        break;
      }
    }
    let initalChunkIndex = (i=== numberOfChunks)? -1:i;
    
    port.postMessage({ type:"STREAM_OPENED", stream: {id}, initalChunkIndex}); 

    port.onmessage = async event => {
      if(event.data) {
        try {
          switch(event.data.type){
            case 'BINARY':
              let chunkLength = event.data.chunk.length;
              console.log("chunk length: ", chunkLength);
              await addChunkToDB(id, event.data.chunkIndex, event.data.chunk);
              
              port.postMessage({ type:"NEXT_CHUNK", nextChunkIndex: streamInfo.nextChunkIndex}); 
              
              let i;
              for (i= (streamInfo.nextChunkIndex+1); i < numberOfChunks; i++) {
                let result = await getChunkFromDB(id, i);
                if(result) {
      
                } else {
                  break;
                }
              }
              let nextChunkIndex = (i=== numberOfChunks)? -1:i;
              streamInfo.nextChunkIndex = nextChunkIndex;

              break;
            default:
          }
        } catch(error) {
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
    let numberOfChunks = Math.floor(fileSize/chunkSize);
    if(fileSize%chunkSize) numberOfChunks += 1;
        
    let id = encodeURI( `${timeStamp}_${fileName}`);

    let streamInfo = {
      id,
      fileType,
      fileName,
      fileSize,
      browserInfo,
      numberOfChunks
    };

    videoStreams[id] = streamInfo;
    
    port.postMessage({ type:"STREAM_OPENED", stream: {id}}); 

    port.onmessage = async event => {
      if(event.data) {
        try {
          switch(event.data.type){
            case 'BINARY':
              let chunkLength = event.data.chunk.length;
              console.log("chunk length: ", chunkLength);
        
              await addChunkToDB(id, event.data.chunkIndex, event.data.chunk);
        
              break;
            default:
          }
        } catch(error) {
          console.log("port.onmessage failed: ", error)
        }
        
      }  
    }
  }

  if(event.data) {
    event.waitUntil(self.clients.claim());
    switch(event.data.type) {
      case 'INIT_PORT':
        setupNewStream(event);
        break;
      case 'INIT_VIDEO_PORT':
        setupVideoStream(event);
        break;
      case 'INIT_EDITOR_VIDEO_PORT':
        setupEditorVideoStream(event);
        break;
      default:
    }
  }
})

self.addEventListener("fetch", (event) => {
    console.log(`Handling fetch event for ${event.request.url}`);
    let idParts = event.request.url.split('/downloadFile/');
    if(!idParts[1]) return null;
    
    idParts = idParts[1].split('/');
    const isVideo = (idParts[0] === 'video');
    const id = idParts.pop();
    

    let streamInfo = isVideo?videoStreams[id]:streams[id];
    if(!streamInfo){
      return null;
    }

    console.log('stream found: ', streamInfo);

    let fileName = encodeURIComponent(streamInfo.fileName).replace(/['()]/g).replace(/\*/g, '%2A')
    let fileSize = streamInfo.fileSize;
    let fileType = streamInfo.fileType;

    if(isVideo) {
     
      let range = event.request.headers.get('Range');
      let start, end, responseData;
      if(range) {
        range = range.split('=')[1].split('-');
        start = parseInt(range[0]);
        end = range[1];

        if(end === "") {
          if(!streamInfo.twoBytesSent){
            end = start + 1;
            streamInfo.twoBytesSent = true;
          } else {
            end = start + 65535;
          }     
        } else {
          end = parseInt(end);
        }
        if(end >= fileSize){
          end = fileSize-1;
        }
        let chunkIndex = Math.floor(start/chunkSize);
        
        const waitForResponse = async () => {
          let responseData, response;
          let result = await getChunkFromDB(id, chunkIndex);
          if(result) {
            if(end < (chunkIndex + 1)* chunkSize -1){
              responseData = result.dataInBinary.substring(start%chunkSize, end%chunkSize+1)
            
            } else {
              responseData = result.dataInBinary.substring(start%chunkSize);
              end = (chunkIndex +1) * chunkSize - 1;
            }
            let headers = {
              'Content-Type': fileType || 'application/octet-stream; charset=utf-8',
            }      
            headers['Accept-Ranges'] = 'bytes';
            headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
            headers['Content-Length'] = responseData.length;
            
            let responseHeader = {
              // status/statusText default to 200/OK, but we're explicitly setting them here.
              status: 206,
              statusText: 'OK',
              headers
            };

            let responseDataInUint8Arrary = new Uint8Array(responseData.length);
            for(let i=0; i<responseData.length; i++) {
              responseDataInUint8Arrary[i] = responseData.charCodeAt(i);
            }
            response = new Response(responseDataInUint8Arrary, responseHeader);
          } else {

          }
          return response;
        }
        event.respondWith(waitForResponse());
if(0) {
        if(start >= firstVideoChunk.length){
          const waitForResponse = async () => {
            let response = new Response("Hello"/*streamInfo.stream*/, responseHeader);
            await new Promise(resolve=>{
              setTimeout(()=> {
                resolve();
              }, 25000);
            })
            return response;
          }
          event.respondWith(waitForResponse());
          return;
        }

        
        
        if(end >= firstVideoChunk.length) end = firstVideoChunk.length;
        responseData = new Uint8Array(end-start+1);
        let index = 0;
        for(let i=start; i<=end; i++) {
          responseData[index] = firstVideoChunk.charCodeAt(i);
          index++;
        }
      }
}
    } else {
      
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
  