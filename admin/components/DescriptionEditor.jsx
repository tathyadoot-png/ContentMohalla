'use client';
import { FaUser, FaAlignLeft, FaClock, FaMapMarkerAlt, FaQuestion, FaCog } from 'react-icons/fa';

export default function News5W1HForm({ description, handleDescriptionChange }) {
  const fields = [
    { key: 'who', label: 'Who', icon: <FaUser /> },
    { key: 'what', label: 'What', icon: <FaAlignLeft /> },
    { key: 'when', label: 'When', icon: <FaClock /> },
    { key: 'where', label: 'Where', icon: <FaMapMarkerAlt /> },
    { key: 'why', label: 'Why', icon: <FaQuestion /> },
    { key: 'how', label: 'How', icon: <FaCog /> },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map(({ key, label, icon }) => (
        <div key={key} className="flex flex-col">
          <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
            {icon} {label}
          </label>
          <textarea
            value={description[key] || ''}
            onChange={(e) =>
              handleDescriptionChange({
                ...description,
                [key]: e.target.value,
              })
            }
            placeholder={`Enter ${label.toLowerCase()}...`}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200
                       hover:border-primary"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}
