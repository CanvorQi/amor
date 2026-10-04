/*
 * Amor - Service worker (çevrimdışı çalışma)
 * -------------------------------------------
 * Uygulama dosyaları kurulumda önbelleğe alınır; açılışta önbellekten gelir,
 * arka planda güncellenir (stale-while-revalidate). Fotoğraflar ilk görüldüklerinde saklanır.
 * Yeni sürüm yayınlarken VERSION'ı artır, eski önbellek silinir.
 */
const VERSION = 'amor-v29';
const CORE = [
  './', './index.html', './manifest.json', './css/style.css',
  './js/store.js', './js/data/photos.js', './js/data/pools.js', './js/data/archetypes.js', './js/data/intents.js', './js/data/topics.js', './js/data/traits.js',
  './js/data/shop.js', './js/data/questions.js', './js/data/memory-data.js', './js/data/custom-characters.js',
  './js/data/custom-dialog.js', './js/schedule.js', './js/mood.js',
  './js/memory.js', './js/interest.js', './js/engine.js', './js/generator.js', './js/wallet.js', './js/shop.js', './js/games.js', './js/app.js', './js/call.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];
const IMG_CACHE = 'amor-img';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== IMG_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Yerel araçlar (diyalog editörü) her zaman ağdan gelsin
  if (url.pathname.includes('/tools/') || url.pathname.startsWith('/api/') || req.referrer.includes('/tools/')) return;

  // Karakter fotoğrafları: önce önbellek
  if (url.origin === location.origin && url.pathname.includes('/characters/')) {
    e.respondWith(caches.open(IMG_CACHE).then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Uygulama dosyaları ve Google Fonts: önbellekten ver, arka planda güncelle
  if (url.origin === location.origin || url.host.endsWith('googleapis.com') || url.host.endsWith('gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
        return res;
      }).catch(() => hit || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
      return hit || net;
    }));
  }
});
