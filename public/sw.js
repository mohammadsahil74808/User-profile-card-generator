/**
 * Service Worker: Offline & GitHub Pages API Interceptor
 * Intercepts POST /api/profile when hosted statically on GitHub Pages.
 */

importScripts('./js/processor.js');

const CACHE_NAME = 'card-generator-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept POST /api/profile on static hosts
  if (url.pathname.endsWith('/api/profile') && event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const body = await event.request.json();
          const result = self.CardProcessor.processProfileData(body, {
            processedBy: 'Service Worker Network Interceptor (GitHub Pages)'
          });

          return new Response(JSON.stringify(result), {
            status: result.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Powered-By': 'GitHub-Pages-Service-Worker'
            }
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              success: false,
              status: 400,
              error: 'Bad Request',
              message: 'Invalid JSON request payload'
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
  }
});

