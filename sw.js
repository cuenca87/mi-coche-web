// Caché de la app; los datos (data.enc, data_padre.enc) siempre de red, con copia de respaldo sin conexión.
const C = 'micoche-v4';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const enc = u.pathname.match(/([\w-]+\.enc)$/);
  if (enc || u.pathname.endsWith('/') || u.pathname.endsWith('index.html')) {
    // red primero
    const clave = enc ? enc[1] : e.request;
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(C).then(c => c.put(clave, copia)); }
      return r;
    }).catch(() => caches.match(clave)));
    return;
  }
  if (SHELL.some(s => e.request.url.endsWith(s.replace('./', '')))) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
