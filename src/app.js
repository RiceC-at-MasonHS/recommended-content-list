if ('serviceWorker' in navigator) {
    // use a path relative to the site root so this works when the site is served
    // from GitHub Pages under a repo subpath.
    navigator.serviceWorker.register('../service-worker.js')
        .then(() => console.log('Service Worker registered successfully.'))
        .catch((error) => console.error('Service Worker registration failed:', error));
}