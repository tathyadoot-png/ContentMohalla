"use client";

import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function AddUser({ onCreated = null, onClose = null }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const [form, setForm] = useState({
    fullName: "",
    penName: "",
    email: "", // admin can optionally provide an email; if empty backend will generate uniqueId@gmail.com
    role: "user",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
  };

  const resetForm = () => {
    setForm({ fullName: "", penName: "", email: "", role: "user" });
    setAvatarFile(null);
    setAvatarPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      Swal.fire({ icon: "error", title: "Full name required", timer: 1400, showConfirmButton: false });
      return;
    }

    setLoading(true);
    try {
      const adminToken = Cookies.get("adminToken");
      if (!adminToken) {
        Swal.fire({ icon: "error", title: "Not authorized", text: "Admin token not found" });
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      if (form.penName?.trim()) fd.append("penName", form.penName.trim());
      if (form.email?.trim()) fd.append("email", form.email.trim().toLowerCase());
      fd.append("role", form.role);
      if (avatarFile) fd.append("avatar", avatarFile);

      // debug: optionally log entries (comment out in prod)
      // for (const pair of fd.entries()) console.log("fd:", pair[0], pair[1]);

      const res = await fetch(`${apiUrl}/api/auth/admin/create-user`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Server error:", data);
        throw new Error(data?.message || "Server error");
      }

      // Success UI
      Swal.fire({
        icon: "success",
        title: "User created",
        html: `
          <div style="text-align:left">
          
            <p><strong>Assigned Email:</strong> ${data.email}</p>
            <p><strong>Unique ID (password):</strong> ${data.uniqueId}</p>
            <p style="font-size:12px;color:#666;margin-top:8px;">⚠️ Share credentials securely with the user.</p>
          </div>
        `,
        confirmButtonText: "OK",
      });

      // expose returned info in UI if needed
      if (typeof onCreated === "function") onCreated(data);

      resetForm();
    } catch (err) {
      console.error("Create user error:", err);
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err.message || "Error creating user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#B83D43]">➕ Create User (Admin)</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-xl">✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          type="text"
          placeholder="Full name *"
          className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]"
          required
        />

        <input
          name="penName"
          value={form.penName}
          onChange={handleChange}
          type="text"
          placeholder="Pen name (optional)"
          className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email (optional — if left blank a generated email will be assigned)"
            className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="font-medium">Avatar (optional)</label>
            {avatarPreview && <img src={avatarPreview} alt="preview" className="w-28 h-28 object-cover rounded mb-2 border" />}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="block mt-1" />
          </div>

          <div className="sm:col-span-2 flex items-end justify-end space-x-3">
            {onClose && (
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ml-auto w-full sm:w-auto bg-[#B83D43] text-white py-3 px-6 rounded-md hover:bg-[#9c2f35] transition font-medium disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
