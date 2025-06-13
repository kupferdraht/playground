// Service Worker für GitHub Pages (Repo: playground)

const CACHE_NAME = 'playground-v1';
const CACHE_URLS = [
  '/playground/',
  '/playground/index.html',
  '/playground/style-pc.css',
  '/playground/style-mobile.css',
  '/playground/manifest.webmanifest',
  '/playground/Bilder/spielicon.jpg',
  '/playground/Bilder/oblakao.gif',
  '/playground/Bilder/spiel1.webp',
  '/playground/kontakt.html',
  '/playground/mehr.html',
  '/playground/über-mich.html',
  // Floor is Lava Spiel
  '/playground/Thefloorislava/game.html',
  '/playground/Thefloorislava/game.css',
  '/playground/Thefloorislava/game%20copy.css',
  '/playground/Thefloorislava/game.js',
  '/playground/Thefloorislava/game%20copy.js',
  // Sounds
  '/playground/sound/start.mp3',
  '/playground/sound/win.mp3',
  '/playground/sound/lose.mp3',
  '/playground/sound/backgroundsound1.mp3',
  '/playground/sound/backgroundsound2.mp3',
  '/playground/sound/backgroundsound3.mp3',
  '/playground/sound/backgroundsound4.mp3',
  '/playground/sound/backgroundsound5.mp3',
  // Lava-Spiel Bilder und Gifs
  '/playground/Thefloorislava/img/lava.gif',
  '/playground/Thefloorislava/img/lava1.gif',
  '/playground/Thefloorislava/img/lava2.gif',
  '/playground/Thefloorislava/img/lava3.gif',
  '/playground/Thefloorislava/img/lava4.gif',
  '/playground/Thefloorislava/img/lava5.gif',
  '/playground/Thefloorislava/img/lava6.gif',
  '/playground/Thefloorislava/img/playercat.png',
  '/playground/Thefloorislava/img/playerclown.png',
  '/playground/Thefloorislava/img/playerdeer.png',
  '/playground/Thefloorislava/img/playermonkey.png',
  '/playground/Thefloorislava/img/playerperson.png',
  '/playground/Thefloorislava/img/playerpig.gif'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching assets...');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Fallback für HTML-Seiten
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/playground/index.html');
          }
        })
      );
    })
  );
});
