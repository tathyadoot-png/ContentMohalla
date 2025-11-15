// ✅ STEP 1: 'axios' ki jagah apne 'api' instance ko import karein
// Yeh maana ja raha hai ki aapki api.js file utils folder ke andar hai.
// Agar kahin aur hai toh path theek kar lein.
import api from "./api.js"; 

const backendURL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Register a new guest
 */
export async function registerGuest(formData) {
  try {
    const res = await api.post(`/guests`, formData);
    return res.data;
  } catch (err) {
    console.error("registerGuest error:", err);
    throw err;
  }
}

/**
 * Subscribe push notifications
 */
export async function subscribePush(guestId, pushSubscription, tags = []) {
  try {
    if (!guestId || !pushSubscription) throw new Error("Guest ID or subscription missing");
    
    // ✅ STEP 2: Yahan bhi 'api.post' use karein
    const res = await api.post(`/guests/subscribe/${guestId}`, {
      subscription: pushSubscription,
      tags,
    });
    return res.data.subscription;
  } catch (err) {
    console.error("subscribePush error:", err);
    throw err;
  }
}

/**
 * Unsubscribe push notifications
 */
export async function unsubscribePush(guestId) {
  try {
    if (!guestId) throw new Error("Guest ID missing");
    
    // ✅ STEP 2: Yahan bhi 'api.post' use karein
    const res = await api.post(`/guests/unsubscribe/${guestId}`);
    return res.data.ok;
  } catch (err) {
    console.error("unsubscribePush error:", err);
    throw err;
  }
}

/**
 * Get active guest by ID
 */
export async function getActiveGuest(guestId) {
  try {
    if (!guestId) throw new Error("Guest ID required");

    // ✅ STEP 2: Yahan 'api.get' use karein
    const res = await api.get(`/guests/active/${guestId}`);
    
    console.log("getActiveGuest response:", res.data);
    return res.data;
  } catch (err) {
    console.error("getActiveGuest error:", err);
    return null;
  }
}