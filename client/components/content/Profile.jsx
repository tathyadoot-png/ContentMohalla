"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaGlobe,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/user/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.data);
          setFormData(data.data);
          setAvatarPreview(data.data.avatar);
        } else {
          console.log("Failed profile fetch", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...(prev.socialLinks || {}), [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle avatar file upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Save profile
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "socialLinks") form.append(key, formData[key]);
      });

      form.append("socialLinks", JSON.stringify(formData.socialLinks || {}));

      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      const res = await fetch(`${apiUrl}/api/user/update`, {
        method: "PUT",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          timer: 1200,
          showConfirmButton: false,
        });

        const updated = data.data || data.user;
        setUser(updated);
        setFormData(updated);
        setAvatarPreview(updated.avatar);
        setIsEditing(false);
      } else {
        Swal.fire({ icon: "error", title: "Update Failed" });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({ icon: "error", title: "Error updating profile" });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        User not found
      </div>
    );

  return (
    <div className="min-h-screen dark:bg-[#071126] p-4 text-center">
      {/* Cover */}
      <div className="w-full h-52 sm:h-72 md:h-80 rounded-b-3xl bg-gradient-to-r from-[#F6A760]/90 to-[#F29E7A]/60" />

      {/* Profile Header */}
      <div className="-mt-20">
        <div className="relative inline-block">
          <img
            src={avatarPreview || "https://i.pravatar.cc/200"}
            className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-xl object-cover mx-auto"
          />
        </div>

        {/* name + penName */}
        <h1 className="text-3xl font-bold mt-4 dark:text-white">
          {user.name}{" "}
          {user.penName && (
            <span className="text-gray-400 font-medium">({user.penName})</span>
          )}
        </h1>

        {user.tagline && (
          <p className="text-[#8B1E3F] mt-1 font-medium">{user.tagline}</p>
        )}

        <div className="flex justify-center gap-3 text-gray-500 mt-2">
          {user.profession && (
            <span className="flex items-center gap-1">
              <FaUser /> {user.profession}
            </span>
          )}
          {user.location && (
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt /> {user.location}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="max-w-xl mx-auto text-gray-600 mt-4">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-10 mt-6">
          {[ 
            { label: "Poems", value: user.stats?.poems },
            { label: "Gadhya", value: user.stats?.gadhya },
            { label: "Kavya", value: user.stats?.kavya },
            { label: "Audio", value: user.stats?.audio },
            { label: "Followers", value: user.stats?.followers }
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-[#E76F51]">
                {stat.value ?? "0"}
              </p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mt-6 px-6 py-2 bg-[#E76F51] text-white rounded-full"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleUpdate}
          className="max-w-3xl mx-auto bg-white dark:bg-[#0c1c2a] p-6 rounded-xl shadow-lg mt-8"
        >
          {/* Avatar Upload */}
          <div className="mb-4">
            <label className="block mb-2 text-gray-600">Profile Image</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Pen Name */}
            <div>
              <label className="text-sm text-gray-600">Pen Name</label>
              <input
                name="penName"
                value={formData.penName || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Rest fields */}
            <div>
              <label className="text-sm text-gray-600">Bio</label>
              <input
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Tagline</label>
              <input
                name="tagline"
                value={formData.tagline || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Profession</label>
              <input
                name="profession"
                value={formData.profession || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Location</label>
              <input
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="text-sm">Instagram</label>
              <input
                name="socialLinks.instagram"
                value={formData.socialLinks?.instagram || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Twitter</label>
              <input
                name="socialLinks.twitter"
                value={formData.socialLinks?.twitter || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Facebook</label>
              <input
                name="socialLinks.facebook"
                value={formData.socialLinks?.facebook || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm">Website</label>
              <input
                name="socialLinks.website"
                value={formData.socialLinks?.website || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 bg-[#8B1E3F] text-white px-6 py-2 rounded-full"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
