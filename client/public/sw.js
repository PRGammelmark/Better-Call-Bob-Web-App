const PRECACHE = 'precache-v2';
const RUNTIME = 'runtime';

// Filer som skal caches ved installation
const PRECACHE_URLS = [
  // '/',
  // '/index.html',
  // '/site.webmanifest',
  // '/logo192.png',
  // '/logo512.png'
];

// INSTALL - Precache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  // event.waitUntil(
  //   caches.open(PRECACHE)
  //     .then(cache => {
  //       return cache.addAll(PRECACHE_URLS);
  //     })
  //     .then(() => {
  //       return self.skipWaiting();
  //     })
  //     .catch(err => {
  //       console.error('❌ [SW] Error during install/precache:', err);
  //     })
  // );
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
// self.addEventListener('fetch', event => {
//   if (event.request.url.startsWith(self.location.origin)) {

//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }
//         return fetch(event.request);
//       })
//     );
//   }
// });

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});


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
  

// self.addEventListener('notificationclick', (event) => {
//   console.log('🔔 Notifikation klikket:', event.notification.data);
//     event.notification.close();
//     event.waitUntil(
//         clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//             for (const client of clientList) {
//                 if ('focus' in client) return client.focus();
//             }
//             if (clients.openWindow && event.notification.data.url) {
//                 return clients.openWindow(event.notification.data.url);
//             }
//         })
//     );
// });

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notifikation klikket:', event.notification.data);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Find første åbne klient
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Send besked til klienten
          client.postMessage({ type: 'NAVIGATE', url: targetUrl });
          return;
        }
      }

      // Hvis ingen klient er åben, så åbn ny
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});