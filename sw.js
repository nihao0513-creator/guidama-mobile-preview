const CACHE='guidama-mobile-shell-v8';
const ASSETS=['./','./index.html','./app.js','./sync.js','./storage.js','./summary.js','./zip.js','./asr-worker.js','./style.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/transformers.js','./vendor/onnxruntime-common.js','./vendor/onnxruntime-web.js','./vendor/ort-wasm-simd-threaded.jsep.mjs','./vendor/ort-wasm-simd-threaded.jsep.wasm'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('guidama-mobile-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response.ok)cache.put(event.request,response.clone());return response}catch{return await cache.match(event.request)||Response.error()}})());return}
});
