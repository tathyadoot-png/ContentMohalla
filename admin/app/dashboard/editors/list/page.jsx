"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import api from "@/utils/api";

export default function EditorManager() {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filePreviews, setFilePreviews] = useState({}); // { editorId: fileObject }
  const itemsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/editors");
      setEditors(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching editors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/editors/${id}`);
        alert("🗑️ User deleted successfully!");
        fetchEditors();
      } catch (err) {
        console.error(err);
        alert("❌ Failed to delete user");
      }
    }
  };

  const handleEdit = (editorId) => {
    router.push(`/dashboard/editors/create?page=edit&id=${editorId}`);
  };

  const handleFileChange = (editorId, file) => {
    setFilePreviews((prev) => ({
      ...prev,
      [editorId]: file,
    }));
  };

  const filteredEditors = editors
    .filter((editor) =>
      editor.name.toLowerCase().includes(search.toLowerCase()) ||
      editor.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  const totalPages = Math.ceil(filteredEditors.length / itemsPerPage);
  const paginatedEditors = filteredEditors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSocialIcons = (links) => (
    <div className="flex gap-2">
      {links.twitter && <a href={links.twitter} target="_blank"><FaTwitter className="text-blue-400" /></a>}
      {links.linkedin && <a href={links.linkedin} target="_blank"><FaLinkedin className="text-blue-600" /></a>}
      {links.facebook && <a href={links.facebook} target="_blank"><FaFacebook className="text-blue-700" /></a>}
      {links.instagram && <a href={links.instagram} target="_blank"><FaInstagram className="text-pink-500" /></a>}
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-card border border-custom p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-primary">Editors List</h2>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-1/2"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : paginatedEditors.length === 0 ? (
          <p className="text-center text-gray-500">No editors found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-custom rounded-lg">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-2 border">S.No</th>
                  <th className="px-4 py-2 border">Avatar</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Bio</th>
                  <th className="px-4 py-2 border">Permissions</th>
                  <th className="px-4 py-2 border">Social</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEditors.map((editor, index) => (
                  <tr key={editor._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Avatar with preview */}
                    <td className="px-4 py-2 border">
                      {filePreviews[editor._id] ? (
                        <img
                          src={URL.createObjectURL(filePreviews[editor._id])}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : editor.avatarUrl ? (
                        <img
                          src={editor.avatarUrl}
                          alt={editor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}

                     
                    </td>

                    <td className="px-4 py-2 border">{editor.name}</td>
                    <td className="px-4 py-2 border">{editor.email}</td>
                    <td className="px-4 py-2 border capitalize">{editor.role}</td>
                    <td className="px-4 py-2 border">{editor.bio || "N/A"}</td>
                    <td className="px-4 py-2 border">
                      {Object.entries(editor.permissions)
                        .filter(([_, value]) => value)
                        .map(([perm]) => perm.replace("can", "").toLowerCase())
                        .join(", ")}
                    </td>
                    <td className="px-4 py-2 border">{renderSocialIcons(editor.socialLinks || {})}</td>
                    <td className="px-4 py-2 border flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(editor._id)}
                        className="text-blue-500 hover:text-blue-700 text-lg"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(editor._id)}
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
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
