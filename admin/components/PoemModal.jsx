"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function PoemModal({ poemId, onClose, onUpdated }) {
  const [poem, setPoem] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

 const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // 🟢 Fetch full poem details
  useEffect(() => {
    if (!poemId) return;
    const fetchPoem = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/poems/${poemId}`);
        if (!res.ok) throw new Error("Failed to fetch poem");
        const data = await res.json();
       setPoem(data.poem);

      } catch (err) {
        console.error("❌ Error fetching poem:", err);
      }
    };
    fetchPoem();
  }, [poemId]);

  // 🟢 Fetch languages for dropdown
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/languages`);
        if (!res.ok) throw new Error("Failed to fetch languages");
     const data = await res.json();
const langs = Array.isArray(data) ? data : data.languages || data.data || [];
setLanguages(langs);

      } catch (err) {
        console.error("❌ Error fetching languages:", err);
      }
    };
    fetchLanguages();
  }, []);

  // 🟡 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPoem((prev) => ({ ...prev, [name]: value }));
  };

  // 🟡 Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setPoem((prev) => ({ ...prev, [name]: files[0] }));
  };

  // 🟢 Update poem (PUT)
  const handleUpdate = async () => {
    const token = Cookies.get("adminToken");
    if (!token) {
      console.error("❌ No token found in cookies");
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      for (const key in poem) {
        formData.append(key, poem[key]);
      }

      const res = await fetch(`${apiUrl}/api/poems/admin/update/${poem._id}`, {
        method: "PUT",
         credentials: "include",   
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      alert("✅ Poem updated successfully!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Update failed. Check console for details.");
    } finally {
      setUpdating(false);
    }
  };

  if (!poem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4 text-center text-navy-700">
          ✍️ View & Edit Poem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={poem.title || ""}
            onChange={handleChange}
            placeholder="Title"
            className="border p-2 rounded"
          />
          <input
            name="category"
            value={poem.category || ""}
            onChange={handleChange}
            placeholder="Category"
            className="border p-2 rounded"
          />
          <input
            name="subcategory"
            value={poem.subcategory || ""}
            onChange={handleChange}
            placeholder="Subcategory"
            className="border p-2 rounded"
          />

          {/* Main Language */}
         <select
  name="mainLanguage"
  value={poem.mainLanguage || ""}
  onChange={handleChange}
  className="border p-2 rounded"
>
  <option value="">Select Main Language</option>
  {Array.isArray(languages) &&
    languages.map((lang) => (
      <option key={lang._id} value={lang.name}>
        {lang.name}
      </option>
    ))}
</select>
          {/* Sub Language */}
          <select
            name="subLanguage"
            value={poem.subLanguage || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Sub Language</option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          name="content"
          value={poem.content || ""}
          onChange={handleChange}
          placeholder="Write poem content here..."
          className="border p-2 rounded w-full mt-4 h-40"
        />

        {/* Media Section */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block font-medium">Image</label>
            {poem.image && (
              <img
                src={`${apiUrl}${poem.image}`}
                alt="Poem"
                className="w-40 rounded mb-2"
              />
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block"
            />
          </div>

          <div>
            <label className="block font-medium">Audio</label>
            {poem.audio && (
              <audio controls className="mb-2">
                <source src={`${apiUrl}${poem.audio}`} />
              </audio>
            )}
            <input
              type="file"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="block"
            />
          </div>

          <div>
            <label className="block font-medium">Video</label>
            {poem.video && (
              <video controls width="200" className="mb-2 rounded">
                <source src={`${apiUrl}${poem.video}`} />
              </video>
            )}
            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="block"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
