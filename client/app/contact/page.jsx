"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function UserPoemForm() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    subcategory: "",
    mainLanguage: "",
    subLanguage: "",
    videoLink: "",
  });

  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);

  // 🟩 Fetch Languages
  useEffect(() => {
    setMounted(true);
    const fetchLanguages = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/languages`);
        const data = await res.json();

        if (data.success && Array.isArray(data.languages)) {
          const sorted = [...data.languages].reverse();
          setLanguages(sorted);

          if (sorted.length > 0) {
            const firstMain = sorted[0].mainCategory;
            const firstSub = sorted[0].subLanguages[0]?.name || "";
            setFormData((prev) => ({
              ...prev,
              mainLanguage: firstMain,
              subLanguage: firstSub,
            }));
          }
        } else {
          Swal.fire("Error", data.message || "Failed to fetch languages", "error");
        }
      } catch (error) {
        console.error("Language Fetch Error:", error);
        Swal.fire("Error", "Unable to fetch language data", "error");
      }
    };

    fetchLanguages();
  }, []);

  if (!mounted) return null;

  // 🟨 Subcategories
  const subCategories = {
    Gadhya: ["Nibandh", "Kahani", "Upnayas", "Natak", "Jeewni/Atmkatha", "Sansmaran"],
    Kavya: [
      "Shringar",
      "Hasya",
      "Karun",
      "Raudra",
      "Veer",
      "Bhayanak",
      "Vibhats",
      "Adbhut",
      "Shant",
      "Vatsalya",
      "Bhakti",
    ],
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => setImage(e.target.files[0]);
  const handleAudioChange = (e) => setAudio(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        Swal.fire("Error", "API URL not found in .env", "error");
        setLoading(false);
        return;
      }

      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "mainLanguage" && key !== "subLanguage") {
          form.append(key, value);
        }
      });

      const languageData = [
        {
          mainLanguage: formData.mainLanguage,
          subLanguageName: formData.subLanguage,
        },
      ];
      form.append("languages", JSON.stringify(languageData));
      form.append("status", "pending");
      form.append("isAdminPost", false);

      if (image) form.append("image", image);
      if (audio) form.append("audio", audio);

      const res = await fetch(`${apiUrl}/api/poems/create`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "🎉 आपकी रचना सबमिट हो गई!",
          text: "समीक्षा के बाद यह प्रकाशित की जाएगी।",
          confirmButtonText: "ठीक है",
          confirmButtonColor: "#ff6b00",
          background: "#fffbea",
        });

        setFormData({
          title: "",
          content: "",
          category: "",
          subcategory: "",
          mainLanguage: languages[0]?.mainCategory || "",
          subLanguage: languages[0]?.subLanguages[0]?.name || "",
          videoLink: "",
        });
        setImage(null);
        setAudio(null);
      } else {
        Swal.fire("Error", data.message || "Failed to submit poem", "error");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire("Error", "कुछ समस्या आई, कृपया बाद में पुनः प्रयास करें।", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedMain = Array.isArray(languages)
    ? languages.find((l) => l.mainCategory === formData.mainLanguage)
    : null;
  const subLangs = selectedMain ? selectedMain.subLanguages : [];

  // ---------- UI with theme: normal (white + orange) ; dark (black + orange) ----------
  return (
    <div
      className="
        max-w-2xl mx-auto mt-10 p-8 rounded-2xl border transition-colors
        bg-white  border-[rgba(255,107,0,0.06)] shadow shadow-orange-300  hover:shadow-md hover:shadow-orange-400
        dark:bg-[#000000] dark:border-[rgba(255,107,0,0.12)]
      "
      style={{ outline: "none" }}
    >
      <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide text-orange-500 dark:text-orange-500">
         अपनी रचना भेजें
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">शीर्षक</label>
          <input
            type="text"
            name="title"
            placeholder="अपनी रचना का शीर्षक लिखें"
            value={formData.title}
            onChange={handleChange}
            className="
              w-full p-3 rounded-lg shadow-sm
              border border-[1px] border-[rgba(255,107,0,0.25)]
              focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
              bg-white text-gray-900
              dark:bg-[#071014] dark:text-gray-100
              dark:border-[rgba(255,107,0,0.28)]
            "
            required
          />
        </div>

        {/* Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">श्रेणी</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="
                w-full p-3 rounded-lg shadow-sm
                border border-[1px] border-[rgba(255,107,0,0.20)]
                focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                bg-white text-gray-900
                dark:bg-[#071014] dark:text-gray-100
                dark:border-[rgba(255,107,0,0.28)]
              "
              required
            >
              <option value="">श्रेणी चुनें</option>
              <option value="Gadhya">Gadhya</option>
              <option value="Kavya">Kavya</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">उपश्रेणी</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="
                w-full p-3 rounded-lg shadow-sm
                border border-[1px] border-[rgba(255,107,0,0.20)]
                focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                bg-white text-gray-900
                dark:bg-[#071014] dark:text-gray-100
                dark:border-[rgba(255,107,0,0.28)]
              "
              required
            >
              <option value="">उपश्रेणी चुनें</option>
              {formData.category &&
                subCategories[formData.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Language Selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">मुख्य भाषा श्रेणी</label>
            <select
              name="mainLanguage"
              value={formData.mainLanguage}
              onChange={(e) => {
                const mainLang = e.target.value;
                const selectedLang = languages.find((l) => l.mainCategory === mainLang);
                setFormData((prev) => ({
                  ...prev,
                  mainLanguage: mainLang,
                  subLanguage: selectedLang?.subLanguages[0]?.name || "",
                }));
              }}
              className="
                w-full p-3 rounded-lg shadow-sm
                border border-[1px] border-[rgba(255,107,0,0.20)]
                focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                bg-white text-gray-900
                dark:bg-[#071014] dark:text-gray-100
                dark:border-[rgba(255,107,0,0.28)]
              "
              required
            >
              {Array.isArray(languages) && languages.length > 0 ? (
                languages.map((lang) => (
                  <option key={lang._id} value={lang.mainCategory}>
                    {lang.mainCategory.toUpperCase()}
                  </option>
                ))
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">भाषा</label>
            <select
              name="subLanguage"
              value={formData.subLanguage}
              onChange={handleChange}
              className="
                w-full p-3 rounded-lg shadow-sm
                border border-[1px] border-[rgba(255,107,0,0.20)]
                focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                bg-white text-gray-900
                dark:bg-[#071014] dark:text-gray-100
                dark:border-[rgba(255,107,0,0.28)]
              "
              required
            >
              {subLangs.length > 0 ? (
                subLangs.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))
              ) : (
                <option disabled>कोई भाषा उपलब्ध नहीं</option>
              )}
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">रचना</label>
          <textarea
            name="content"
            placeholder="अपनी रचना यहाँ लिखें..."
            rows="6"
            value={formData.content}
            onChange={handleChange}
            className="
              w-full p-3 rounded-lg shadow-sm
              border border-[1px] border-[rgba(255,107,0,0.20)]
              focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
              bg-white text-gray-900
              dark:bg-[#071014] dark:text-gray-100
              dark:border-[rgba(255,107,0,0.28)]
            "
            required
          ></textarea>
        </div>

        {/* Video Link */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">वीडियो लिंक (वैकल्पिक)</label>
          <input
            type="url"
            name="videoLink"
            placeholder="यदि कोई वीडियो लिंक हो तो यहाँ डालें"
            value={formData.videoLink}
            onChange={handleChange}
            className="
              w-full p-3 rounded-lg shadow-sm
              border border-[1px] border-[rgba(255,107,0,0.20)]
              focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
              bg-white text-gray-900
              dark:bg-[#071014] dark:text-gray-100
              dark:border-[rgba(255,107,0,0.28)]
            "
          />
        </div>

        {/* Image + Audio Upload */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">चित्र अपलोड करें</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block mt-1 text-sm text-gray-700 dark:text-gray-300"
            />
          </div>

          <div className="flex-1">
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">ऑडियो अपलोड करें (वैकल्पिक)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="block mt-1 text-sm text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-lg font-semibold text-lg transition shadow-md
           bg-orange-400 hover:bg-orange-500 text-white
            dark:from-[#ff6b00] dark:to-[#ff7a00]
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "भेजा जा रहा है..." : "रचना सबमिट करें"}
        </button>
      </form>
    </div>
  );
}
