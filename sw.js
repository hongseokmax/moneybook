/* 오프라인에서도 열리게 — 앱 파일만 담아 둔다. 장부는 기기 안(IndexedDB)에 있다. */
const CACHE = 'moneybook-v1';
const FILES = ['./', './index.html', './manifest.webmanifest',
               './pret-r.woff2', './pret-b.woff2',
               './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', ev=>{
  ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', ev=>{
  ev.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch', ev=>{
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      /* 깃허브 통신은 건드리지 않는다 */
  /* 새 판이 있으면 받아 두되, 없으면 담아 둔 것으로 연다 */
  ev.respondWith(
    fetch(req).then(res=>{
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); }
      return res;
    }).catch(()=> caches.match(req).then(r=> r || caches.match('./index.html')))
  );
});
