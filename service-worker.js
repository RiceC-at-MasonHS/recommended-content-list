self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open('rec-list-cache').then((cache) => {
            return cache.addAll([
                '/recommended-content-list/src/index.html',
                '/recommended-content-list/src/styles.css',
                '/recommended-content-list/src/app.js',
                '/recommended-content-list/manifest.json',
                '/recommended-content-list/src/assets/icons/favicon-96x96.png',
                '/recommended-content-list/src/assets/icons/apple-touch-icon.png',
                '/recommended-content-list/src/assets/icons/web-app-manifest-192x192.png',
                '/recommended-content-list/src/assets/icons/web-app-manifest-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});