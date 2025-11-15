// File: components/SubmitButtons.jsx
"use client";
import { FaSave, FaTimes } from "react-icons/fa";

// CHANGE: editData ki jagah isEditMode prop lein
export default function SubmitButtons({ isEditMode, handleSubmit, clearForm }) {
  return (
    <div className="mt-6 flex gap-4">
      <button
        type="button" // Change type to button to prevent default form submission
        className="bg-primary text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-opacity-90"
        onClick={handleSubmit}
      >
        <FaSave /> {isEditMode ? "Update" : "Save"} {/* Yahan change karein */}
      </button>

      <button
        type="button"
        className="bg-gray-300 text-gray-700 px-6 py-2 rounded flex items-center gap-2 hover:bg-gray-400"
        onClick={clearForm}
      >
        <FaTimes /> Clear
      </button>
    </div>
  );
}