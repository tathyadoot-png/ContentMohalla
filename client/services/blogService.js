import api from "@/utils/api";

// ✅ Get all blogs
export const fetchAllBlogs = async () => {
  const { data } = await api.get("/blogs");
  return data;
};

// ✅ Get blog by ID
export const fetchBlogById = async (id) => {
  const { data } = await api.get(`/blogs/${id}`);
  return data;
};

// ✅ Get blog by slug & type
export const fetchBlogBySlug = async (type, slug) => {
  const { data } = await api.get(`/blogs/${type}/${slug}`);
  return data;
};
