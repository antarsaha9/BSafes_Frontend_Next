let streams = {};
let videoStreams = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

self.addEventListener('install', event => {
  // Bypass the waiting lifecycle stage,
  // just in case there's an older version of this SW registration.
  console.log('Service worker installed.');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  // Take control of all pages under this SW's scope immediately,
  // instead of waiting for reload/navigation. https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request
  console.log('Service worker activited');
  event.waitUntil(self.clients.claim());
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

  function setupVideoStream(event) {
    let videoStream;
    let port;

    let fileName = event.data.fileName;
    let fileType = event.data.fileType;
    let fileSize = event.data.fileSize;
    let browserInfo = event.data.browserInfo;
    
    videoStream = new ReadableStream({ start: async controller => {
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
    
    let id = encodeURI( fileName + Date.now());
    let streamInfo = {
      id,
      fileType,
      fileName,
      fileSize,
      browserInfo,
      stream: videoStream
    };
    videoStreams[id] = streamInfo;
    port.postMessage({ type:"STREAM_OPENED", stream: {id}}); 
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
    let browserInfo = streamInfo.browserInfo;

    let headers = {
      'Content-Type': fileType || 'application/octet-stream; charset=utf-8',
      'Content-Disposition': "attachment; filename*=UTF-8''" + fileName,
      'Content-Length': fileSize,
      //'Content-Security-Policy': "default-src 'none'",
      //'X-Content-Security-Policy': "default-src 'none'",
      //'X-WebKit-CSP': "default-src 'none'",
      //'X-XSS-Protection': '1; mode=block'
    }

    if(browserInfo.isChrome) {
      headers['Accept-Ranges'] = 'bytes';
    }

    var responseHeader = {
        // status/statusText default to 200/OK, but we're explicitly setting them here.
        status: 200,
        statusText: 'OK',
        headers
    };
    
    var response = new Response(streamInfo.stream, responseHeader);
    event.respondWith(response);
  
});
  