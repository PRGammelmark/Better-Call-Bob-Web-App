console.log('Service Worker loaded');

const staticCacheName = "site-static";
const assets = [
    '/',
    '/index.html',
    '/site.webmanifest',
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
    console.log('Service Worker fetching');
    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {
            return cacheResponse || fetch(event.request);
        })
    );
});

// PUSH NOTIFICATIONS

self.addEventListener('push', (event) => {
    console.log('✅ Push notification received');

    console.log(event.data.json());
    const notifikation = event.data.json();
  
    const notificationTitle = notifikation.title || 'Ny notifikation';
    const notificationOptions = {
      body: notifikation.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: '/' }
    };
  
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  });
  

// self.addEventListener('push', (event) => {
//     console.log('Push notification received');
//     console.log(event);
  
//     let data = {};
//     if (event.data) {
//       try {
//         data = event.data.json();
//         console.log('Push data as JSON:', data);
//       } catch (e) {
//         data = { title: 'Ny besked', body: event.data.text() };
//         console.log('Push data as text:', data);
//       }
//     } else {
//       console.log('Push event uden data');
//     }
  
//     const title = data.title || 'Ny notifikation';
//     const options = {
//       body: data.body || 'Du har en ny notifikation',
//       icon: '/logo192.png',
//       badge: '/logo192.png',
//       data: { url: data.url || '/' },
//       tag: `${Date.now()}`,
//       requireInteraction: true,
//     };
  
//     event.waitUntil(
//       self.registration.showNotification(title, options).then(() => {
//         console.log('Notification vist:', title);
//       }).catch((err) => {
//         console.error('Fejl ved showNotification:', err);
//       })
//     );
//   });
  

// self.addEventListener('push', (event) => {
//     console.log('Push notification received');
//     let data = {};
//     if (event.data) {
//         try {
//             data = event.data.json();
//         } catch (e) {
//             data = { title: 'Ny besked', body: event.data.text() };
//         }
//     }

//     const options = {
//         body: data.body || 'Du har en ny notifikation',
//         icon: '/logo192.png',
//         badge: '/logo192.png',
//         data: {
//             url: data.url || '/', // så du kan deep-linke
//         },
//     };

//     event.waitUntil(
//         self.registration.showNotification(data.title || 'Ny notifikation', options)
//     );
// });

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