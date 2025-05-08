self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open('rec-list-cache').then((cache) => {
            return cache.addAll([
                '/src/index.html',
                '/src/styles.css',
                '/src/app.js',
                '/manifest.json',
                '/src/assets/icons/favicon-16x16.png',
                '/src/assets/icons/favicon-32x32.png',
                '/src/assets/icons/favicon-96x96.png',
                '/src/assets/icons/apple-touch-icon.png',
                '/src/assets/icons/android-chrome-192x192.png',
                '/src/assets/icons/android-chrome-512x512.png'
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