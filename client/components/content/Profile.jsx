// components/ProfilePage.jsx
"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // optional (kept for compat)
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Fetch profile (cookie-based auth: credentials: "include")
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/user/profile`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.data);
          setFormData(data.data || {});
        } else {
          // show a gentle toast if unauthorized or other message
          if (res.status === 401) {
            Swal.fire({
              icon: "info",
              title: "Please login",
              text: "आपको लॉगिन करना होगा।",
              timer: 1400,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
            });
          } else {
            console.error("Failed to fetch profile:", data.message);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "प्रोफ़ाइल लोड करने में त्रुटि आई।",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiUrl]);

  // handle input changes (supports socialLinks.<key>)
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

  // update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/user/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // server might return different shapes: {data}, {user}, or the object directly
        const updated = data.data || data.user || data;
        setUser(updated);
        setFormData(updated);
        setIsEditing(false);

        Swal.fire({
          icon: "success",
          title: "Profile updated",
          text: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: data.message || "अपडेट असफल रहा।",
        });
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "कुछ गलत हुआ। बाद में फिर कोशिश करें।",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#071126]">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 dark:text-red-400 bg-gray-50 dark:bg-[#071126]">
        No user data found.
      </div>
    );

  return (
    <div className="min-h-screen text-[#2C2C2C] dark:text-gray-100  dark:bg-[#071126]">
      {/* Cover */}
      <div className="w-full h-50 sm:h-72 md:h-80 rounded-b-3xl bg-gradient-to-r from-[#F6A760]/90 to-[#F29E7A]/60 dark:from-[#062235] dark:to-[#042033]" />

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 text-center">
        <div className="inline-block relative">
          <img
            src={user.avatar || "https://i.pravatar.cc/200"}
            alt={user.name || "User"}
            className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold mt-4">
          <span className="dark:text-white">{user.name || ""}</span>{" "}
          {user.penName && <span className="font-devanagari text-gray-500 dark:text-gray-300">/ {user.penName}</span>}
        </h1>

        {user.tagline && <p className="text-[#8B1E3F] font-medium mt-1">{user.tagline}</p>}

        <div className="flex justify-center items-center gap-3 mt-2 text-gray-500 text-sm dark:text-gray-300">
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

        {user.bio && <p className="max-w-2xl mx-auto mt-4 text-gray-600 dark:text-gray-300">{user.bio}</p>}

        <div className="flex justify-center gap-6 mt-6 text-xl">
          {["instagram", "twitter", "facebook", "website"].map((key, i) => {
            const Icon =
              key === "instagram" ? FaInstagram : key === "twitter" ? FaTwitter : key === "facebook" ? FaFacebook : FaGlobe;
            return (
              <div
                key={i}
                className={`${
                  user.socialLinks?.[key] ? "text-[#E76F51] hover:scale-110 transition" : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {user.socialLinks?.[key] ? (
                  <a href={user.socialLinks[key]} target="_blank" rel="noreferrer">
                    <Icon />
                  </a>
                ) : (
                  <Icon />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center flex-wrap gap-10 mt-8 text-center">
          {[
            { label: "Poems", value: user.stats?.poems || "—" },
            { label: "Gadhya", value: user.stats?.gadhya || "—" },
            { label: "Kavya", value: user.stats?.kavya || "—" },
            { label: "Audio", value: user.stats?.audio || "—" },
            { label: "Followers", value: user.stats?.followers || "—" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold text-[#E76F51]">{stat.value}</p>
              <p className="capitalize text-gray-600 dark:text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mt-6 px-6 py-2 bg-[#E76F51] text-white rounded-full hover:bg-[#cf5f40] transition"
        >
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="mt-10 max-w-3xl mx-auto bg-white dark:bg-[#07182a] shadow-lg dark:shadow-lg/10 rounded-2xl p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Bio</label>
              <input
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                placeholder="Write about yourself"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Tagline</label>
              <input
                name="tagline"
                value={formData.tagline || ""}
                onChange={handleChange}
                placeholder="Your tagline"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Profession</label>
              <input
                name="profession"
                value={formData.profession || ""}
                onChange={handleChange}
                placeholder="Profession"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Location</label>
              <input
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="City, Country"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Instagram</label>
              <input
                name="socialLinks.instagram"
                value={formData.socialLinks?.instagram || ""}
                onChange={handleChange}
                placeholder="Instagram URL"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Twitter</label>
              <input
                name="socialLinks.twitter"
                value={formData.socialLinks?.twitter || ""}
                onChange={handleChange}
                placeholder="Twitter URL"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Facebook</label>
              <input
                name="socialLinks.facebook"
                value={formData.socialLinks?.facebook || ""}
                onChange={handleChange}
                placeholder="Facebook URL"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Website</label>
              <input
                name="socialLinks.website"
                value={formData.socialLinks?.website || ""}
                onChange={handleChange}
                placeholder="Website URL"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded w-full bg-gray-50 dark:bg-[#031825] text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <button type="submit" className="mt-6 bg-[#8B1E3F] text-white px-6 py-2 rounded-full hover:bg-[#6f1832] transition">
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
