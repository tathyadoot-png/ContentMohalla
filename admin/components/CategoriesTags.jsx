'use client'
import { useState } from 'react'
import { FaTags, FaSortNumericUp } from 'react-icons/fa'

export default function CategoriesTags({
  formData,
  setFormData,
  categoryList,
  excludedCategories,
}) {
  const [tagInput, setTagInput] = useState('')
  const defaultSections = {
    main: { show: false, priority: 1 },
    popular: { show: false, priority: 1 },
    latest: { show: false, priority: 1 },
    other: { show: false, priority: 1 },
  }

  const handleCategorySelect = (cat, checked) => {
    setFormData((prev) => {
      const already = prev.categories.find((c) => c.name === cat)
      if (checked && !already) {
        const isSectionless = excludedCategories.includes(
          cat.replace(/-/g, ' ').toLowerCase()
        )
        return {
          ...prev,
          categories: [
            ...prev.categories,
            isSectionless
              ? { name: cat, priority: '' }
              : { name: cat, priority: '', section: { ...defaultSections } },
          ],
        }
      } else if (!checked) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c.name !== cat),
        }
      }
      return prev
    })
  }

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] })
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && tagInput === '') {
      setFormData({ ...formData, tags: formData.tags.slice(0, -1) })
    }
  }

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="mt-6">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Categories
      </label>
      <div className="flex flex-wrap gap-2">
        {categoryList.map((cat) => (
          <label
            key={cat}
            className={`cursor-pointer px-3 py-1 rounded-full border ${
              formData.categories.some((c) => c.name === cat)
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <input
              type="checkbox"
              value={cat}
              checked={formData.categories.some((c) => c.name === cat)}
              onChange={(e) => handleCategorySelect(cat, e.target.checked)}
              className="hidden"
            />
            {cat}
          </label>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {formData.categories.map((catObj, idx) => {
          const isSectionless = excludedCategories.includes(
            catObj.name.replace(/-/g, ' ').toLowerCase()
          )
          return (
            <div key={catObj.name} className="p-4 border rounded bg-gray-50">
              <h4 className="font-semibold mb-2">
                {catObj.name.replace(/-/g, ' ')}
              </h4>

              {/* Priority only for sectionless */}
              {isSectionless && (
                <div className="flex items-center gap-2 mb-2">
                  <FaSortNumericUp className="text-primary" />
                  <select
                    value={catObj.priority || ''}
                    onChange={(e) => {
                      const updated = [...formData.categories]
                      updated[idx].priority = e.target.value
                      setFormData({ ...formData, categories: updated })
                    }}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">-- Select Priority --</option>
                    {[...Array(10).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        Priority {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section controls */}
              {!isSectionless &&
                ['main', 'popular', 'latest', 'other'].map((key) => {
                  const sectionData = catObj.section?.[key] || defaultSections[key]
                  return (
                    <div key={key} className="flex flex-col gap-1 mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sectionData.show || false}
                          onChange={(e) => {
                            const updated = [...formData.categories]
                            if (!updated[idx].section) updated[idx].section = { ...defaultSections }
                            updated[idx].section[key] = {
                              ...updated[idx].section[key],
                              show: e.target.checked,
                            }
                            setFormData({ ...formData, categories: updated })
                          }}
                        />
                        Show in {key}
                      </label>
                      {sectionData.show && (
                        <input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Priority"
                          value={sectionData.priority || ''}
                          onChange={(e) => {
                            const updated = [...formData.categories]
                            updated[idx].section[key] = {
                              ...updated[idx].section[key],
                              priority: Number(e.target.value),
                              show: true,
                            }
                            setFormData({ ...formData, categories: updated })
                          }}
                          className="border px-2 py-1 rounded w-32 text-sm"
                        />
                      )}
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>

      {/* Tags */}
      <div className="mt-4">
        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
          <FaTags className="text-primary" /> Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-primary text-white px-3 py-1 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-xs bg-red-500 px-1 rounded"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type a tag and press Enter or comma"
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )
}
