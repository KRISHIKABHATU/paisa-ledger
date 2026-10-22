/* © 2026 krishikabhatu2018. Paisa Ledger. All rights reserved. */

// Bump this name on every release so phones fetch the new files.
const CACHE = "paisa-ledger-v15";

const FILES = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./portfolio.js",
  "./xlsx.full.min.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Install: pre-cache the app files.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// Activate: delete caches from older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

// Fetch: network first, keep a fresh copy of same-origin files, fall back to cache when offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match("./index.html"))),
  );
});
