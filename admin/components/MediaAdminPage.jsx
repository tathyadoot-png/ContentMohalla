"use client";

export const dynamic = "force-dynamic"; 
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaHeading,
  FaFolder,
  FaLink,
  FaMusic,
  FaVideo,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import api from "@/utils/api";

// Memoized InputWrapper
const InputWrapper = React.memo(({ icon, children }) => (
  <div className="flex items-center gap-2 bg-muted p-2 rounded border border-border">
    <span className="text-accent">{icon}</span>
    {children}
  </div>
));

export default function MediaAdminPage() {
  const searchParams = useSearchParams();
  const mediaId = searchParams.get("id");
  const isEdit = searchParams.get("page") === "edit";

  // ✅ Fully initialized formData to avoid undefined
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    type: "video",
    url: "",
    file: null,
  });

  const [mediaList, setMediaList] = useState([]);

  // Fetch single media if editing
  useEffect(() => {
    if (isEdit && mediaId) {
      api
        .get(`/news/media/${mediaId}`)
        .then((res) => {
          const media = res.data;
          setFormData({
            title: media.title || "",
            slug: media.slug || "",
            type: media.type || "video",
            url: media.url || "",
            file: null,
          });
        })
        .catch(console.error);
    }
  }, [isEdit, mediaId]);

  // Fetch all media
  const fetchMediaList = useCallback(() => {
    api
      .get("/news/media")
      .then((res) => setMediaList(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchMediaList();
  }, [fetchMediaList]);

  // Input change handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  }, []);

  // Handle media type switch safely
  const handleTypeChange = useCallback((e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      url: newType === "video" ? prev.url || "" : "",
      file: null,
    }));
  }, []);

  // Form submit
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("type", formData.type);

      if (formData.type === "video") data.append("url", formData.url);
      if (formData.type === "audio" && formData.file)
        data.append("audio", formData.file);

      const request =
        isEdit && mediaId
          ? api.put(`/news/media/${mediaId}`, data, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : api.post("/news/media", data, {
              headers: { "Content-Type": "multipart/form-data" },
            });

      request
        .then(() => {
          alert(isEdit ? "Media updated!" : "Media created!");
          setFormData({ title: "", slug: "", type: "video", url: "", file: null });
          fetchMediaList();
        })
        .catch((err) => {
          console.error(err);
          alert("Error saving media");
        });
    },
    [formData, isEdit, mediaId, fetchMediaList]
  );

  // Delete media
  const handleDelete = useCallback(
    (id) => {
      if (!confirm("Are you sure you want to delete this media?")) return;
      api
        .delete(`/news/media/${id}`)
        .then(() => {
          alert("Media deleted!");
          fetchMediaList();
        })
        .catch(console.error);
    },
    [fetchMediaList]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-primary">
        {isEdit ? "Edit Media" : "Create Media"}
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card p-4 rounded shadow border border-border"
      >
        <InputWrapper icon={<FaHeading />}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full bg-transparent focus:outline-none"
          />
        </InputWrapper>

        <InputWrapper icon={<FaFolder />}>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Slug"
            required
            className="w-full bg-transparent focus:outline-none"
          />
        </InputWrapper>

        <div className="mb-2">
          <label className="block font-semibold text-primary mb-1">Media Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            className="w-full p-2 border border-border rounded bg-muted"
          >
            <option value="video">Video (YouTube link)</option>
            <option value="audio">Audio (Upload file)</option>
          </select>
        </div>

        {formData.type === "video" ? (
          <InputWrapper icon={<FaLink />}>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="YouTube URL"
              required
              className="w-full bg-transparent focus:outline-none"
            />
          </InputWrapper>
        ) : (
          <InputWrapper icon={<FaMusic />}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              required={!isEdit} // only required if creating new
              className="w-full"
            />
          </InputWrapper>
        )}

        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-card font-semibold rounded hover-accent transition"
        >
          {isEdit ? "Update Media" : "Publish Media"}
        </button>
      </form>

      {/* Media List */}
      <div className="space-y-2 mt-6">
        <h2 className="text-2xl font-bold text-primary mb-2">All Media</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-border rounded">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Slug</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">URL/File</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((m) => (
                <tr key={m._id}>
                  <td className="p-2 border">{m.title}</td>
                  <td className="p-2 border">{m.slug}</td>
                  <td className="p-2 border">{m.type}</td>
                  <td className="p-2 border break-all">{m.url}</td>
                  <td className="p-2 border flex gap-2">
                    <a href={`?id=${m._id}&page=edit`} className="text-blue-500">
                      <FaEdit />
                    </a>
                    <button onClick={() => handleDelete(m._id)} className="text-red-500">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {mediaList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-2">
                    No media found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
