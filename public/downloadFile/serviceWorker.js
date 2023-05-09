let getVersionPort;
let count = 0;
let testStream;
let readableStream;
let done = false;

self.addEventListener("install", function(event) {
    console.log("Hello world from service worker!")
});

self.addEventListener("message", (event)=> {
  console.log("Service worker received message: ", event.data);
  if (event.data && event.data.type === 'INIT_PORT') {
    getVersionPort = event.ports[0];
    
    var counter = 0;
    const encoder = new TextEncoder();
    testStream = new ReadableStream({ start: controller => {
        switch (++counter) {
        case 1:
            controller.enqueue(encoder.encode(''));
            controller.enqueue(encoder.encode('chunk #1'));
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

    function randomChars() {
      let string = "";
      let choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  
      for (let i = 0; i < 8; i++) {
        string += choices.charAt(Math.floor(Math.random() * choices.length));
      }
      return string;
    }

    let result = "";
    function readStream() {
      const reader = readableStream.getReader();
      let charsReceived = 0;
  
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
    let interval;
    readableStream = new ReadableStream({
      start(controller) {
        let total = 0;
        interval = setInterval(() => {
          let string = randomChars();

          // Add the string to the stream
          controller.enqueue(string);
          console.log("new data: ", string)
          total ++;
          if(total === 10) {
            clearInterval(interval);
            //readStream();
            controller.close();
          }
        }, 1000);
      },
      pull(controller) {
        // We don't really need a pull in this example
      },
      cancel() {
        // This is called if the reader cancels,
        // so we should stop generating strings
        clearInterval(interval);
      }
    });

  }

  if (event.data && event.data.type === 'INCREASE_COUNT') {
    getVersionPort.postMessage({ payload: ++count });
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
          'Content-Type': 'text/htm; charset=utf-8',
          'Content-Disposition': 'attachment; filename="random.txt"',
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

    var mockResponse = new Response(testStream, responseInit);
    event.respondWith(mockResponse);
    //event.respondWith(new Response(testStream), responseInit);
    
  
});
  