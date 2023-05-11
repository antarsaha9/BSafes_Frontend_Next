let getVersionPort;
let count = 0;
let testStream;
let readableStream;
let done = false;

let streams = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

self.addEventListener("install", function(event) {
    console.log("Hello world from service worker!")
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

    streams['/test'] = {stream: newStream};
    port.postMessage({ type:"STREAM_OPENED"}); 
  }

  if(event.data) {
    switch(event.data.type) {
      case 'INIT_PORT':
        setupNewStream(event);
        break;
      default:
    }
  }
  if(0) {
  if (event.data && event.data.type === 'INIT_PORT') {
    getVersionPort = event.ports[0];
    
    var counter = 0;
    const encoder = new TextEncoder();
    const sampleStr = "abcdefghij0123456789";
    let chunk = "";
    for(let i=0; i< 5*1000*1000; i++){
      chunk += sampleStr;
    }
    
      testStream = new ReadableStream({ start: async controller => {
        switch (++counter) {
        case 1:
            controller.enqueue(encoder.encode(''));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.enqueue(encoder.encode(chunk));
            await sleep(3000);
            controller.close();
            return;
        case 2:
            controller.enqueue(encoder.encode('chunk #1'));
            return;
        case 3:
            controller.enqueue(encoder.encode(' '));
            return;
        case 4:
            controller.enqueue(encoder.encode('chunk #2'));
            return;
        case 5:
            controller.enqueue(encoder.encode(' '));
            return;
        case 6:
            controller.enqueue(encoder.encode('chunk #3'));
            return;
        case 7:
            controller.enqueue(encoder.encode(' '));
            return;
        case 8:
            controller.enqueue(encoder.encode('chunk #4'));
            return;
        default:
            controller.close();
        }
    }});
  }
  }
})

self.addEventListener("fetch", (event) => {
    console.log(`Handling fetch event for ${event.request.url}`);

    var responseBody = "abcdefg123456";

      
    var responseInit = {
        // status/statusText default to 200/OK, but we're explicitly setting them here.
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/octet-stream; charset=utf-8',
          'Content-Disposition': 'attachment; filename="random.pdf"',
          'Content-Length': 80,
          //'Content-Security-Policy': "default-src 'none'",
          //'X-Content-Security-Policy': "default-src 'none'",
          //'X-WebKit-CSP': "default-src 'none'",
          //'X-XSS-Protection': '1; mode=block'
        }
    };
    if(0) {
    const reader = readableStream.getReader();
    let charsReceived = 0;
    let result = "";

    // read() returns a promise that resolves
    // when a value has been received
   
    reader.read().then(function processText({ done, value }) {
      // Result objects contain two properties:
      // done  - true if the stream has already given you all its data.
      // value - some data. Always undefined when done is true.
      if (done) {
        console.log("Stream complete: ", result);
        
        return;
      }

      charsReceived += value.length;
      const chunk = value;

      result += chunk;

      // Read some more, and call this function again
      return reader.read().then(processText);
    });
    }

    var mockResponse = new Response(streams['/test'].stream, responseInit);
    event.respondWith(mockResponse);
    //event.respondWith(new Response(testStream), responseInit);
    
  
});
  