'use client'
import {
  FaHeading,
  FaLink,
  FaCalendarAlt,
  FaUser,
  FaPen,
  FaBullhorn,
  FaMapMarkerAlt,
} from 'react-icons/fa'

export default function TopInfo({ formData, handleChange, editors }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <FaHeading className="text-primary" />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title || ''}
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      {/* Slug */}
      <div className="flex items-center gap-2">
        <FaLink className="text-primary" />
        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={formData.slug || ''}
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      {/* CreatedAt (Date + Time) */}
      <div className="flex items-center gap-2">
        <FaCalendarAlt className="text-primary" />
        <input
          type="datetime-local"
          name="createdAt"
          value={
            formData.createdAt
              ? new Date(formData.createdAt)
                  .toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' })
                  .replace(' ', 'T')
              : ''
          }
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* By Line */}
      <div className="flex items-center gap-2">
        <FaPen className="text-primary" />
        <input
          type="text"
          name="byLine"
          placeholder="By Line"
          value={formData.byLine || ''}
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Desk Location */}
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-primary" />
        <input
          type="text"
          name="deskLocation"
          placeholder="Desk Location"
          value={formData.deskLocation || ''}
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Author Dropdown */}
      <div className="flex items-center gap-2">
        <FaUser className="text-primary" />
        <select
          name="authoredBy"
          value={formData.authoredBy || ''}
          onChange={handleChange}
          className="border border-custom rounded px-3 py-2 w-full"
        >
          <option value="">Select Author</option>
          {editors.map((ed) => (
            <option key={ed._id} value={ed._id}>
              {ed.name} {ed.email ? `(${ed.email})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Breaking News */}
      <div className="flex items-center gap-2">
        <FaBullhorn className="text-primary" />
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
          <input
            type="checkbox"
            name="isBreaking"
            checked={formData.isBreaking || false}
            onChange={handleChange}
          />
          Mark as <span className="font-semibold">Breaking News</span>
        </label>
      </div>
    </div>
  )
}
