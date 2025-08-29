if ('serviceWorker' in navigator) {
    // use a path relative to the site root so this works when the site is served
    // from GitHub Pages under a repo subpath.
    navigator.serviceWorker.register('../service-worker.js')
        .then(() => console.log('Service Worker registered successfully.'))
        .catch((error) => console.error('Service Worker registration failed:', error));
}

// beforeinstallprompt handling to show an unobtrusive install button
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    deferredPrompt = e;
    // Show the install button
    if (installButton) {
        installButton.style.display = 'inline-block';
        installButton.setAttribute('aria-hidden', 'false');
        installButton.addEventListener('click', async () => {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User response to the install prompt:', outcome);
            deferredPrompt = null;
        });
    }
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed.');
    if (installButton) {
        installButton.style.display = 'none';
    }
});