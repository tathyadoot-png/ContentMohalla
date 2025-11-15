// File: components/MediaUpload.jsx
'use client';
import { FaImage, FaVideo, FaMicrophone } from "react-icons/fa";
import { useState, useEffect } from "react";

// CHANGE: existingImageUrl ko props mein add karein
export default function MediaUpload({ formData, handleChange, existingImageUrl }) {
  const [imageName, setImageName] = useState("");
  const [audioName, setAudioName] = useState("");
  
  // NEW: Jab existingImageUrl badle to imageName update karein
  useEffect(() => {
    if (existingImageUrl) {
        setImageName("Current image loaded");
    }
  }, [existingImageUrl]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === "image") setImageName(files[0].name);
      if (name === "audio") setAudioName(files[0].name);
    }
    handleChange(e);
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"><FaImage className="text-primary" /> Image</label>
        <label className="block w-full border border-gray-300 rounded px-3 py-2 cursor-pointer text-gray-500 hover:border-primary">
          {imageName || "Choose Image"}
          <input type="file" name="image" onChange={handleFileChange} accept="image/*" className="hidden"/>
        </label>
        {/* NEW: Image Preview Logic */}
        <div className="mt-2">
            {formData.image ? (
                <img src={URL.createObjectURL(formData.image)} alt="New Preview" className="w-full h-40 object-cover rounded-md border"/>
            ) : existingImageUrl ? (
                <img src={existingImageUrl} alt="Current Image" className="w-full h-40 object-cover rounded-md border"/>
            ) : null}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"><FaVideo className="text-primary" /> Video URL</label>
        <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://example.com/video" className="border border-gray-300 rounded px-3 py-2 w-full"/>
      </div>
      <div>
        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"><FaMicrophone className="text-primary" /> Audio</label>
        <label className="block w-full border border-gray-300 rounded px-3 py-2 cursor-pointer text-gray-500 hover:border-primary">
          {audioName || "Choose Audio"}
          <input type="file" name="audio" onChange={handleFileChange} accept="audio/*" className="hidden"/>
        </label>
      </div>
    </div>
  );
}