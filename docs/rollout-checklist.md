# Rollout Checklist — recommended-content-list

This checklist is intended to be followed step-by-step when preparing the PWA + Apps Script flow for teacher posting and student viewing.

Pre-deployment: local verification
- Confirm the PWA is installable locally:
  - `manifest.json` present and correctly linked in `src/index.html` (use `./manifest.json` or `/manifest.json` depending on hosting).
  - At least 192x192 and 512x512 icons present in `src/assets/icons/` and referenced in `manifest.json`.
  - Service worker present and registered; scope covers app pages.
  - App served over HTTPS when hosted (GitHub Pages provides HTTPS).
- Test installability in Chrome on desktop first (DevTools > Application).

Apps Script deployment steps
1. Create a Google Sheet with columns: `timestamp`, `title`, `text`, `url`, `tags`, `thread`, `senderEmail`, `rawPayload`, `status`.
2. In Google Apps Script (linked to that Sheet), create skeleton handlers `doPost(e)` and `doGet(e)`.
3. Implement authentication choice:
   - Preferred: Deploy with `Execute as: User accessing the web app` and `Who has access: Anyone in <your-school-domain>`.
   - Fallback: Deploy with `Execute as: Me` and require a `k=SECRET` query parameter.
4. Deploy as a Web App and copy the `exec` URL (this is the URL used in `manifest.share_target.action`).

Manifest changes
- Update `manifest.json`:
  - Set `share_target.action` to the Apps Script `exec` URL.
  - Ensure `share_target.method` is `POST` and `enctype` is `application/x-www-form-urlencoded`.
  - Keep `start_url` relative (e.g., `./src/index.html`) so GitHub Pages subpath works.

Note: In this repository we generate `manifest.json` from `manifest.template.json` during CI so secrets (the Apps Script exec URL) are not committed to `main`. Do not edit `manifest.json` in `main`; update `manifest.template.json` or add the `APPS_SCRIPT_WEB_APP_URL` secret in GitHub to change the deployed manifest.

Hosting on GitHub Pages
- Use relative links in HTML and in `app.js` and `service-worker.js` registration (e.g., `./service-worker.js`) so the repo-name subpath is respected.
- Push to `main` and enable GitHub Pages from Settings (branch `main`, folder `/root` or `/docs` depending on your preference).

Install & test on phone (teacher)
1. Open the GitHub Pages URL from your phone (while signed into your school account in Chrome).
2. Install the PWA (Chrome menu → Install app).
3. Confirm the PWA shows as installed and service worker is active (DevTools remote debugging or rely on expected UI behavior).
4. Use Chrome on phone to share a URL to RecList: Share → RecList.
5. Verify a new row appears in the Google Sheet with proper fields and extracted tags.

Student / viewer test
- Implement or point the PWA to a read endpoint for display (either published sheet CSV/JSON or `doGet` JSON endpoint).
- From another phone (or same phone but different account), install the PWA and confirm that viewers can fetch and filter by tags.

Edge cases & gotchas
- Cross-origin share_target: If the installed PWA fails to POST directly to Apps Script, use a local POST receiver page (`/share`) and then forward server-side.
- If domain-restricted access is used, ensure the teacher's Chrome instance is logged into that exact domain account before sharing.
- If the school admin blocks domain web apps, fallback to `Execute as: Me` plus secret token or use a serverless function host.

Operational notes
- Backup: schedule a weekly CSV export of the Sheet or manually export after big sessions.
- Moderation: use the `status` column to hide or show items; students see only `published` rows.
- Moderation UI: you can create a simple filtered view inside the Sheet or build a small management page that edits the Sheet via Apps Script.

User-facing instructions (for students)
- How to install: open the provided GitHub Pages URL in Chrome on Android, tap the three-dot menu, choose "Install".
- What the app does: "This app shows curated course links posted by your teacher. Only the teacher may post. Use tags to filter content."
- If the app doesn't install: ensure you are using Chrome on Android and the page meets installability criteria.

Testing plan (detailed)
1. Developer tests on desktop: verify manifest loads, icons resolve, SW registers.
2. Teacher test on phone: install and share a variety of URLs and texts (test hashtag parsing: `#math #algebra`).
3. Student test: install and verify filtering.
4. Failure modes: simulate network down during share; verify that the share either retries or the user sees failure.
5. Confirm that only the allowed email account can post (test by signing into a different account and attempting to share).

Post-launch maintenance
- Keep an admin copy of the Sheet for backups.
- Rotate any secret token if you used one, and update the manifest/action only on your installed PWA (do not commit tokens).
- Monitor the Sheet for spam or malformed rows; adjust your parsing/validation in `doPost`.

Notes for future enhancement
- Add a lightweight moderator approval flow: `doPost` writes with `status=pending`; a separate sheet view or UI lets you approve.
- Add per-item comments/notes column so you can annotate resources for classes.
- Build a small client-side UI that caches the read JSON and supports offline viewing of curated links.

End of file.
