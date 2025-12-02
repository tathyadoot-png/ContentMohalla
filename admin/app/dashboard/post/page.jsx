"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "@/utils/api"; // axios instance with withCredentials: true

/**
 * AdminPostForm
 * - Supports create (no poemId) and edit (pass poemId + poemData)
 * - Uses Cloudinary+multer style where backend expects files under "image","audio","video"
 *
 * Usage:
 *  <AdminPostForm />
 *  or (edit mode)
 *  <AdminPostForm poemId={id} poemData={selectedPoem} onUpdated={refreshList} onClose={closeModal} />
 */
export default function AdminPostForm({ poemId = null, poemData = null, onUpdated = null, onClose = null }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // states
  const [languages, setLanguages] = useState([]);
  const [subLanguages, setSubLanguages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    subcategory: "",
    mainLanguage: "",
    subLanguage: "",
    userUniqueId: "",
    videoLink: "",
    date: "",
  });

  // file states (File objects if user selects new file)
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [video, setVideo] = useState(null);

  // existing media (url) to preview if editing and not replacing
  const [existingMedia, setExistingMedia] = useState({ image: null, audio: null, video: null });

  const [loading, setLoading] = useState(false);
  const [fetchingPoem, setFetchingPoem] = useState(false);

  // fetch languages once (prefer axios, fallback to fetch)
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get("/languages");
        const data = res.data;
        const langs = Array.isArray(data) ? data : data.languages || data.data || [];
        setLanguages(langs);
      } catch (err) {
        console.warn("api.get /languages failed, falling back to fetch:", err);
        try {
          const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/languages`);
          const d = await r.json();
          const langs = Array.isArray(d) ? d : d.languages || d.data || [];
          setLanguages(langs);
        } catch (e) {
          console.error("Error fetching languages (fallback):", e);
        }
      }
    };
    fetchLanguages();
  }, [apiUrl]);

  // fill from poemData (preferred) or fetch by poemId
  useEffect(() => {
    const norm = (val) => {
      if (!val) return null;
      if (typeof val === "object" && val.url) return val.url;
      if (typeof val === "string") return val.startsWith("http") ? val : `${apiUrl}${val}`;
      return null;
    };

    const fillFromPoem = (poem) => {
      if (!poem) return;
      setFormData({
        title: poem.title || "",
        content: poem.content || "",
        category: poem.category?.name || poem.category || "",
        subcategory: poem.subcategory?.name || poem.subcategory || "",
        mainLanguage:
          (Array.isArray(poem.languages) && (poem.languages[0]?.mainLanguage || poem.languages[0]?.mainLanguageName)) ||
          poem.mainLanguage ||
          poem.language?.name ||
          "",
        subLanguage:
          (Array.isArray(poem.languages) && (poem.languages[0]?.subLanguageName || poem.languages[0]?.subLanguage)) ||
          poem.subLanguage ||
          "",
        userUniqueId: poem.userUniqueId || poem.writerId?.uniqueId || poem.writerId?._id || "",
        videoLink: poem.videoLink || poem.video || "",
        date: poem.date ? String(poem.date).split("T")[0] : poem.createdAt ? String(poem.createdAt).split("T")[0] : "",
      });

      setExistingMedia({
        image: norm(poem.image || poem.imagePath || poem.imageUrl),
        audio: norm(poem.audio || poem.audioPath),
        video: norm(poem.video || poem.videoPath),
      });

      // try set subLanguages from languages list
      const mainLangId =
        (Array.isArray(poem.languages) && (poem.languages[0]?.mainLanguage || poem.languages[0]?.mainLanguageName)) ||
        poem.mainLanguage ||
        poem.language?._id ||
        poem.language?.name;
      const found = (languages || []).find((l) => l._id === mainLangId || l.name === mainLangId || l.mainCategory === mainLangId);
      if (found) setSubLanguages(found.subLanguages || []);
    };

    if (poemData) {
      fillFromPoem(poemData);
    } else if (poemId) {
      setFetchingPoem(true);
      // prefer axios
      api
        .get(`/poems/${poemId}`)
        .then((r) => {
          const poem = r.data?.poem || r.data;
          fillFromPoem(poem);
        })
        .catch((err) => {
          console.warn("api.get /poems/:id failed, falling back to fetch:", err);
          // fallback to fetch
          fetch(`${apiUrl.replace(/\/$/, "")}/api/poems/${poemId}`)
            .then((r) => r.json())
            .then((data) => {
              const poem = data.poem || data;
              fillFromPoem(poem);
            })
            .catch((e) => console.error("Failed to fetch poem (fallback):", e));
        })
        .finally(() => setFetchingPoem(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poemData, poemId, apiUrl, languages]);

  // generic change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // handle main language selection (populate sublanguages)
  const handleMainLanguageChange = (e) => {
    const selected = e.target.value;
    setFormData((p) => ({ ...p, mainLanguage: selected, subLanguage: "" }));
    const found = languages.find((l) => l._id === selected || l.name === selected || l.mainCategory === selected);
    setSubLanguages(found ? found.subLanguages || [] : []);
  };

  // handle files, store File objects and preview
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "image") {
      setImage(file);
      setExistingMedia((m) => ({ ...m, image: URL.createObjectURL(file) }));
    }
    if (type === "audio") {
      setAudio(file);
      setExistingMedia((m) => ({ ...m, audio: URL.createObjectURL(file) }));
    }
    if (type === "video") {
      setVideo(file);
      setExistingMedia((m) => ({ ...m, video: URL.createObjectURL(file) }));
    }
  };

  // submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- 1) verify session (server-set cookie) ---
      let me = null;
      try {
        const meRes = await api.get("/auth/me");
        me = meRes.data?.user || meRes.data || null;
      } catch (err) {
        console.warn("/auth/me verify failed:", err);
        me = null;
      }

      if (!me || me.role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Not authorized",
          text: "सत्र मान्य नहीं है — कृपया फिर लॉगिन करें।",
        });
        setLoading(false);
        return;
      }

      // --- 2) build FormData (same as before) ---
      const fd = new FormData();

      const allowedText = [
        "title",
        "content",
        "category",
        "subcategory",
        "userUniqueId",
        "videoLink",
        "date",
      ];
      allowedText.forEach((k) => {
        const v = formData[k];
        if (v !== undefined && v !== null && v !== "") fd.append(k, v);
      });

      const languageData = [{ mainLanguage: formData.mainLanguage, subLanguageName: formData.subLanguage }];
      fd.append("languages", JSON.stringify(languageData));
      fd.append("isAdminPost", "true");
      fd.append("status", "approved");

      if (image && image instanceof File) fd.append("image", image);
      if (audio && audio instanceof File) fd.append("audio", audio);
      if (video && video instanceof File) fd.append("video", video);

      // debug (optional)
      // for (const pair of fd.entries()) console.log("FormData:", pair[0], pair[1]);

      // --- 3) send request via axios (preferred) ---
      const isEdit = poemId !== null && poemId !== undefined;
      let axiosRes;
      if (isEdit) {
        axiosRes = await api.put(`/poems/admin/update/${poemId}`, fd);
      } else {
        axiosRes = await api.post("/poems/create", fd);
      }

      const data = axiosRes?.data;

      if (!axiosRes || (data && data.success === false)) {
        console.error("Server error response:", data);
        throw new Error(data?.message || "Server error");
      }

      Swal.fire({
        icon: "success",
        title: isEdit ? "Post updated!" : "Post uploaded!",
        text: isEdit ? "The post was updated successfully." : "Post uploaded & approved successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      // reset after create, or after edit close
      setFormData({
        title: "",
        content: "",
        category: "",
        subcategory: "",
        mainLanguage: "",
        subLanguage: "",
        userUniqueId: "",
        videoLink: "",
        date: "",
      });
      setImage(null);
      setAudio(null);
      setVideo(null);
      setExistingMedia({ image: null, audio: null, video: null });

      if (typeof onUpdated === "function") onUpdated();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("Save error:", err);
      const msg = err?.response?.data?.message || err?.message || "Error saving post";
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // subcategories (static)
  const subCategories = {
    Gadhya: ["Nibandh", "Kahani", "Upnayas", "Natak", "Jeewni/Atmkatha", "Sansmaran"],
    Kavya: ["Shringar", "Hasya", "Karun", "Raudra", "Veer", "Bhayanak", "Vibhats", "Adbhut", "Shant", "Vatsalya", "Bhakti"],
  };

  if (fetchingPoem) return <div className="p-6">Loading post...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#B83D43]">{poemId ? "✏️ Edit Post" : "📝 Admin Post Upload"}</h2>
        {onClose && <button onClick={onClose} className="text-gray-500 hover:text-red-600">✕</button>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <input type="text" name="title" placeholder="Enter Title" value={formData.title} onChange={handleChange} className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]" required />

        <div>
          <label className="font-medium text-gray-700">User Unique ID <span className="text-sm text-gray-500">(optional)</span></label>
          <input type="text" name="userUniqueId" placeholder="If you want to post for a specific user" value={formData.userUniqueId} onChange={handleChange} className="w-full border p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-[#B83D43]" />
        </div>

        <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]" required>
          <option value="">Select Category</option>
          <option value="Gadhya">Gadhya</option>
          <option value="Kavya">Kavya</option>
        </select>

        <select name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]" required>
          <option value="">Select Subcategory</option>
          {formData.category && subCategories[formData.category]?.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-700 mb-2">Main Language Category</label>
            <select name="mainLanguage" value={formData.mainLanguage} onChange={handleMainLanguageChange} className="border p-3 rounded-md w-full">
              <option value="">Select Main Language</option>
              {languages.map((lang) => (
                <option key={lang._id} value={lang.mainCategory || lang.name}>
                  {lang.mainCategory || lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-gray-700 mb-2">Sub Language</label>
            <select name="subLanguage" value={formData.subLanguage} onChange={(e) => setFormData(p => ({ ...p, subLanguage: e.target.value }))} disabled={!formData.mainLanguage} className="border p-3 rounded-md w-full">
              <option value="">{formData.mainLanguage ? "Select Sub Language" : "Select Main First"}</option>
              {subLanguages?.map((s) => (
                <option key={s._id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-medium text-gray-700">Select Post Date <span className="text-sm text-gray-500">(optional)</span></label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-[#B83D43]" />
        </div>

        <textarea name="content" placeholder="Enter Content" rows="6" value={formData.content} onChange={handleChange} className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]" required />

        <input type="url" name="videoLink" placeholder="Enter Video Link (e.g. https://youtu.be/xyz)" value={formData.videoLink} onChange={handleChange} className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B83D43]" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-medium">Image</label>
            {existingMedia.image && <img src={existingMedia.image} alt="existing" className="w-24 h-24 object-cover rounded mb-2" />}
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="block mt-1" />
          </div>

          <div>
            <label className="font-medium">Audio</label>
            {existingMedia.audio && <audio controls className="mb-2"><source src={existingMedia.audio} /></audio>}
            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, "audio")} className="block mt-1" />
          </div>

          <div>
            <label className="font-medium">Video</label>
            {existingMedia.video && <video controls width="200" className="mb-2 rounded"><source src={existingMedia.video} /></video>}
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="block mt-1" />
          </div>
        </div>

        <div className="flex gap-3">
          {onClose && <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>}
          <button type="submit" disabled={loading} className="ml-auto w-full sm:w-auto bg-[#B83D43] text-white py-3 px-6 rounded-md hover:bg-[#9c2f35] transition font-medium">
            {loading ? (poemId ? "Updating..." : "Uploading...") : poemId ? "Save Changes" : "Upload Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
