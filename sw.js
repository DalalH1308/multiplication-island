/* ===== sw.js : offline copy of the game for the hosted site (GitHub Pages or any static host) =====
   The first visit saves every file. Later visits open from the saved copy at once (also with no internet),
   and quietly download any new version for the next visit.
   After changing the list of files, raise the version number below. */
'use strict';
const CACHE = 'mult-island-v2';
const FILES = [
  './', 'index.html', 'css/style.css',
  'js/data.js', 'js/core.js', 'js/visuals.js', 'js/engine.js', 'js/screens.js', 'js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mult-island-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const saved = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (saved) { e.waitUntil(fresh); return saved; }
    const res = await fresh;
    return res || new Response('You are offline. Please connect to the internet once to load the game.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }));
});
