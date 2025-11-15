"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "@/utils/api";

export default function CreateUserPage() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const editorId = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
    bio: "",
    socialLinks: { twitter: "", linkedin: "", facebook: "", instagram: "" },
    permissions: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canView: true,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null); // file state

  useEffect(() => {
    if (page === "edit" && editorId) {
      api
        .get(`/admin/editors/${editorId}`)
        .then((res) => {
          setFormData({
            ...res.data,
            password: "",
            socialLinks: res.data.socialLinks || {},
            permissions: res.data.permissions,
          });
        })
        .catch((err) => console.error("Failed to fetch editor:", err));
    }
  }, [page, editorId]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (["canCreate", "canEdit", "canDelete", "canView"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        permissions: { ...prev.permissions, [name]: checked },
      }));
    } else if (
      ["twitter", "linkedin", "facebook", "instagram"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use FormData to send file
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "socialLinks" || key === "permissions") {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      });

      if (avatarFile) {
        payload.append("authorImage", avatarFile); // fieldname matches middleware
      }

      if (page === "edit" && editorId) {
        await api.patch(`/admin/editors/${editorId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Editor updated successfully!");
      } else {
        await api.post("/admin/create-editor", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ User created successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "editor",
          bio: "",
          socialLinks: { twitter: "", linkedin: "", facebook: "", instagram: "" },
          permissions: { canCreate: false, canEdit: false, canDelete: false, canView: true },
        });
        setAvatarFile(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "⚠️ Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border border-custom p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          {page === "edit" ? "Edit User" : "Create New User"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={page === "edit" ? "Leave blank to keep current" : "Enter password"}
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent pr-12 transition"
                required={page !== "edit"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary focus:outline-none focus:ring-2 focus:ring-accent transition"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Bio & Avatar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Short bio"
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Avatar
              </label>
              <input
                type="file"
                name="authorImage"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
              {avatarFile && (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-full border"
                />
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Social Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(formData.socialLinks).map((platform) => (
                <input
                  key={platform}
                  type="url"
                  name={platform}
                  value={formData.socialLinks[platform]}
                  onChange={handleChange}
                  placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  className="w-full px-4 py-2 border border-custom rounded-lg bg-muted text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Permissions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(formData.permissions).map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 text-sm border border-custom bg-muted rounded-md px-3 py-2 cursor-pointer hover:bg-hover transition"
                >
                  <input
                    type="checkbox"
                    name={perm}
                    checked={formData.permissions[perm]}
                    onChange={handleChange}
                    className="accent-accent"
                  />
                  <span className="capitalize">{perm.replace("can", "")}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold bg-accent text-white shadow-md hover:bg-hover transition duration-200"
          >
            {page === "edit" ? "Update User" : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}
