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
    console.log('beforeinstallprompt fired');
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    // Show the install button and wire it to the saved prompt
    if (installButton) {
        installButton.textContent = 'Install RecList';
        installButton.style.display = 'inline-block';
        installButton.setAttribute('aria-hidden', 'false');
        installButton.onclick = async () => {
            installButton.style.display = 'none';
            try {
                deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                console.log('User response to the install prompt:', choice);
            } catch (err) {
                console.warn('Error prompting install:', err);
            }
            deferredPrompt = null;
        };
    }
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed.');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// Fallback: if beforeinstallprompt doesn't fire, show a help/install hint
// after a short timeout so users can still install via Chrome menu.
setTimeout(() => {
    // If we already have the prompt or app is installed, do nothing
    if (deferredPrompt) return;
    if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) return;

    if (installButton) {
        installButton.style.display = 'inline-block';
        installButton.setAttribute('aria-hidden', 'false');
        installButton.textContent = 'Install (or use Chrome menu → Add to Home screen)';
        installButton.onclick = () => {
            // If the browser later provides the prompt, this will call it; otherwise show manual instructions
            if (deferredPrompt) {
                deferredPrompt.prompt();
            } else {
                alert('To install RecList: open Chrome menu (⋮) and choose "Add to Home screen".');
            }
        };
    }
    console.log('Showing fallback install/help UI');
}, 2500);

// Attempt to detect whether the current viewer is the teacher by calling the
// Apps Script whoami endpoint. The manifest may contain a local action (./src/share.html)
// in which case we don't have an external URL to call.
async function checkAdmin() {
    try {
        const m = await fetch('../manifest.json');
        const manifest = await m.json();
        const action = manifest.share_target && manifest.share_target.action;
        // Only call whoami if action looks like an absolute URL (Apps Script exec)
        if (!action || action.startsWith('./') || action.startsWith('/')) {
            console.log('whoami: share_target.action is local or not set; skipping whoami check');
            return;
        }
        const whoamiUrl = new URL(action);
        whoamiUrl.searchParams.set('whoami', '1');
        const resp = await fetch(whoamiUrl.toString(), { credentials: 'include' });
        if (!resp.ok) {
            console.warn('whoami fetch failed', resp.status);
            return;
        }
        const data = await resp.json();
        const badge = document.getElementById('adminBadge');
        const emailSpan = document.getElementById('adminEmail');
        if (data && data.email) {
            if (emailSpan) emailSpan.textContent = data.email + (data.isTeacher ? ' (teacher)' : '');
            if (badge) badge.style.display = 'block';
        }
    } catch (err) {
        console.warn('whoami check error', err);
    }
}

checkAdmin();