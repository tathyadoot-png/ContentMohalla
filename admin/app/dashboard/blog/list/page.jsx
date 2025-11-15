"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "@/utils/api";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest or oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const perPage = 5;

  useEffect(() => {
    fetchBlogs();
  }, [search, sortOrder, currentPage]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news/blogs", {
        params: { search, sort: sortOrder, page: currentPage, limit: perPage },
      });
      setBlogs(res.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ Are you sure you want to delete this blog?")) {
      try {
        await api.delete(`/news/blogs/${id}`);
        alert("🗑️ Blog deleted successfully!");
        fetchBlogs();
      } catch (err) {
        console.error(err);
        alert("❌ Failed to delete blog");
      }
    }
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/blog/create?page=edit&id=${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Blog List</h1>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search blogs..."
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

      {/* Blog Table */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-500">No blogs found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-custom rounded-lg bg-card">
            <thead className="bg-muted text-primary">
              <tr>
                <th className="border border-custom px-4 py-2">S.No</th>
                <th className="border border-custom px-4 py-2">Title</th>
                <th className="border border-custom px-4 py-2">Slug</th>
                <th className="border border-custom px-4 py-2">Author</th>
                <th className="border border-custom px-4 py-2">Category</th>
                <th className="border border-custom px-4 py-2">Tags</th>
                <th className="border border-custom px-4 py-2">Body</th>
                <th className="border border-custom px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => (
                <tr
                  key={blog._id}
                  className="hover:bg-secondary transition-colors"
                >
                  <td className="border border-custom px-4 py-2">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {blog.title}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {blog.slug}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {blog.authorName}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {blog.category}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {blog.tags?.join(", ")}
                  </td>
                  <td className="border border-custom px-4 py-2">
                    {(() => {
                      if (!blog.content || !blog.content.blocks) return "";
                      return (
                        blog.content.blocks
                          .map((block) => {
                            if (
                              block.type === "paragraph" ||
                              block.type === "header"
                            ) {
                              return block.data?.text || "";
                            }
                            if (block.type === "list") {
                              return (block.data?.items || []).join(" ");
                            }
                            return "";
                          })
                          .join(" ")
                          .slice(0, 100) + "..."
                      );
                    })()}
                  </td>

                  <td className="border border-custom px-4 py-2 flex justify-center gap-4">
                    <button
                      onClick={() => handleEdit(blog._id)}
                      className="text-blue-500 hover:text-blue-700 text-lg"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
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
