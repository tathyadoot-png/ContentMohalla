import React, { useState } from "react";
import writer from '../../public/writer.png'
import { FiCamera } from "react-icons/fi";

export default function PoetrySiteRegistration() {
  const [form, setForm] = useState({
    fullName: "",
    penName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    phone: "",
    tagline: "",
    profession: "",
    location: "",
    avatar: null,
    socialLinks: {
      twitter: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      github: "",
      website: "",
    },
  });

  const [preview, setPreview] = useState(null);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("कृपया सभी आवश्यक विवरण भरें।");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("पासवर्ड मेल नहीं खा रहे हैं।");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "socialLinks") {
        Object.entries(value).forEach(([subKey, subVal]) =>
          formData.append(`socialLinks[${subKey}]`, subVal)
        );
      } else {
        formData.append(key, value);
      }
    });

    try {
      // 👇 NOTE: backend integration untouched — original behavior preserved
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

     

      // Reset form
      setForm({
        fullName: "",
        penName: "",
        email: "",
        password: "",
        confirmPassword: "",
        bio: "",
        phone: "",
        tagline: "",
        profession: "",
        location: "",
        avatar: null,
        socialLinks: {
          twitter: "",
          instagram: "",
          facebook: "",
          linkedin: "",
          youtube: "",
          github: "",
          website: "",
        },
      });
      setPreview(null);
    } catch (err) {
      console.error("❌ Registration error:", err.message);
      setError("पंजीकरण असफल रहा, कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black transition-colors">
      <div className="max-w-4xl w-full rounded-2xl overflow-hidden
                     shadow-md shadow-orange-300 hover:shadow-lg hover:shadow-orange-400 
                      bg-white dark:bg-black
                     ">
        <div className="p-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-600 dark:text-gray-300">
            <span className="text-orange-500">"मोहल्ले"</span> में आपका <span className="text-orange-500">स्वागत</span> है
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            अपनी रचनाएँ साझा करने के लिए कृपया पंजीकरण करें।
          </p>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mt-6">
            <div className="relative w-28 h-28 ">
              <img
                src={preview || "/avatar.png"}
                alt=""
                className="w-28 h-28 rounded-full   object-cover bg-white dark:bg-[#071014] shadow-md shadow-orange-500"
              />
              <label className="absolute bottom-0 right-0 bg-gray-700  text-white p-2 rounded-full cursor-pointer">
                <FiCamera/>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
              प्रोफ़ाइल फ़ोटो अपलोड करें (वैकल्पिक)
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 text-left text-sm"
          >
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="पूरा नाम"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <Input
                label="उपनाम (यदि कोई हो)"
                name="penName"
                value={form.penName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="ईमेल"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="पासवर्ड"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Input
                label="पासवर्ड दोहराएँ"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="पेशा (Profession)"
                name="profession"
                value={form.profession}
                onChange={handleChange}
              />
              <Input
                label="स्थान (Location)"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <Input
              label="संक्षिप्त पंक्ति / टैगलाइन"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="e.g. 'शब्दों में आत्मा की गूँज'"
            />

            <Textarea
              label="संक्षिप्त परिचय"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="अपने लेखन शैली के बारे में कुछ शब्द..."
            />

            <Input
              label="फ़ोन नंबर"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            {/* Social Media Links */}
            <div className="mt-6 border-t pt-4 border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,107,0,0.06)]">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                सोशल मीडिया लिंक (वैकल्पिक)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "twitter",
                  "instagram",
                  "facebook",
                  "linkedin",
                  "youtube",
                  "github",
                  "website",
                ].map((platform) => (
                  <Input
                    key={platform}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    name={`socialLinks.${platform}`}
                    value={form.socialLinks[platform]}
                    onChange={handleChange}
                    placeholder={`https://${platform}.com/yourhandle`}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg font-semibold shadow-md
                         bg-orange-400 hover:bg-orange-500 text-white
                         disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "पंजीकरण जारी है..." : "पंजीकरण करें"}
            </button>

           
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            पहले से खाता है?{" "}
            <a href="/login" className="text-primary underline">
              लॉगिन करें
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
function Input({ label, name, value, onChange, placeholder, type = "text", required }) {
  return (
    <label className="block">
      <span className="text-gray-700 text-xs font-medium dark:text-gray-200">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          mt-1 block w-full rounded-lg p-2
          bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100
          border border-[rgba(255,107,0,0.20)] dark:border-[rgba(255,107,0,0.28)]
          shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.16)]
        "
      />
    </label>
  );
}

function Textarea({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-gray-700 text-xs font-medium dark:text-gray-200">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="
          mt-1 block w-full rounded-lg p-2
          bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100
          border border-[rgba(255,107,0,0.20)] dark:border-[rgba(255,107,0,0.28)]
          shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.16)]
        "
      />
    </label>
  );
}
