import api from "@/utils/api";

// ✅ Get all opinions
export const fetchAllOpinions = async () => {
  const { data } = await api.get("/opinions");
  return data;
};

// ✅ Get opinion by slug
export const fetchOpinionBySlug = async (slug) => {
  const { data } = await api.get(`/opinions/slug/${slug}`);
  return data;
};

// ✅ Add comment
export const addOpinionComment = async (slug, commentData) => {
  const { data } = await api.post(`/opinions/${slug}/comments`, commentData);
  return data;
};
