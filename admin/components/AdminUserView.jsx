// components/admin/AdminUsersList.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import api from "@/utils/api"; // ✅ axios instance withCredentials: true
import { FiSearch, FiEye, FiX } from "react-icons/fi";

const ACCENT = "text-[#B83D43]";
const ACCENT_BG = "bg-[#FBE7E7]"; // soft red background for badges/cards

const roleColor = (role) => {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "editor":
      return "bg-amber-100 text-amber-800";
    case "moderator":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-green-100 text-green-800";
  }
};

const AdminUsersList = ({ apiBase = "" }) => {
  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_URL || "";
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const debounceRef = useRef(null);

  // modal state
  const [selectedUser, setSelectedUser] = useState(null);

  // debounce search -> update q
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(search.trim());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // helper sort newest-first
  const sortNewestFirst = (arr = []) => {
    return arr.slice().sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  };

  // fetch users
  const fetchUsers = async (page = 1, limit = meta.limit, query = q) => {
    setLoading(true);
    setError("");
    try {
      // verify admin session using server-side httpOnly cookie (axios instance will send cookie automatically)
      try {
        await api.get("/auth/me");
      } catch (verifyErr) {
        setUsers([]);
        setLoading(false);
        setError("Admin session not found. Please login as admin.");
        return;
      }

      const params = {
        page,
        limit,
      };
      if (query) params.search = query;

      // use axios instance (baseURL + withCredentials are configured in "@/utils/api")
      const res = await api.get("/admin/users", { params });

      const body = res.data || {};

      const fetched = body.users || [];
      // ensure newest users appear on top
      const sorted = sortNewestFirst(fetched);
      setUsers(sorted);
      setMeta(body.meta || { total: 0, page, totalPages: 1, limit });
    } catch (err) {
      console.error("fetchUsers error:", err);
      const errMsg = err?.response?.data?.message || err.message || "Failed to load users";
      setError(errMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch on mount
  useEffect(() => {
    fetchUsers(meta.page, meta.limit, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when query changes (search)
  useEffect(() => {
    // reset to first page when new query applied
    fetchUsers(1, meta.limit, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // helper to navigate pages
  const gotoPage = (p) => {
    const next = Math.max(1, Math.min(meta.totalPages || 1, p));
    setMeta((m) => ({ ...m, page: next }));
    fetchUsers(next, meta.limit, q);
  };

  // change page size
  const changeLimit = (newLimit) => {
    setMeta((m) => ({ ...m, limit: newLimit, page: 1 }));
    fetchUsers(1, newLimit, q);
  };

  // open modal
  const openUser = (u) => setSelectedUser(u);
  const closeUser = () => setSelectedUser(null);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <h2 className={`text-lg font-bold ${ACCENT}`}>All Users</h2>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, pen, email, uid..."
              className="pl-10 pr-3 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#FAD0D0]"
              aria-label="Search users"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            value={meta.limit}
            onChange={(e) => changeLimit(parseInt(e.target.value, 10))}
            className="border rounded-md p-2"
            aria-label="Users per page"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading users…</div>
      ) : error ? (
        <div className="py-6 text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">UID</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.uniqueId} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-3 py-3 flex items-center gap-3 min-w-[200px]">
                      <div className={`w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border ${u.isNew ? "ring-2 ring-[#FAD0D0]" : ""}`}>
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatar}
                            alt={u.fullName || u.penName || "User"}
                            width={40}
                            height={40}
                            style={{ objectFit: "cover", width: "40px", height: "40px" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                            {(u.fullName || u.penName || "—").charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate max-w-[220px]">{u.fullName || u.penName || "—"}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[220px]">
                          {u.penName ? `Pen: ${u.penName}` : ""}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-sm text-gray-700 max-w-[220px]">
                      <div className="truncate max-w-[220px]" title={u.email}>
                        {u.email || "—"}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${roleColor(u.role)}`}>
                        {u.role || "user"}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-sm font-mono text-gray-700 max-w-[160px]">
                      <div className="truncate max-w-[160px]" title={u.uniqueId}>
                        {u.uniqueId || "—"}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-sm text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>

                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUser(u)}
                          aria-label={`View ${u.fullName || u.penName || "user"}`}
                          title="View user"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#B83D43] text-white hover:bg-[#9c2f35] shadow-sm focus:ring-2 focus:ring-[#FAD0D0]"
                        >
                          <FiEye />
                        </button>

                        {/* secondary quick link to user's public profile (if exists) */}
                        {u.publicUrl && (
                          <a href={u.publicUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 border rounded text-xs text-gray-700 hover:bg-gray-50">
                            Open
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing page {meta.page} of {meta.totalPages} — {meta.total} users
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => gotoPage(1)} disabled={meta.page <= 1 || loading} className="px-3 py-1 border rounded disabled:opacity-50">
                First
              </button>
              <button onClick={() => gotoPage(meta.page - 1)} disabled={meta.page <= 1 || loading} className="px-3 py-1 border rounded disabled:opacity-50">
                Prev
              </button>
              <button onClick={() => gotoPage(meta.page + 1)} disabled={meta.page >= meta.totalPages || loading} className="px-3 py-1 border rounded disabled:opacity-50">
                Next
              </button>
              <button onClick={() => gotoPage(meta.totalPages)} disabled={meta.page >= meta.totalPages || loading} className="px-3 py-1 border rounded disabled:opacity-50">
                Last
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={closeUser} />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedUser.fullName || selectedUser.penName || "User"}</h3>
              <button onClick={closeUser} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
                <FiX />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center md:items-start md:col-span-1">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
                  {selectedUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedUser.avatar} alt={selectedUser.fullName || selectedUser.penName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">
                      {(selectedUser.fullName || selectedUser.penName || "U").charAt(0)}
                    </div>
                  )}
                </div>

                <div className={`mt-3 inline-flex items-center px-3 py-1 text-sm font-medium rounded ${roleColor(selectedUser.role)}`}>
                  {selectedUser.role || "user"}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <div><strong>UID:</strong> <span className="font-mono">{selectedUser.uniqueId || "—"}</span></div>
                  <div className="mt-2"><strong>Joined:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"}</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm text-gray-700 mb-2"><strong>Pen name:</strong> {selectedUser.penName || "—"}</div>
                <div className="text-sm text-gray-700 mb-2"><strong>Email:</strong> {selectedUser.email || "—"}</div>
                <div className="text-sm text-gray-700 mb-2"><strong>Bio:</strong> {selectedUser.bio || "No bio provided."}</div>

                {/* Additional metadata table */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div><strong>Posts:</strong> {selectedUser.postsCount ?? "—"}</div>
                  <div><strong>Bookmarks:</strong> {selectedUser.bookmarksCount ?? "—"}</div>
                  <div><strong>Last login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "—"}</div>
                  <div><strong>Verified:</strong> {selectedUser.isVerified ? "Yes" : "No"}</div>
                </div>

                <div className="mt-6 flex gap-3">
                  {/* Example admin action buttons (implement actual APIs if you want) */}
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">Deactivate</button>
                  <button className="px-4 py-2 border rounded">Send message</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={closeUser} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;
