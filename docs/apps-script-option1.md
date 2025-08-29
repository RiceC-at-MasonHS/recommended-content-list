# Apps Script Web App — Option 1 (Detailed Spec)

Purpose
- Capture Web Share Target POSTs from your installed PWA on Android.
- Only allow writes from your school Google account (teacher).
- Append incoming shares into a Google Sheet with structured columns suitable for later filtering and display.

High-level flow (compact)
1. PWA (installed on Android) uses `manifest.share_target.action` pointing at the Apps Script Web App URL (https://script.google.com/.../exec).
2. When you use Share → RecList, Chrome POSTs form data (title, text, url, thread) to that URL.
3. Apps Script `doPost(e)` runs server-side, authenticates/validates the request, parses fields and tags, and appends a row to the Sheet.
4. Viewers fetch data from a read endpoint (either published Sheet or an Apps Script `doGet(e)` that returns JSON) and the PWA filters client-side by tags.

Design: Columns in the Google Sheet
- timestamp (UTC ISO string)
- title
- text
- url
- tags (comma-separated)
- thread (if provided by share target)
- senderEmail (if available via Session.getActiveUser or e.parameter)
- rawPayload (optional JSON of the incoming POST for debugging)

Manifest: share_target example (what the PWA should contain)
- This is a minimal `share_target` object for `manifest.json`.

```json
"share_target": {
  "action": "https://script.google.com/macros/s/DEPLOY_ID/exec",
  "method": "POST",
  "enctype": "application/x-www-form-urlencoded",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "thread": "thread"
  }
}
```

Notes about the manifest action URL
- Use the full Apps Script deploy URL (the `exec` endpoint). Replace `DEPLOY_ID` with the actual deploy ID.
- If you choose domain-restricted deployment, the POST will carry the browser's cookies and Apps Script can identify the authenticated user.

Auth / Deployment options (choose one)
A) Domain-authenticated (preferred)
- Deploy Settings:
  - Execute the app as: *User accessing the web app* (so Session.getActiveUser() is available).
  - Who has access: *Anyone within <your-school-domain>*.
- In `doPost(e)`, call `Session.getActiveUser().getEmail()` or `Session.getActiveUser().getUserLoginId()` and only accept writes when it equals your teacher email.
- Advantages: strong security (only your account in domain can post); no secret tokens in client or manifest.
- Caveat: requires the poster (you) be signed into the same school account in Chrome on the phone.

B) Execute-as-me + secret token (fallback)
- Deploy Settings:
  - Execute as: *Me* (your account executes writes).
  - Who has access: *Anyone, even anonymous*.
- Protect writes by requiring a long, unguessable token either as a query parameter `?k=LONGTOKEN` or as a required form field in `doPost`.
- Advantages: simpler for cross-origin issues; your script runs as you so no domain check required.
- Disadvantages: security is token-based (must keep token secret on your device); token leakage allows posting.

Tags strategy
- Three options:
  1. Manual tagging when sharing: include a `tags` field in the manifest params and type tags in the share UI (but most share flows won't present a new input by default).
  2. Hashtag parsing: server-side `doPost` extracts `#tags` from the `text` field and stores them in the `tags` column.
  3. Post-editing: you (teacher) add tags later in the Sheet UI.

Recommendation: parse hashtags from the incoming `text` automatically (works well for quick sharing), and allow editing tags later.

doPost(e) expectations (behavior description, not code)
- Validate request origin/auth depending on deployment option.
- Pull fields from `e.parameter` (title, text, url, thread) and also capture `e.postData.contents` for debugging.
- Extract tags (e.g., regex for `#(\w[\w-]*)`) and normalize to lower-case, comma-separated.
- Append a row to the Sheet with the columns listed above.
- Return an HTTP 200 and a short HTML snippet; the browser's share flow may show the response briefly.

doGet(e) for read API (optional)
- Provide a `doGet` handler that serves JSON of the latest N rows or filtered results by tag.
- If you keep access restricted to your domain, the PWA (if also domain-authenticated) can fetch this endpoint and receive JSON.
- If you want public reading without auth, consider publishing the Sheet and letting the PWA fetch the published CSV/JSON instead.

CORS and cookies
- When deploying with domain-authentication, the browser will include cookies for script.google.com and Apps Script will see the signed-in user.
- If your PWA attempts to `fetch()` Apps Script endpoints (instead of relying on the browser's form POST from share_target), ensure the Apps Script returns CORS headers and supports credentialed requests (set `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` appropriately).

Cross-origin share_target caveat
- Some browser implementations prefer same-origin share_target actions. In practice Chrome on Android will POST to an external HTTPS URL (Apps Script) for installed PWAs, but this behavior should be tested.
- If direct cross-origin POST from the Share dialog fails, fallback:
  - Use a local `./share` page in the PWA as the `action`. The local page will receive the POST and then client-side forward the payload to Apps Script (via fetch or by creating a form). This may require the user to interact or be signed-in.

Security notes
- Do not commit secrets into the repo (e.g., long token). If you use a token, keep it only on your device.
- Prefer domain-auth option if available — stronger and simpler to reason about.

Logging and debugging
- Save `rawPayload` and a `debug` column in the Sheet to capture the raw POST for troubleshooting.
- Optionally, send a confirmation email to yourself (Apps Script MailApp) after successful append — useful during testing but avoid spamming.

Backup and moderation
- Keep a manual `status` column (e.g., `published`/`hidden`) that you can toggle in the Sheet.
- Periodically export the sheet as CSV for offline backups.

What an AI developer will want next (vibe-coding pointers)
- Exact `doPost(e)` and `doGet(e)` function signatures and example implementations.
- A manifest snippet with the precise deployed URL.
- A small client-side view in the PWA that fetches the read API and implements tag-based filtering (UI + simple JS).
- Tests for: direct share POST flow, hashtag parsing edge cases, domain-auth rejection, fallback flow when cross-origin POST fails.

Environment variables and local dev
---------------------------------
Keep deployment-specific values out of the repo. Store the real Apps Script deployment ID and web app URL in environment variables on your development machine or CI environment. Do **not** commit any real secrets (for example a long secret token) to source control.

Recommended environment variable names (used by scripts and local tooling):

- `APPS_SCRIPT_DEPLOYMENT_ID` — the Apps Script deployment ID (e.g. `AKfycb...`).
- `APPS_SCRIPT_WEB_APP_URL` — full Apps Script deploy `exec` URL (e.g. `https://script.google.com/.../exec`).
- `SHARE_SECRET` — optional long secret token (only for the execute-as-me fallback). Keep this secret out of the repo.

Example usage notes
- When building your `manifest.json` for the deployed PWA, replace the `share_target.action` value with the real `APPS_SCRIPT_WEB_APP_URL`. In local development you can instead point it at a local `/share` receiver page and forward the payload to the Apps Script endpoint.
- Add a `.env` file locally containing the real values (gitignored). Commit only `.env.example` with placeholder values so others or an AI assistant know the variable names and expected shapes.

Manifest snippet showing where the web app URL belongs (replace with your real `APPS_SCRIPT_WEB_APP_URL`):

```json
"share_target": {
  "action": "https://script.google.com/macros/s/REPLACE_WITH_APPS_SCRIPT_DEPLOY_ID/exec",
  "method": "POST",
  "enctype": "application/x-www-form-urlencoded",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "thread": "thread"
  }
}
```

If you want to keep the `action` value out of the committed `manifest.json` while developing, a simple developer workflow is:

1. Keep `manifest.json` with a placeholder value and populate the real `share_target.action` at build time using an environment-aware script or your local editor.
2. Or keep a small `manifest.local.json` for development and `manifest.prod.json` for deployment; copy the correct file during your publish step.

End of file.
