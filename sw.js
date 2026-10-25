const CACHE = 'bot-town-v10';
const ASSETS = ['./', 'index.html', 'style.css', 'config.js', 'music.js', 'app.js', 'manifest.json',
  'assets/map.jpg', 'assets/scout-house-exterior.webp',
  'assets/olithia-house-v3-idle.webp', 'assets/olithia-house-v3-working.webp', 'assets/olithia-house-v3-sitting.webp',
  'assets/gorbo-house-v3-idle.webp', 'assets/gorbo-house-v3-working.webp', 'assets/gorbo-house-v3-sitting.webp',
  'assets/loria-house-v3-idle.webp', 'assets/loria-house-v3-working.webp', 'assets/loria-house-v3-sitting.webp',
  'assets/scout-house-v3-idle.webp', 'assets/scout-house-v3-working.webp', 'assets/scout-house-v3-sitting.webp',
  'assets/olithia-bedroom.webp', 'assets/gorbo-bedroom-v2.webp', 'assets/loria-bedroom.webp', 'assets/scout-bedroom.webp',
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
