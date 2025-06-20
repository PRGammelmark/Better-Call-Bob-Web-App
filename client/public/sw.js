// const staticCacheName = "site-static";
// const assets = [
//     '/',
//     '/index.html',
//     '/site.webmanifest',
//     '/logo192.png',
//     '/logo512.png'
// ];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// Filer som skal caches ved installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/logo192.png',
  '/logo512.png'
];

// INSTALL - Precache assets
self.addEventListener('install', event => {

  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('❌ [SW] Error during install/precache:', err);
      })
  );
});

// ACTIVATE - Cleanup old caches
self.addEventListener('activate', event => {

  const currentCaches = [PRECACHE, RUNTIME];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const toDelete = cacheNames.filter(name => !currentCaches.includes(name));
        return Promise.all(toDelete.map(name => caches.delete(name)));
      })
      .then(() => {
        return self.clients.claim();
      })
      .catch(err => {
        console.error('❌ [SW] Error during activate:', err);
      })
  );
});

// FETCH - Serve from cache first, then network fallback
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {

    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }


        return fetch(event.request);
        // return caches.open(RUNTIME).then(cache => {
        //   return fetch(event.request).then(response => {
        //     // Put a copy of the response in the runtime cache
        //     return cache.put(event.request, response.clone()).then(() => {
        //       return response;
        //     });
        //   }).catch(err => {
        //     console.error('❌ [SW] Network fetch failed:', err);
        //     throw err;
        //   });
        // });
      })
    );
  }
});
  

// // install the service worker
// self.addEventListener('install', (event) => {
//     console.log('📦 Service Worker installing');
  
//     // Spring ventetid over, så den bliver aktiv med det samme
//     self.skipWaiting();
  
//     event.waitUntil(
//       caches.open(staticCacheName).then((cache) => {
//         console.log('📂 Caching shell assets');
//         return cache.addAll(assets);
//       })
//     );
//   });
  
//   // activate the service worker
//   self.addEventListener('activate', (event) => {
//     console.log('🚀 Service Worker activating');
  
//     // Tag kontrol over alle åbne klienter (vinduer)
//     event.waitUntil(self.clients.claim());
//   });
  

// self.addEventListener('install', event => {
//   console.log('→ install');
//   event.waitUntil(
//     caches.open(staticCacheName).then(cache => cache.addAll(assets))
//       .then(self.skipWaiting())
//   );
// });

// self.addEventListener('activate', event => {
//   console.log('→ activate');
//   event.waitUntil(self.clients.claim());
// });


// // fetch the service worker
// self.addEventListener('fetch', (event) => {
//     console.log('Service Worker fetching');
//     event.respondWith(
//         caches.match(event.request).then((cacheResponse) => {
//             return cacheResponse || fetch(event.request);
//         })
//     );
// });

// PUSH NOTIFICATIONS

self.addEventListener('push', (event) => {
    console.log('✅ Push event modtaget');

    const data = event.data.json();
  
    const notificationTitle = data?.title || 'Ny notifikation';
    const notificationOptions = {
      body: data?.body || 'Du har modtaget en ny besked.',
      data: {
        url: data?.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
        .catch(err => console.error('❌ showNotification fejlede:', err))
    );
  });

//   self.addEventListener('push', (event) => {
//     console.log('✅ Push event modtaget');
  
//     // Standard fallback-indhold
//     let notificationTitle = 'Ny notifikation';
//     let notificationOptions = {
//       body: 'Du har modtaget en ny besked.',
//       icon: '/logo192.png',       // Valgfri men anbefalet
//       badge: '/logo192.png',      // Også valgfri
//       data: { url: '/' }          // Bruges af notificationclick
//     };
  
//     // Forsøg at parse data fra push payload
//     try {
//       if (event.data) {
//         const data = event.data.json();
//         console.log('📦 Push-data modtaget:', data);
  
//         notificationTitle = data.title || notificationTitle;
//         notificationOptions.body = data.body || notificationOptions.body;
//         notificationOptions.data.url = data.url || '/';
//       }
//     } catch (err) {
//       console.warn('⚠️ Kunne ikke parse event.data:', err);
//     }
  
//     // Vis notifikationen
//     event.waitUntil(
//       self.registration.showNotification(notificationTitle, notificationOptions)
//         .catch(err => console.error('❌ showNotification fejlede:', err))
//     );
//   });
  

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow && event.notification.data.url) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});