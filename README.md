# recommended-content-list
Simple web app that allows for teacher-to-student sharing of course relevant content.

This is a bare minimum Progressive Web App (PWA) that allows users to share content from their mobile devices using the Web Share API.

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

To run the PWA locally, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd pwa-share-app
   ```

2. Open the `src/index.html` file in a web browser. For best results, use a local server to serve the files.

3. Ensure that your browser supports the Web Share API and that you are testing on a mobile device or an emulator.

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