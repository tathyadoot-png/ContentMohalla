import api from "./api";

export const getVapidKey = () => api.get("/guests/vapidPublicKey");

export const registerGuest = (data) => api.post("/guests", data);

export const getGuestById = (id) => api.get(`/guests/${id}`);

export const subscribeGuest = (id, data) =>
  api.post(`/guests/subscribe/${id}`, data);

export const unsubscribeGuest = (id) =>
  api.post(`/guests/unsubscribe/${id}`);

export const getActiveGuest = (id) => api.get(`/guests/active/${id}`);
