const CACHE = 'dream-sim-v1';
const URLS = ['/docs/index.html','/docs/style.css','/docs/game.js','/docs/script.js','/docs/sounds.js','/docs/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || '梦女模拟器', {
    body: data.body || '有新消息', icon: '/docs/icon-192.png', badge: '/docs/icon-192.png',
    vibrate: [200, 100, 200], tag: 'msg'
  });
});
