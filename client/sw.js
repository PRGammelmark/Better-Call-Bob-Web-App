const staticCacheName = "site-static";
const assets = [
    '/',
    '/index.html',
    '/site.webmanifest',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png'
];

// install the service worker
self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Caching shell assets');
            cache.addAll(assets);
        })
    );
});

// activate the service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(self.clients.claim());
});

// fetch the service worker
// self.addEventListener('fetch', (event) => {
//     console.log('Service Worker fetching');
//     event.respondWith(fetch(event.request));
// });

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {
            return cacheResponse || fetch(event.request);
        })
    );
});

