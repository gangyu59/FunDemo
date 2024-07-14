const CACHE_NAME = 'fun-demos-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/static/js/main.js',
    '/static/js/fractal.js',
    '/static/js/galaxy.js',
    '/static/js/audioVisualizer.js',
    '/static/js/generativeArt.js',
    '/static/js/neuralNetwork.js',
    '/static/js/weatherEffects.js',
    '/static/js/physicsSandbox.js',
    '/static/js/terrainGeneration.js',
    '/static/js/aquarium.js',
    '/static/js/storybook.js',
    '/image/image1.heic',
    '/image/image2.heic',
    '/image/image3.heic',
    '/image/image4.heic'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});