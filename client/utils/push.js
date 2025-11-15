const backendURL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_VAPID_PUBLIC_KEY = process.env.NEXT_VAPID_PUBLIC_KEY;

/**
 * Convert URL-safe base64 to Uint8Array
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) throw new Error("Service worker not supported");
  return await navigator.serviceWorker.register("/sw.js");
}

/**
 * Ask notification permission
 */
export async function askNotificationPermission() {
  if (!("Notification" in window)) throw new Error("Notifications not supported");
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
}

/**
 * Subscribe user to push notifications
 * guestId must be provided
 */
export async function subscribeUser(guestId, tags = []) {
  if (!guestId) throw new Error("Guest ID required for push subscription");

  try {
    const perm = await askNotificationPermission();
    if (perm !== "granted") throw new Error("Permission denied");

    const reg = await registerServiceWorker();
    const applicationServerKey = urlBase64ToUint8Array(NEXT_VAPID_PUBLIC_KEY);

    let sub = await reg.pushManager.getSubscription();

    // Agar pehle se subscription hai
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // Duplicate check - agar endpoint pehle se localStorage me same hai to skip
    const storedEndpoint = localStorage.getItem("pushEndpoint");
    if (storedEndpoint === sub.endpoint) {
      console.info("Already subscribed with same endpoint, skipping backend update.");
      return sub;
    }

    // Backend update
    await fetch(`${backendURL}/api/guest/subscribe/${guestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, tags }),
    });

    localStorage.setItem("pushEndpoint", sub.endpoint);
    return sub;
  } catch (err) {
    console.error("Failed to subscribe user:", err);
    throw err;
  }
}

/**
 * Unsubscribe user from push notifications
 * guestId must be provided
 */
export async function unsubscribeUser(guestId) {
  if (!guestId) throw new Error("Guest ID required to unsubscribe");

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();

      await fetch(`${backendURL}/api/guest/unsubscribe/${guestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      localStorage.removeItem("pushEndpoint");
    }
  } catch (err) {
    console.error("Failed to unsubscribe user:", err);
  }
}
