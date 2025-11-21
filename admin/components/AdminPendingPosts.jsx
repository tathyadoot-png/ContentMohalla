// AdminPendingPosts.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  List,
  Trash2,
  Eye,
} from "lucide-react";
import AdminPostForm from "../app/dashboard/post/page"; // ← use AdminPostForm for editing

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="w-8 h-8 text-[#B83D43] animate-spin" />
    <p className="ml-3 text-lg text-[#B83D43]">Loading data...</p>
  </div>
);

export default function AdminPendingPosts() {
  const [activeTab, setActiveTab] = useState("pending");
  const [posts, setPosts] = useState([]);
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPoemId, setEditingPoemId] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Fetch poems by status
  const fetchPoems = useCallback(async (status) => {
    try {
      setLoading(true);
      const token = Cookies.get("adminToken");
      const res = await fetch(`${apiUrl}/api/poems/admin/poems/${status}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data.poems) ? data.poems : []);
    } catch (err) {
      console.error("Error fetching poems:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch poems.",
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchPoems(activeTab);
  }, [activeTab, fetchPoems]);

  // Handle status change (approve/reject)
  const handleStatusChange = async (id, status) => {
    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(`${apiUrl}/api/poems/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      Swal.fire({
        icon: "success",
        title: data.message || `Post ${status} successfully!`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchPoems(activeTab);
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update status",
        text: "Server error occurred.",
      });
    }
  };

  // ✅ Delete poem handler
// ✅ Replace your existing handleDeletePoem with this corrected version
const handleDeletePoem = async (id) => {
  try {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the poem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#B83D43",
      cancelButtonColor: "#6b7280",
    });

    if (!isConfirmed) return;

    const token = Cookies.get("adminToken");
    const res = await fetch(`${apiUrl}/api/poems/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || "Delete failed");

    await Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: data.message || "Poem deleted successfully",
      timer: 1400,
      showConfirmButton: false,
    });

    // update UI
    setPosts((prev) => prev.filter((p) => p._id !== id));

    // if preview open for the same poem, close it
    if (selectedPoem?._id === id) {
      setSelectedPoem(null);
      setIsPreviewOpen(false);
    }
  } catch (err) {
    console.error("Delete error:", err);
    Swal.fire({
      icon: "error",
      title: "Delete failed",
      text: err.message || "Server error while deleting poem",
    });
  }
};


  // Preview handlers
  const handlePreview = (poem) => {
    setSelectedPoem(poem);
    setIsPreviewOpen(true);
  };
  const closePreview = () => {
    setSelectedPoem(null);
    setIsPreviewOpen(false);
  };

  // Edit handlers - open AdminPostForm in edit mode
  const handleEdit = (poem) => {
    setEditingPoemId(poem._id);
    setIsEditOpen(true);
    // close preview if open
    setIsPreviewOpen(false);
  };

  const closeEdit = () => {
    setEditingPoemId(null);
    setIsEditOpen(false);
  };

  // Callback when AdminPostForm finishes update/create
  const onFormUpdated = () => {
    fetchPoems(activeTab);
    closeEdit();
  };

  const getTabIcon = (tab) => {
    if (tab === "pending") return Clock;
    if (tab === "approved") return CheckCircle;
    if (tab === "rejected") return XCircle;
    return List;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-extrabold text-[#B83D43] mb-6 border-b-4 border-yellow-500/50 pb-2">
        <List className="inline-block w-7 h-7 mr-2 -mt-1" />
        Poem Submission Review Console
      </h1>

      {/* Tabs */}
      <div className="flex space-x-2 md:space-x-3 mb-8 p-1 bg-white rounded-xl shadow-lg">
        {["pending", "approved", "rejected"].map((tab) => {
          const Icon = getTabIcon(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-sm md:text-base rounded-lg font-semibold transition-all duration-300 
                ${
                  activeTab === tab
                    ? "bg-[#B83D43] text-white shadow-md shadow-[#e0ca96] scale-105"
                    : "text-[#e0ca96] hover:bg-[#f7efdc] hover:text-[#e0ca96]"
                }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-200">
        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-lg">
            <Trash2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No {activeTab} poems found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 divide-y divide-gray-200">
              <thead className="bg-[#B83D43] text-white sticky top-0">
                <tr>
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left hidden sm:table-cell">
                    Writer
                  </th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#f7efdc] transition">
                    <td className="py-3 px-6">
                      {p.image ? (
                        <img
                          src={p.image.url || p.image}
                          alt="poem"
                          className="w-12 h-12 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 font-medium text-[#B83D43]">
                      {p.title}
                    </td>
                    <td className="py-3 px-6 hidden sm:table-cell">
                      {p.writerId?.fullName || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </td>
                    <td className="py-3 px-6 flex flex-wrap gap-2">
                      <button
                        onClick={() => handlePreview(p)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </button>
                      {activeTab === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(p._id, "approved")}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(p._id, "rejected")}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {/* <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-3 py-1 rounded-full"
                      >
                        Edit
                      </button> */}

                      {/* Delete button (added) */}
                      <button
                        onClick={() => handleDeletePoem(p._id)}
                        className="bg-red-500 hover:bg-red-600 hover:text-white text-white text-xs px-3 py-1 rounded-full flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}

{isPreviewOpen && selectedPoem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] relative">
      {/* Close */}
      <button
        onClick={closePreview}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-[#B83D43]">
          Poem Details
        </h2>
        <div className="text-sm text-gray-600">
          {selectedPoem.status && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
              ${selectedPoem.status === "approved" ? "bg-green-100 text-green-800" :
                selectedPoem.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"}`}>
              {selectedPoem.status.charAt(0).toUpperCase() + selectedPoem.status.slice(1)}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top: image + meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex items-center justify-center">
            {selectedPoem.image?.url || selectedPoem.image ? (
              <img
                src={selectedPoem.image?.url || selectedPoem.image}
                alt={selectedPoem.title}
                className="w-full max-w-xs h-auto rounded-lg object-cover shadow"
              />
            ) : (
              <div className="w-full max-w-xs h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                
              </div>
            )}
          </div>

          <div className="col-span-2">
            <h3 className="text-2xl font-semibold text-[#B83D43]">{selectedPoem.title}</h3>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="text-sm text-gray-600">
                <strong>Writer:</strong>{" "}
                <span className="text-gray-800">{selectedPoem.writerId?.fullName || "Unknown"}</span>
              </div>

              {selectedPoem.languages && selectedPoem.languages.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedPoem.languages.map((lg, i) => (
                    <span
                      key={i}
                      className="bg-[#ffececec] text-[#B83D43] px-3 py-1 rounded-full text-sm font-medium border"
                    >
                      {lg.mainLanguage || lg.mainCategory || lg.mainLanguageName}{" "}
                      {lg.subLanguageName ? ` / ${lg.subLanguageName}` : ""}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-600">
                <strong>Category:</strong>{" "}
                <span className="text-gray-800">{selectedPoem.category?.name || selectedPoem.category || "—"}</span>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Subcategory:</strong>{" "}
                <span className="text-gray-800">{selectedPoem.subcategory?.name || selectedPoem.subcategory || "—"}</span>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Date:</strong>{" "}
                <span className="text-gray-800">
                  {selectedPoem.date
                    ? new Date(selectedPoem.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : selectedPoem.createdAt
                    ? new Date(selectedPoem.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Video link */}
            {selectedPoem.videoLink && (
              <div className="mt-4">
                <a
                  href={selectedPoem.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[#B83D43] underline hover:text-[#9c2f35]"
                >
                  ▶ Watch linked video
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="border rounded p-4 bg-gray-50 whitespace-pre-line text-gray-800">
          {selectedPoem.content}
        </div>

        {/* Media players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audio */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Audio</h4>
            {selectedPoem.audio?.url ? (
              <audio controls className="w-full">
                <source src={selectedPoem.audio.url} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="text-sm text-gray-500">No audio uploaded</div>
            )}
          </div>

          {/* Video */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Video</h4>
            {selectedPoem.video?.url ? (
              <video controls className="w-full rounded" style={{ maxHeight: 320 }}>
                <source src={selectedPoem.video.url} />
                Your browser does not support the video element.
              </video>
            ) : (
              <div className="text-sm text-gray-500">No video uploaded</div>
            )}
          </div>
        </div>

        {/* Writer / meta box */}
        <div className="border rounded p-4 bg-white/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {selectedPoem.writerId?.avatar ? (
                <img src={selectedPoem.writerId.avatar} alt="writer" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">{(selectedPoem.writerId?.fullName || "U").charAt(0)}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600">Author</div>
              <div className="font-medium text-gray-800">{selectedPoem.writerId?.fullName || "Unknown"}</div>
              <div className="text-sm text-gray-500">{selectedPoem.writerId?.penName || selectedPoem.writerId?.email || ""}</div>
            </div>
          </div>

          <div className="text-right text-sm text-gray-600">
            <div><strong>Likes:</strong> {selectedPoem.likeCount ?? 0}</div>
            <div><strong>Comments:</strong> {selectedPoem.commentCount ?? 0}</div>
            <div><strong>Bookmarks:</strong> {selectedPoem.bookmarkCount ?? 0}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { handleEdit(selectedPoem); }}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Edit
          </button>

          {/* Delete button inside preview (added) */}
          <button
            onClick={() => handleDeletePoem(selectedPoem._id)}
            className="px-4 py-2 bg-gray-200 hover:bg-red-500 hover:text-white text-red-600 rounded"
          >
            Delete
          </button>

          <button
            onClick={closePreview}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Edit Modal -> AdminPostForm */}
      {/* {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl">
            <AdminPostForm
              poemId={editingPoemId}
              onClose={closeEdit}
              onUpdated={onFormUpdated}
            />
          </div>
        </div>
      )} */}

      {isEditOpen && selectedPoem && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="relative bg-white w-[95%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={() => setIsEditOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
      >
        ✕
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[#B83D43] mb-4 text-center">
        ✏️ Edit Poem Details
      </h2>

      {/* Reuse the AdminPostForm */}
      <AdminPostForm
       poemId={editingPoemId}
              // onClose={closeEdit}
              // onUpdated={onFormUpdated}
        poemData={selectedPoem}  // ✅ pass poem data to prefill
        onClose={() => setIsEditOpen(false)}
        onUpdated={() => {
          fetchPoems(activeTab);
          setIsEditOpen(false);
          
        }}
      />
    </div>
  </div>
)}

    </div>
  );
}
