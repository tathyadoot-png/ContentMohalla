import api from "@/utils/api";

// ================== SPECIAL QUERIES ==================

// Get news by slug (also increments views)
export const fetchNewsBySlug = async (slug) => {
  const { data } = await api.get(`/news/slug/${slug}`);
  return data;
};

// Get related news by slug
export const fetchRelatedNews = async (slug) => {
  const { data } = await api.get(`/news/related/${slug}`);
  return data;
};

// Get news by editor
export const fetchNewsByEditor = async (slug) => {
  const { data } = await api.get(`/news/editor-news/${slug}`);
  return data;
};


// Get all news
export const fetchAllNews = async (params = {}) => {
  const { data } = await api.get("/news", { params });
  return data;
};

// Get news by ID
export const fetchNewsById = async (id) => {
  const { data } = await api.get(`/news/${id}`);
  return data;
};


// ================== CATEGORY & SECTION ==================

// Fetch categories with count
export const fetchCategories = async () => {
  const { data } = await api.get("/news/categories/list");
  return data;
};

// Fetch news by category & section
export const fetchByCategoryAndSection = async (params = {}) => {
  const { data } = await api.get("/news/filter/category-section", { params });
  return data;
};


// ================== COMMENTS ==================

// Kept your original comment functions as requested
export const addComment = async (slugOrId, comment, userId) => {
  const res = await api.post(`/news/${slugOrId}/comments`, {
    comment,
    userId,
  });
  return res.data;
};

export const replyToComment = async (slugOrId, commentId, reply, userId) => {
  const res = await api.post(`/news/${slugOrId}/comments/${commentId}/reply`, {
    reply,
    userId,
  });
  return res.data;
};

// New, more efficient comment functions
export const fetchCommentsForNews = async (newsId) => {
  const { data } = await api.get(`/comments/news/${newsId}`);
  return data;
};

export const postComment = async (newsId, comment, parentCommentId = null) => {
  const { data } = await api.post(`/comments/news/${newsId}`, { comment, parentCommentId });
  return data;
};


// ================== ENGAGEMENT ==================
export const toggleLike = async (id) => {
  const { data } = await api.patch(`/news/${id}/like`);
  return data;
};

export const toggleBookmark = async (id) => {
  const { data } = await api.patch(`/news/${id}/bookmark`);
  return data;
};

export const shareNewsItem = async (id) => {
  const { data } = await api.patch(`/news/${id}/share`);
  return data;
};


// ================== TAGS ==================
export const fetchTags = async () => {
  const { data } = await api.get("/news/tags/list");
  return data;
};


// ================== PAGINATION ==================
export const fetchPaginatedNews = async (params = {}) => {
  const { data } = await api.get("/news/paginated/list", { params });
  return data;
};


// ================== SEARCH ==================
export const searchNews = async (query) => {
  const { data } = await api.get("/news/search/query", { params: { q: query } });
  return data;
};


// ================== TRENDING ==================
export const fetchTrendingNews = async () => {
  const { data } = await api.get("/news/trending/list");
  return data;
};


// ================== ANALYTICS ==================
export const fetchSummaryStats = async () => {
  const { data } = await api.get("/news/stats/summary");
  return data;
};


// ================== SEO ==================
export const fetchSitemap = async () => {
  const { data } = await api.get("/news/sitemap.xml");
  return data;
};