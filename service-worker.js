self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open('rec-list-cache').then(async (cache) => {
            const urls = [
                './src/index.html',
                './src/styles.css',
                './src/app.js',
                './manifest.json',
                './src/assets/icons/favicon-96x96.png',
                './src/assets/icons/apple-touch-icon.png',
                './src/assets/icons/web-app-manifest-192x192.png',
                './src/assets/icons/web-app-manifest-512x512.png'
            ];
            // Add resources one-by-one so a single 404 doesn't reject the whole install
            for (const u of urls) {
                try {
                    const resp = await fetch(u);
                    if (resp.ok) await cache.put(u, resp.clone());
                } catch (err) {
                    // ignore individual resource failures
                    console.warn('SW cache add failed for', u, err);
                }
            }
        })
    );
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Intercept POST navigations to the local /share receiver and forward them
    // to the Apps Script web app by returning an HTML page that auto-submits a
    // form to the Apps Script exec URL (taken from /manifest.json). This
    // allows the browser to perform a navigation POST to the external domain
    // and include auth cookies, avoiding CORS issues.
    if (req.method === 'POST' && url.pathname.endsWith('/share')) {
        event.respondWith((async () => {
            try {
                const formData = await req.formData();

                // Fetch the manifest at runtime to read the share_target.action
                const manifestResp = await fetch('./manifest.json');
                const manifest = await manifestResp.json();
                const target = manifest && manifest.share_target && manifest.share_target.action;
                if (!target) {
                    return new Response('Apps Script target not configured', { status: 500 });
                }

                // Build hidden inputs from the incoming form data
                const inputs = [];
                for (const pair of formData.entries()) {
                    const k = escapeHtml(pair[0]);
                    const v = escapeHtml(pair[1]);
                    inputs.push(`<input type="hidden" name="${k}" value="${v}">`);
                }

                const html = `<!doctype html><html><head><meta charset="utf-8"><title>Forwarding...</title></head><body>
                    <form id="f" method="POST" action="${escapeHtml(target)}">
                        ${inputs.join('\n')}
                    </form>
                    <script>document.getElementById('f').submit();</script>
                    </body></html>`;

                return new Response(html, { headers: { 'Content-Type': 'text/html' } });
            } catch (err) {
                return new Response('Error forwarding share: ' + err.message, { status: 500 });
            }
        })());
        return;
    }

    // Default cache-first handler for other requests
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});