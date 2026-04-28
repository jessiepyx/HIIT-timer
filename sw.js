const CACHE_NAME = 'hiit-gifs-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if(url.includes('api.workoutxapp.com/v1/gifs/')){
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if(cached) return cached;
          return fetch(event.request).then(response => {
            if(response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  }
});
