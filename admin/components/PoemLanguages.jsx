"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "@/utils/api"; // axios instance withCredentials: true

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const PoemLanguages = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    mainCategory: "",
    subLanguages: [],
  });
  const [newLanguage, setNewLanguage] = useState({
    mainCategory: "",
    subLanguages: [{ name: "", description: "" }],
  });

  // Verify admin session using server-side httpOnly cookie
  const verifyAdmin = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data?.user ?? res.data ?? null;
      if (!user || user.role !== "admin") return null;
      return user;
    } catch (err) {
      return null;
    }
  };

  // Fetch all languages (prefer axios, fallback to fetch)
  const fetchLanguages = async () => {
    try {
      const res = await api.get("/languages");
      const data = res.data;
      const langs = Array.isArray(data) ? data : data.languages || data.data || [];
      setLanguages(langs);
    } catch (err) {
      // fallback to fetch if axios fails
      try {
        const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/languages`);
        const d = await r.json();
        const langs = Array.isArray(d) ? d : d.languages || d.data || [];
        setLanguages(langs);
      } catch (e) {
        console.error("Error fetching languages:", e);
        setLanguages([]);
      }
    }
  };

  useEffect(() => {
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle edit
  const handleEdit = (language) => {
    setEditingLanguage(language._id);
    setUpdatedData({
      mainCategory: language.mainCategory,
      subLanguages: [...language.subLanguages],
    });
  };

  // Handle input change for subLanguages
  const handleSubLangChange = (index, field, value) => {
    const newSubLangs = [...updatedData.subLanguages];
    newSubLangs[index] = { ...newSubLangs[index], [field]: value };
    setUpdatedData({ ...updatedData, subLanguages: newSubLangs });
  };

  // Add new sublanguage (in edit mode)
  const handleAddSubLang = () => {
    setUpdatedData({
      ...updatedData,
      subLanguages: [...updatedData.subLanguages, { name: "", description: "" }],
    });
  };

  // Delete sublanguage (in edit mode)
  const handleDeleteSubLang = (index) => {
    const newSubLangs = updatedData.subLanguages.filter((_, i) => i !== index);
    setUpdatedData({ ...updatedData, subLanguages: newSubLangs });
  };

  // Update Language (protected)
  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      const me = await verifyAdmin();
      if (!me) {
        Swal.fire("Unauthorized", "Login required (admin).", "warning");
        setLoading(false);
        return;
      }

      // prefer axios
      try {
        const res = await api.put(`/languages/${id}`, updatedData);
        const data = res.data;
        if (data.success) {
          Swal.fire({ icon: "success", title: "Updated!", text: "Language updated successfully.", timer: 1500, showConfirmButton: false });
          setEditingLanguage(null);
          fetchLanguages();
        } else {
          Swal.fire("Error", data.message || "Update failed", "error");
        }
      } catch (err) {
        // fallback to fetch if axios fails
        console.warn("api.put /languages failed, falling back to fetch:", err);
        try {
          const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/languages/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          });
          const data = await r.json();
          if (data.success) {
            Swal.fire({ icon: "success", title: "Updated!", text: "Language updated successfully.", timer: 1500, showConfirmButton: false });
            setEditingLanguage(null);
            fetchLanguages();
          } else {
            Swal.fire("Error", data.message || "Update failed", "error");
          }
        } catch (e) {
          console.error("Update fallback error:", e);
          Swal.fire("Error", e.message || "Network error", "error");
        }
      }
    } catch (e) {
      console.error("Update error:", e);
      Swal.fire("Error", e.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add New Language (protected)
  const handleAddLanguage = async () => {
    if (!newLanguage.mainCategory.trim()) {
      Swal.fire("Error", "Main category cannot be empty!", "error");
      return;
    }

    const hasValidSub = newLanguage.subLanguages.some((s) => s.name.trim() !== "");
    if (!hasValidSub) {
      Swal.fire("Error", "Please add at least one sublanguage.", "error");
      return;
    }

    setLoading(true);
    try {
      const me = await verifyAdmin();
      if (!me) {
        Swal.fire("Unauthorized", "Login required (admin).", "warning");
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/languages", newLanguage);
        const data = res.data;
        if (data.success) {
          Swal.fire("Success", "Language added successfully!", "success");
          setNewLanguage({ mainCategory: "", subLanguages: [{ name: "", description: "" }] });
          fetchLanguages();
        } else {
          Swal.fire("Error", data.message || "Add failed", "error");
        }
      } catch (err) {
        // fallback to fetch
        console.warn("api.post /languages failed, falling back to fetch:", err);
        try {
          const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/languages`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLanguage),
          });
          const data = await r.json();
          if (data.success) {
            Swal.fire("Success", "Language added successfully!", "success");
            setNewLanguage({ mainCategory: "", subLanguages: [{ name: "", description: "" }] });
            fetchLanguages();
          } else {
            Swal.fire("Error", data.message || "Add failed", "error");
          }
        } catch (e) {
          console.error("Add fallback error:", e);
          Swal.fire("Error", e.message || "Network error", "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete Language (protected)
  const handleDeleteLanguage = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the language!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#f5b301",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const me = await verifyAdmin();
      if (!me) {
        Swal.fire("Unauthorized", "Login required (admin).", "warning");
        setLoading(false);
        return;
      }

      try {
        const res = await api.delete(`/languages/${id}`);
        const data = res.data;
        if (data.success) {
          Swal.fire("Deleted!", "Language deleted successfully.", "success");
          fetchLanguages();
        } else {
          Swal.fire("Error", data.message || "Delete failed", "error");
        }
      } catch (err) {
        // fallback to fetch
        console.warn("api.delete /languages failed, falling back to fetch:", err);
        try {
          const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/languages/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          const data = await r.json();
          if (data.success) {
            Swal.fire("Deleted!", "Language deleted successfully.", "success");
            fetchLanguages();
          } else {
            Swal.fire("Error", data.message || "Delete failed", "error");
          }
        } catch (e) {
          console.error("Delete fallback error:", e);
          Swal.fire("Error", e.message || "Network error", "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#d90429] mb-6 border-b-4 border-[#f5b301] inline-block">
        Manage Poem Languages
      </h1>

      {/* Add New Language */}
      <div className="bg-white border border-yellow-300 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#1c2541] mb-4">Add New Language</h2>
        <input
          type="text"
          placeholder="Main Category"
          value={newLanguage.mainCategory}
          onChange={(e) => setNewLanguage({ ...newLanguage, mainCategory: e.target.value })}
          className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-[#f5b301] outline-none"
        />

        {newLanguage.subLanguages.map((sub, idx) => (
          <div key={idx} className="bg-gray-100 rounded-lg p-3 mb-2 border border-gray-200">
            <input
              type="text"
              placeholder="SubLanguage Name"
              value={sub.name}
              onChange={(e) => {
                const newSubs = [...newLanguage.subLanguages];
                newSubs[idx].name = e.target.value;
                setNewLanguage({ ...newLanguage, subLanguages: newSubs });
              }}
              className="w-full p-2 mb-2 border rounded focus:ring-1 focus:ring-[#f5b301]"
            />
            <textarea
              placeholder="Description"
              value={sub.description}
              onChange={(e) => {
                const newSubs = [...newLanguage.subLanguages];
                newSubs[idx].description = e.target.value;
                setNewLanguage({ ...newLanguage, subLanguages: newSubs });
              }}
              className="w-full p-2 border rounded focus:ring-1 focus:ring-[#f5b301]"
            />
          </div>
        ))}

        <div className="flex justify-between mt-3">
          <button onClick={() => setNewLanguage({ ...newLanguage, subLanguages: [...newLanguage.subLanguages, { name: "", description: "" }] })} className="px-4 py-2 bg-[#f5b301] text-[#0b132b] rounded-lg font-semibold hover:bg-[#ffd60a]">+ Add SubLanguage</button>
          <button onClick={handleAddLanguage} className="px-6 py-2 bg-[#e63946] text-white rounded-lg font-semibold hover:bg-[#ff4d5a]">Add Language</button>
        </div>
      </div>

      {/* Existing Languages */}
      <div className="grid md:grid-cols-2 gap-6">
        {languages.length === 0 ? (
          <p className="text-gray-600 text-lg">No languages found.</p>
        ) : (
          languages.slice().reverse().map((lang) => (
            <div key={lang._id} className="bg-white rounded-2xl shadow-lg border border-yellow-300 p-6 hover:shadow-2xl transition-all duration-300">
              {editingLanguage === lang._id ? (
                <>
                  <input type="text" value={updatedData.mainCategory} onChange={(e) => setUpdatedData({ ...updatedData, mainCategory: e.target.value })} className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-[#f5b301]" />
                  {updatedData.subLanguages.map((subLang, index) => (
                    <div key={index} className="bg-gray-100 p-3 mb-2 rounded border">
                      <input type="text" value={subLang.name} onChange={(e) => handleSubLangChange(index, "name", e.target.value)} placeholder="Name" className="w-full p-2 mb-2 border rounded" />
                      <textarea value={subLang.description} onChange={(e) => handleSubLangChange(index, "description", e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
                      <button onClick={() => handleDeleteSubLang(index)} className="mt-2 text-sm text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  ))}

                  <div className="flex justify-between mt-4">
                    <button onClick={handleAddSubLang} className="px-4 py-2 rounded-lg bg-[#f5b301] text-[#0b132b] font-semibold hover:bg-[#ffd60a]">+ Add SubLang</button>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingLanguage(null)} className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500">Cancel</button>
                      <button onClick={() => handleUpdate(lang._id)} disabled={loading} className="px-4 py-2 rounded-lg bg-[#e63946] text-white font-semibold hover:bg-[#ff4d5a]">{loading ? "Updating..." : "Save"}</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#1c2541] capitalize mb-2">{lang.mainCategory}</h2>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">{lang.subLanguages.map((sub, idx) => (<li key={idx}><span className="font-semibold">{sub.name}</span>: {sub.description}</li>))}</ul>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleEdit(lang)} className="w-1/2 py-2 rounded-lg bg-[#f5b301] text-[#0b132b] font-semibold hover:bg-[#ffd60a]">Edit</button>
                    <button onClick={() => handleDeleteLanguage(lang._id)} className="w-1/2 py-2 rounded-lg bg-[#e63946] text-white font-semibold hover:bg-[#ff4d5a]">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PoemLanguages;
