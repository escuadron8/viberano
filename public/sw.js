// Service worker mínimo (T-23): no cachea nada todavía — su único trabajo es
// existir y activarse, que es lo que Chrome/Android exige para ofrecer
// "Añadir a pantalla de inicio". El offline real queda fuera del alcance.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sin estrategia de caché: deja pasar la petición tal cual.
});
