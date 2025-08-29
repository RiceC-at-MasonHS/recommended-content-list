# recommended-content-list
Simple web app that allows for teacher-to-student sharing of course relevant content.

This is a bare minimum Progressive Web App (PWA) that allows Teachers to share content from their mobile devices using the Web Share API. 

## Project Structure

```
recommended-content-list
├── src
│   ├── index.html       # Main HTML document for the PWA
│   ├── styles.css       # Styles for the application
│   └── app.js           # JavaScript code for functionality
├── manifest.json        # Web app manifest for metadata
├── service-worker.js     # Service worker for offline capabilities
└── README.md            # Project documentation
```

## Getting Started

This PWA has been modified to be run from GitHub Pages.
(That means some of the URLs for accessing favicons & js files are relative to the repo subpath.)

CI / Deployment (safe secret handling)
------------------------------------
This repository uses a `manifest.template.json` and a GitHub Actions workflow to inject the real Apps Script web app URL at build time. That keeps the Apps Script URL secret out of `main`.

Quick steps to enable CI deploy:
1. In your repository settings on GitHub, go to **Settings > Secrets and variables > Actions** and add a new repository secret named `APPS_SCRIPT_WEB_APP_URL` with the full Apps Script `exec` URL.
2. Push to `main`. The workflow at `.github/workflows/deploy.yml` will generate `manifest.json` from `manifest.template.json` and deploy the built repo to the `gh-pages` branch.
3. After Pages publishes the `gh-pages` branch, open the GitHub Pages URL and verify the app installs correctly.

If you prefer to test locally, copy `.env.example` to `.env` and populate `APPS_SCRIPT_WEB_APP_URL` with your Apps Script exec URL. Local testing will still use the placeholder manifest; CI replaces it for production.

## Features

- Basic layout and styling
- Share functionality using the Web Share API
- Offline capabilities through service worker

## Future Enhancements

- Add more features and content
- Improve styling and user experience
- Implement additional caching strategies in the service worker

## License

This project is licensed under the MIT License.