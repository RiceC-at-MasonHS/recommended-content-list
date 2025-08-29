Apps Script deployment & usage (minimal MVP)

Goal
- Accept share POSTs from the installed PWA and append rows to a Google Sheet.
- Use domain-auth so only the teacher account can post.

Setup
1. Create a Google Sheet with headers (first row):
   id, timestamp, title, text, url, tags, thread, senderEmail, status, rawPayload
2. Open the Script editor (Extensions → Apps Script) and paste `Code.gs` from this repo.
3. In the script, set `SHEET_ID` to your Sheet ID or set a script property (Project Settings → Script properties).
4. Replace `TEACHER_EMAIL` in the code with your teacher email. This deployment only allows that email to post.

Deployment (domain-auth option)
1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as**: *User accessing the web app*.
4. Set **Who has access**: *Anyone in <your-school-domain>*.
5. Deploy and copy the `exec` URL.

Note: After deployment, add the `APPS_SCRIPT_WEB_APP_URL` value to your repository secrets so CI can inject it into `manifest.json` at deploy time. Do not commit the `exec` URL or any secrets into the repository.

Important: If you edited `apps-script/Code.gs` in the repo, you must redeploy the Apps Script web app in the Apps Script editor for changes to take effect: create a new version and update the deployment.

Testing
- For initial tests, temporarily allow access to "Anyone, even anonymous" and use `curl` or Postman to POST to the exec URL.
- When testing from the installed PWA on your phone, deploy with domain access and ensure you are signed into the school account in Chrome.

Notes
- The code uses `Session.getActiveUser().getEmail()` for authorization; this requires domain deployment and that the browser includes Google cookies.
- The `doGet` endpoint returns JSON and supports `?tag=`, `?status=`, `?limit=`, and `?id=`.
- The `doPost` endpoint supports `action=create` (default), `action=update`, and `action=delete`.

Security
- Prefer domain-auth deployment. If not possible, use "Execute as: Me" and require a shared secret token (pass securely and do not commit it).

Troubleshooting
- If direct Share -> Apps Script POSTs fail, use the PWA fallback that posts to a local `/share` receiver; the service worker will forward the payload to the Apps Script endpoint.

End of file.
