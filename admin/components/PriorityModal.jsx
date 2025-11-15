"use client";
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const SEPARATOR = "__SEP__";

export default function PriorityModal({ isOpen, onClose, newsItem, onSave }) {
  const [priorities, setPriorities] = useState({});

  useEffect(() => {
    if (!newsItem) return;

    const newPriorities = {};
    newsItem.categories?.forEach((cat) => {
      const catName = cat.name;
      if (cat.section) {
        Object.entries(cat.section).forEach(([key, sec]) => {
          if (sec.show) {
            const compoundKey = [newsItem._id, catName, key].join(SEPARATOR);
            newPriorities[compoundKey] = sec.priority || "";
          }
        });
      } else {
        const compoundKey = [newsItem._id, catName, "priority"].join(SEPARATOR);
        newPriorities[compoundKey] = cat.priority || "";
      }
    });
    setPriorities(newPriorities);
  }, [newsItem]);

  const handleChange = (key, value) => {
    setPriorities((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave(priorities);
    onClose();
  };

  if (!isOpen || !newsItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[calc(100vh-100px)] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-primary">Edit Priorities</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-180px)] pr-2">
          {newsItem.categories?.map((cat, catIndex) => (
            <div key={catIndex} className="mb-4">
              <h3 className="text-md font-semibold text-accent capitalize mb-2">
                {cat.name.replace("-", " ")}
              </h3>

              {cat.section ? (
                Object.entries(cat.section)
                  .filter(([_, sec]) => sec?.show)
                  .map(([secKey]) => {
                    const inputKey = [newsItem._id, cat.name, secKey].join(SEPARATOR);
                    return (
                      <div key={secKey} className="flex items-center gap-2 mb-2">
                        <label className="w-32 text-sm text-gray-700">{secKey}</label>
                        <input
                          type="number"
                          value={priorities[inputKey] || ""}
                          onChange={(e) => handleChange(inputKey, e.target.value)}
                          className="border rounded-lg px-3 py-1 w-24 focus:ring-2 focus:ring-primary focus:outline-none"
                          placeholder="Priority"
                          min="1"
                        />
                      </div>
                    );
                  })
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <label className="w-32 text-sm text-gray-700">priority</label>
                  <input
                    type="number"
                    value={
                      priorities[[newsItem._id, cat.name, "priority"].join(SEPARATOR)] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        [newsItem._id, cat.name, "priority"].join(SEPARATOR),
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-3 py-1 w-24 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Priority"
                    min="1"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
