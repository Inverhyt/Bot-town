const CACHE = 'bot-town-v21';
const ASSETS = ['./', 'index.html', 'style.css', 'config.js', 'music.js', 'app.js', 'manifest.json',
  'assets/map-v2.webp', 'assets/starfall-hill-scene.webp',
  'assets/olithia-house-v4.webp', 'assets/olithia-house-v4-exterior.webp',
  'assets/olithia-house-v4-idle.webp', 'assets/olithia-house-v4-working.webp', 'assets/olithia-house-v4-sitting.webp',
  'assets/gorbo-house-v4.webp',
  'assets/gorbo-house-v4-idle.webp', 'assets/gorbo-house-v4-working.webp', 'assets/gorbo-house-v4-sitting.webp',
  'assets/loria-house-v4.webp',
  'assets/loria-house-v4-idle.webp', 'assets/loria-house-v4-working.webp', 'assets/loria-house-v4-sitting.webp',
  'assets/scout-house-v4.webp',
  'assets/scout-house-v4-idle.webp', 'assets/scout-house-v4-working.webp', 'assets/scout-house-v4-sitting.webp',
  'assets/gorbo-house-v4-visit.webp', 'assets/loria-house-v4-visit.webp', 'assets/scout-house-v4-visit.webp',
  'assets/olithia-bedroom-v2.webp', 'assets/gorbo-bedroom-v4.webp', 'assets/loria-bedroom-v4.webp', 'assets/scout-bedroom-v4.webp',
  'assets/olithia-bedroom-v2-sleeping.webp', 'assets/gorbo-bedroom-v4-sleeping.webp', 'assets/loria-bedroom-v4-sleeping.webp', 'assets/scout-bedroom-v4-sleeping.webp',
  'assets/room-scout.webp', 'assets/olithia.png', 'assets/scout.png',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } // also caches Google Fonts
    return res;
  }).catch(() => caches.match('index.html'))));
});
