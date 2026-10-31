import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Automated PWA & Service Worker live auto-updater (Zero manual refresh needed)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let isRefreshing = false;

  // Auto-reload immediately when a new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      window.location.reload();
    }
  });

  // Listen to broadcast messages from sw.js
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      if (!isRefreshing) {
        isRefreshing = true;
        window.location.reload();
      }
    }
  });

  // Check for updates periodically in the background
  navigator.serviceWorker.ready.then((registration) => {
    // Check every 25 seconds
    setInterval(() => {
      registration.update().catch(() => {});
    }, 25000);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version installed: skip waiting and activate immediately
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      }
    });
  }).catch(() => {});
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
