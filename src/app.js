const shareButton = document.getElementById('share-button');

if (navigator.share) {
    shareButton.addEventListener('click', () => {
        navigator.share({
            title: 'Web Share API Demo',
            text: 'Check out this amazing content!',
            url: 'https://example.com',
        })
        .then(() => console.log('Share successful'))
        .catch((error) => console.log('Error sharing:', error));
    });
} else {
    shareButton.style.display = 'none'; // Hide the button if sharing is not supported
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registered successfully.'))
        .catch((error) => console.error('Service Worker registration failed:', error));
}