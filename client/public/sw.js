/* global self */
self.addEventListener("install", (e) => {
  self.skipWaiting(); // fast activate
});

self.addEventListener("activate", (e) => {
  // cleanup, migrate, etc
});

// Push payload: { title, body, icon, badge, url, tag }
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch (_) {}

  const title = data.title || "New Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo.png",
    badge: data.badge || "/badge.png",
    data: { url: data.url || "/", _raw: data },
    tag: data.tag || undefined,
    renotify: !!data.tag, // same tag => re-notify
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    (async () => {
      // focus existing tab or open new
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const match = allClients.find((c) => c.url.includes(new URL(url, self.location.origin).pathname));
      if (match) {
        match.focus();
        match.navigate(url);
      } else {
        clients.openWindow(url);
      }
    })()
  );
});
