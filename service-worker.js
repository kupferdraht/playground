// Service Worker für GitHub Pages (Repo: playground)

const CACHE_NAME = 'playground-v1';
const CACHE_URLS = [
  '/playground/',
  '/playground/index.html',
  '/playground/style-pc.css',
  '/playground/style-mobile.css',
  '/playground/manifest.webmanifest',
  '/playground/Bilder/spielicon.png',
  '/playground/Bilder/oblakao.gif',
  '/playground/Bilder/spiel1.webp',
  '/playground/Bilder/spiel2.jpg',
  '/playground/kontakt.html',
  '/playground/mehr.html',
  '/playground/über-mich.html',
  // Floor is Lava Spiel
  '/playground/Thefloorislava/game.html',
  '/playground/Thefloorislava/game.css',
  '/playground/Thefloorislava/game-copy.css',
  '/playground/Thefloorislava/game.js',
  '/playground/Thefloorislava/game-copy.js',
  // Sounds
  '/playground/sound/start.mp3',
  '/playground/sound/win.mp3',
  '/playground/sound/lose.mp3',
  '/playground/sound/backgroundsound1.mp3',
  '/playground/sound/backgroundsound2.mp3',
  '/playground/sound/backgroundsound3.mp3',
  '/playground/sound/backgroundsound4.mp3',
  '/playground/sound/backgroundsound5.mp3',
  // Lava-Spiel Bilder
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
  '/playground/Thefloorislava/img/playerpig.gif',
  // Glücksfarben game
   '/playground/Glücksfarbe/Glücksfarbe.html',
    '/playground/Glücksfarbe/Glücksfarbe-desktop.css',
    '/playground/Glücksfarbe/Glücksfarbe-mobile.css',
    '/playground/Glücksfarbe/Glücksfarbe-desktop.js',
    '/playground/Glücksfarbe/Glücksfarbe-mobile.js',
  '/playground/Glücksfarbe/catunten.png',
    // Dummy-Favicon zur Vermeidung von 404s
  '/playground/favicon.ico'
];

self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of CACHE_URLS) {
        try {
          await cache.add(url);
          console.log(`✅ Cached: ${url}`);
        } catch (err) {
          console.warn(`⚠️ Failed to cache: ${url}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log(`🗑️ Deleting old cache: ${key}`);
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
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(err => {
          console.warn(`❌ Network failed for: ${event.request.url}`);
          if (event.request.destination === 'document') {
            return caches.match('/playground/index.html');
          }
        })
      );
    })
  );
});
