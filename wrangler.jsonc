const CACHE="ate-annas-laundry-pos-v513-online-booking-route-fix";
const ASSETS=[
  "/","/index.html","/styles.css","/app.js",
  "/booking.html","/booking/","/booking/index.html","/booking.css","/booking.js",
  "/terms.html","/privacy-cookies.html",
  "/manifest.webmanifest","/_routes.json"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);

  if(url.pathname.startsWith("/api/")){
    event.respondWith(fetch(request));
    return;
  }

  const isAppFile=["document","script","style"].includes(request.destination);
  if(isAppFile){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request).then(hit=>hit||caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit=>hit||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});
