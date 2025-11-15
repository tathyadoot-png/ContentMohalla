"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaLink, FaMusic } from "react-icons/fa";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function MediaList() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest or oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const perPage = 5;

  useEffect(() => {
    fetchMedia();
  }, [search, sortOrder, currentPage]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news/media", {
        params: { search, sort: sortOrder, page: currentPage, limit: perPage },
      });
      setMediaList(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("⚠️ Are you sure you want to delete this media?")) return;
    try {
      await api.delete(`/news/media/${id}`);
      alert("🗑️ Media deleted successfully!");
      fetchMedia();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete media");
    }
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/media/create?page=edit&id=${id}`);
  };

  const handleCreate = () => {
    router.push(`/dashboard/media/create`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Media List</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
        >
          + Create Media
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-custom rounded-lg w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border border-custom rounded-lg w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Media Table */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : mediaList.length === 0 ? (
        <p className="text-center text-gray-500">No media found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-custom rounded-lg bg-card">
            <thead className="bg-muted text-primary">
              <tr>
                <th className="border border-custom px-4 py-2">S.No</th>
                <th className="border border-custom px-4 py-2">Title</th>
                <th className="border border-custom px-4 py-2">Slug</th>
                <th className="border border-custom px-4 py-2">Type</th>
                <th className="border border-custom px-4 py-2">URL/File</th>
                <th className="border border-custom px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((m, index) => (
                <tr key={m._id} className="hover:bg-secondary transition-colors">
                  <td className="border border-custom px-4 py-2">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
                  <td className="border border-custom px-4 py-2">{m.title}</td>
                  <td className="border border-custom px-4 py-2">{m.slug}</td>
                  <td className="border border-custom px-4 py-2">{m.type}</td>
                  <td className="border border-custom px-4 py-2 break-all">
                    {m.type === "video" ? (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        <FaLink className="inline mr-1" />
                        Link
                      </a>
                    ) : (
                      <audio controls src={m.url} className="w-full" />
                    )}
                  </td>
                  <td className="border border-custom px-4 py-2 flex justify-center gap-4">
                    <button
                      onClick={() => handleEdit(m._id)}
                      className="text-blue-500 hover:text-blue-700 text-lg"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-500 hover:text-red-700 text-lg"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="px-3 py-1 border rounded-lg bg-muted hover:bg-gray-200"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-lg ${
                  currentPage === i + 1
                    ? "bg-accent text-white"
                    : "bg-muted hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              className="px-3 py-1 border rounded-lg bg-muted hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
