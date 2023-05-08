self.addEventListener("install", function(event) {
    console.log("Hello world from service worker!")
});

self.addEventListener("fetch", (event) => {
    console.log(`Handling fetch event for ${event.request.url}`);

    var responseBody = {
        kind: 'urlshortener#url',
        id: 'http://goo.gl/IKyjuU',
        longUrl: 'https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html'
      };

      if(1) {
      var responseInit = {
        // status/statusText default to 200/OK, but we're explicitly setting them here.
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="cool.bin"'
        }
      };
    }
    if(0) {
    const responseHeaders = new Headers({
        'Content-Type': 'application/octet-stream; charset=utf-8',
    
        // To be on the safe side, The link can be opened in a iframe.
        // but octet-stream should stop it.
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Security-Policy': "default-src 'none'",
        'X-WebKit-CSP': "default-src 'none'",
        'X-XSS-Protection': '1; mode=block',
        'Cross-Origin-Embedder-Policy': 'require-corp'
    })

    responseHeaders.set('Content-Disposition', 'attachment; filename="cool.bin"')
}
      var mockResponse = new Response(JSON.stringify(responseBody), responseInit);
      event.respondWith(mockResponse);
    });