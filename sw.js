// WarCounter : service worker (réseau d'abord, cache en secours hors ligne)
const VERSION = "warcounter-2.30.1";
const CORE = ["./fonts/fonts.css", "./fonts/oswald-latin-500-normal.woff2", "./fonts/oswald-latin-600-normal.woff2", "./fonts/oswald-latin-700-normal.woff2", "./fonts/source-sans-3-latin-400-normal.woff2", "./fonts/source-sans-3-latin-600-normal.woff2", "./fonts/source-sans-3-latin-700-normal.woff2", "./", "./index.html", "./manifest.webmanifest?v=9", "./icon-192-w.png", "./icon-512-w.png", "./icon-maskable-512-w.png", "./apple-touch-icon-w.png", "./favicon-32-w.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, {cache:"reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const key = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(caches.open(VERSION).then(c =>
    fetch(req, {cache:"no-cache"}).then(res => { if (res.ok) c.put(key, res.clone()); return res; })
      .catch(() => c.match(key).then(hit => hit || Response.error()))
  ));
});
