'use client';
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import api from "@/utils/api";

const OpinionCreate = () => {
  const { id } = useParams(); // ✅ get id for edit
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await api.get("/admin/editors");
        setAuthors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch authors", err);
      }
    };
    fetchAuthors();
  }, []);

  // Fetch opinion data if editing
  useEffect(() => {
    if (!id) return;
    const fetchOpinion = async () => {
      try {
        const res = await api.get(`/opinions/${id}`);
        setTitle(res.data.title);
        setSlug(res.data.slug);
        setContent(res.data.content);
        setAuthor(res.data.author?._id || '');
        setImage(null);
      } catch (err) {
        toast.error("Failed to load opinion for editing");
      }
    };
    fetchOpinion();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !slug || !content || !author) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("content", content);
      formData.append("author", author);
      if (image) formData.append("image", image);

      if (id) {
        await api.put(`/opinions/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Opinion updated successfully");
      } else {
        await api.post("/opinions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Opinion created successfully");
      }

      // Reset form
      setTitle(""); setSlug(""); setContent(""); setAuthor(""); setImage(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save opinion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{id ? "Edit Opinion" : "Create New Opinion"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <input type="text" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full border px-3 py-2 rounded h-32" required />
        <select value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border px-3 py-2 rounded" required>
          <option value="">Select Author</option>
          {authors.map((auth) => (
            <option key={auth._id} value={auth._id}>{auth.name} ({auth.email})</option>
          ))}
        </select>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full" />
        <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? (id ? "Updating..." : "Creating...") : (id ? "Update Opinion" : "Create Opinion")}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default OpinionCreate;
