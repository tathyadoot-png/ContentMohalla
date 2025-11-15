"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

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

  const getToken = () => Cookies.get("adminToken") || Cookies.get("token") || null;

  // ✅ Fetch all languages (public)
  const fetchLanguages = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/languages`);
      const data = await res.json();

      if (data.success && Array.isArray(data.languages)) {
        setLanguages(data.languages);
      } else {
        setLanguages([]);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // ✅ Handle edit
  const handleEdit = (language) => {
    setEditingLanguage(language._id);
    setUpdatedData({
      mainCategory: language.mainCategory,
      subLanguages: [...language.subLanguages],
    });
  };

  // ✅ Handle input change for subLanguages
  const handleSubLangChange = (index, field, value) => {
    const newSubLangs = [...updatedData.subLanguages];
    newSubLangs[index][field] = value;
    setUpdatedData({ ...updatedData, subLanguages: newSubLangs });
  };

  // ✅ Add new sublanguage (in edit mode)
  const handleAddSubLang = () => {
    setUpdatedData({
      ...updatedData,
      subLanguages: [...updatedData.subLanguages, { name: "", description: "" }],
    });
  };

  // ✅ Delete sublanguage (in edit mode)
  const handleDeleteSubLang = (index) => {
    const newSubLangs = updatedData.subLanguages.filter((_, i) => i !== index);
    setUpdatedData({ ...updatedData, subLanguages: newSubLangs });
  };

  // ✅ Update Language
  const handleUpdate = async (id) => {
    const token = getToken();
    if (!token) {
      Swal.fire("Unauthorized", "Login required to update language.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/languages/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: "success", title: "Updated!", text: "Language updated successfully.", timer: 1500, showConfirmButton: false });
        setEditingLanguage(null);
        fetchLanguages();
      } else {
        Swal.fire("Error", data.message || "Update failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add New Language
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

    const token = getToken();
    if (!token) {
      Swal.fire("Unauthorized", "Login required to add language.", "warning");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/languages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLanguage),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Success", "Language added successfully!", "success");
        setNewLanguage({ mainCategory: "", subLanguages: [{ name: "", description: "" }] });
        fetchLanguages();
      } else {
        Swal.fire("Error", data.message || "Add failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Network error", "error");
    }
  };

  // ✅ Delete Language
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

    const token = getToken();
    if (!token) {
      Swal.fire("Unauthorized", "Login required to delete language.", "warning");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/languages/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Deleted!", "Language deleted successfully.", "success");
        fetchLanguages();
      } else {
        Swal.fire("Error", data.message || "Delete failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Network error", "error");
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
