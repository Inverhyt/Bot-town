const CACHE = 'bot-town-v31';
const ASSETS = ['./', 'index.html', 'style.css', 'config.js', 'music.js', 'app.js', 'manifest.json',
  'assets/map-v3.webp', 'assets/starfall-hill-v3-empty.webp','assets/park-v31/blanket-gorbo.webp','assets/park-v31/blanket-gorbo-night.webp','assets/park-v31/blanket-loria.webp','assets/park-v31/blanket-loria-night.webp','assets/park-v31/blanket-olithia.webp','assets/park-v31/blanket-olithia-night.webp','assets/park-v31/blanket-scout.webp','assets/park-v31/blanket-scout-night.webp','assets/park-v31/board-gorbo.webp','assets/park-v31/board-gorbo-night.webp','assets/park-v31/board-loria.webp','assets/park-v31/board-loria-night.webp','assets/park-v31/board-olithia.webp','assets/park-v31/board-olithia-night.webp','assets/park-v31/board-scout.webp','assets/park-v31/board-scout-night.webp','assets/park-v31/crest-gorbo.webp','assets/park-v31/crest-gorbo-night.webp','assets/park-v31/crest-loria.webp','assets/park-v31/crest-loria-night.webp','assets/park-v31/crest-olithia.webp','assets/park-v31/crest-olithia-night.webp','assets/park-v31/crest-scout.webp','assets/park-v31/crest-scout-night.webp','assets/park-v31/market-gorbo.webp','assets/park-v31/market-gorbo-night.webp','assets/park-v31/market-loria.webp','assets/park-v31/market-loria-night.webp','assets/park-v31/market-olithia.webp','assets/park-v31/market-olithia-night.webp','assets/park-v31/market-scout.webp','assets/park-v31/market-scout-night.webp','assets/park-v31/nook-gorbo.webp','assets/park-v31/nook-gorbo-night.webp','assets/park-v31/nook-loria.webp','assets/park-v31/nook-loria-night.webp','assets/park-v31/nook-olithia.webp','assets/park-v31/nook-olithia-night.webp','assets/park-v31/nook-scout.webp','assets/park-v31/nook-scout-night.webp','assets/park-v31/swap-gorbo.webp','assets/park-v31/swap-gorbo-night.webp','assets/park-v31/swap-loria.webp','assets/park-v31/swap-loria-night.webp','assets/park-v31/swap-olithia.webp','assets/park-v31/swap-olithia-night.webp','assets/park-v31/swap-scout.webp','assets/park-v31/swap-scout-night.webp','assets/park-v31/tea-gorbo.webp','assets/park-v31/tea-gorbo-night.webp','assets/park-v31/tea-loria.webp','assets/park-v31/tea-loria-night.webp','assets/park-v31/tea-olithia.webp','assets/park-v31/tea-olithia-night.webp','assets/park-v31/tea-scout.webp','assets/park-v31/tea-scout-night.webp', 'assets/starfall-hill-v3-night-empty.webp', 'assets/park-olithia-day.webp', 'assets/park-olithia-night.webp', 'assets/park-scope-gorbo.webp', 'assets/park-scope-loria.webp', 'assets/park-scope-scout.webp', 'assets/park-scope-olithia.webp', 'assets/park-gorbo-day.webp', 'assets/park-gorbo-night.webp', 'assets/park-loria-day.webp', 'assets/park-loria-night.webp', 'assets/park-scout-day.webp', 'assets/park-scout-night.webp',
  'assets/sprite-gorbo.webp', 'assets/sprite-loria.webp', 'assets/sprite-scout.webp', 'assets/face-gorbo.webp', 'assets/face-loria.webp', 'assets/face-scout.webp', 'assets/sprite-olithia.webp', 'assets/face-olithia.webp', 'assets/playground-v1.webp', 'assets/playground-swing.webp', 'assets/scout-house-v4-working-v2.webp',
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
  'assets/olithia-bedroom-v2-night.webp', 'assets/olithia-bedroom-v2-awake.webp', 'assets/olithia-bedroom-v2-awake-night.webp', 'assets/gorbo-bedroom-v4-night.webp', 'assets/gorbo-bedroom-v4-awake.webp', 'assets/gorbo-bedroom-v4-awake-night.webp', 'assets/loria-bedroom-v4-night.webp', 'assets/loria-bedroom-v4-awake.webp', 'assets/loria-bedroom-v4-awake-night.webp', 'assets/scout-bedroom-v4-night.webp', 'assets/scout-bedroom-v4-awake.webp', 'assets/scout-bedroom-v4-awake-night.webp', 'assets/olithia-bedroom-v2-sleeping-day.webp',
  'assets/room-scout.webp', 'assets/olithia.png', 'assets/scout.png',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png', 'assets/icon-maskable-512.png', 'assets/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const path = new URL(e.request.url).pathname;
  if (['/status.json', '/letters.json', '/tasks.json', '/board.json', '/poems.json'].some(f => path.endsWith(f))) {
    e.respondWith(fetch(e.request, { cache: 'no-store' })); // live files, never written into the cache
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } // also caches Google Fonts
    return res;
  }).catch(() => caches.match('index.html'))));
});
