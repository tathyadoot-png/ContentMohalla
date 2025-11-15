"use client";
export const dynamic = "force-dynamic"; 
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaHeading, FaUser, FaTag, FaFolder, FaImage, FaFileImage } from "react-icons/fa";
import EditorWrapper from "@/components/EditorWrapper";
import EditorRender from "@/components/EditorRender";
import api from "@/utils/api";
import React from "react";

// ✅ Memoized InputWrapper
const InputWrapper = React.memo(function InputWrapper({ icon, children }) {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded border border-border">
      <span className="text-accent">{icon}</span>
      {children}
    </div>
  );
});

export default function CreateBlogPage() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const isEdit = searchParams.get("page") === "edit";

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    authorName: "",
    category: "",
    tags: [],
    authorImage: null,
    thumbnail: null,
  });

  const [content, setContent] = useState(null);

  // ✅ Fetch blog data if edit mode
  useEffect(() => {
    if (isEdit && blogId) {
      const fetchBlog = async () => {
        try {
          const res = await api.get(`/news/blogs/${blogId}`);
          const blog = res.data;

          setFormData({
            title: blog.title || "",
            slug: blog.slug || "",
            authorName: blog.authorName || "",
            category: blog.category || "",
            tags: blog.tags || [],
            authorImage: null, // file inputs cannot be prefilled
            thumbnail: null,
          });

          setContent(blog.content || null);
        } catch (err) {
          console.error(err);
          alert("Failed to load blog data for editing");
        }
      };
      fetchBlog();
    }
  }, [isEdit, blogId]);

  // ✅ Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "tags") {
        return { ...prev, tags: value.split(",").map((t) => t.trim()) };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleFileChange = useCallback((e, field) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.files[0] }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("authorName", formData.authorName);
      data.append("category", formData.category);
      data.append("tags", formData.tags.join(","));
      data.append("content", JSON.stringify(content));
      if (formData.authorImage) data.append("authorImage", formData.authorImage);
      if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);

      if (isEdit && blogId) {
        await api.put(`/news/blogs/${blogId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Blog updated successfully!");
      } else {
        await api.post("/news/blogs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Blog created successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving blog");
    }
  }, [formData, content, isEdit, blogId]);

  return (
    <div className="p-6 mx-auto space-y-6 max-w-6xl">
      <h1 className="text-4xl font-bold text-primary">{isEdit ? "Edit Blog" : "Create Blog"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Slug */}
        <div className="bg-card p-4 rounded shadow border border-border space-y-2">
          <InputWrapper icon={<FaHeading />}>
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none"
              required
            />
          </InputWrapper>
          <InputWrapper icon={<FaFolder />}>
            <input
              type="text"
              placeholder="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none"
              required
            />
          </InputWrapper>
        </div>

        {/* Author & Thumbnail */}
        <div className="bg-card p-4 rounded shadow border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWrapper icon={<FaUser />}>
            <input
              type="text"
              placeholder="Author Name"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none"
              required
            />
          </InputWrapper>
          <InputWrapper icon={<FaFileImage />}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "authorImage")}
              className="w-full bg-transparent focus:outline-none"
            />
          </InputWrapper>
          <InputWrapper icon={<FaImage />}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "thumbnail")}
              className="w-full bg-transparent focus:outline-none"
            />
          </InputWrapper>
          <InputWrapper icon={<FaFolder />}>
            <input
              type="text"
              placeholder="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none"
            />
          </InputWrapper>
        </div>

        {/* Tags */}
        <InputWrapper icon={<FaTag />}>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            name="tags"
            value={formData.tags.join(",")}
            onChange={handleChange}
            className="w-full bg-transparent focus:outline-none"
          />
        </InputWrapper>

        {/* Editor */}
        <div className="bg-card p-4 rounded shadow border border-border">
          <EditorWrapper onChange={setContent}  initialContent={content}/>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-card font-semibold rounded hover-accent transition"
        >
          {isEdit ? "Update Blog" : "Publish Blog"}
        </button>
      </form>

      {/* Preview */}
      {content && (
        <div className="mt-6 bg-card p-4 rounded shadow border border-border">
          <h2 className="text-2xl font-semibold text-primary mb-2 flex items-center gap-2">
            Preview
          </h2>
          <EditorRender content={content} />
        </div>
      )}
    </div>
  );
}
