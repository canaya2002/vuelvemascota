/* VuelveaCasa · Service Worker mínimo.
 * - Cachea estáticos de /generales, /videos y /_next/static.
 * - Fallback offline a /.
 * - Sin Workbox para mantenerlo simple y auditable.
 */
const CACHE = "vc-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/icon.png",
  "/apple-touch-icon.png",
  "/site.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let data = { title: "VuelveaCasa", body: "Tienes una alerta nueva", url: "/casos" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    }
  } catch {
    /* payload sin JSON — usamos defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      data: { url: data.url },
      lang: "es-MX",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.postMessage({ type: "navigate", url: url });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // No intercept cross-origin ni API.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/panel")) return;

  // Cache-first para assets de /_next/static, /generales, /videos.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/generales/") ||
    url.pathname.startsWith("/videos/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/icon.png";

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              if (res.status === 200) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
              }
              return res;
            })
            .catch(() => cached)
      )
    );
    return;
  }

  // Network-first para HTML con fallback al home cacheado.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("/").then((cached) => cached || Response.error())
      )
    );
  }
});
