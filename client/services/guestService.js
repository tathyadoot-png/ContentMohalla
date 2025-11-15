import api from "@/utils/api";

// ✅ Register guest
export const registerGuest = async (guestData) => {
  const { data } = await api.post("/guests", guestData);
  return data;
};

// ✅ Get active guest
export const getActiveGuest = async (id) => {
  const { data } = await api.get(`/guests/active/${id}`);
  return data;
};

// ✅ Subscribe to notifications
export const subscribeGuest = async (id, subscription) => {
  const { data } = await api.post(`/guests/subscribe/${id}`, { subscription });
  return data;
};
