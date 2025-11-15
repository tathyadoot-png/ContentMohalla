import api from "@/utils/api";

// ✅ Get all media
export const fetchAllMedia = async () => {
  const { data } = await api.get("/media");
  return data;
};

// ✅ Get all videos
export const fetchAllVideos = async () => {
  const { data } = await api.get("/video");
  return data;
};

// ✅ Get video by slug
export const fetchVideoBySlug = async (slug) => {
  const { data } = await api.get(`/video/slug/${slug}`);
  return data;
};



// ✅ Get all audios
export const fetchAllAudios = async () => {
  const { data } = await api.get("/audio");
  return data;
};

// ✅ Get audio by slug
export const fetchAudioBySlug = async (slug) => {
  const { data } = await api.get(`/audio/slug/${slug}`);
  return data;
};