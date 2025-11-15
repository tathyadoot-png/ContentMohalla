import React from "react";
import * as Icons from "react-icons/fa";

export default function FormInput({ field, value, onChange }) {
  const Icon = Icons[field.icon] || null;
  return (
    <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
      {Icon && <Icon className="text-gray-500 mr-2" />}
      <input
        type={field.type}
        name={field.name}
        placeholder={field.label}
        value={value}
        onChange={onChange}
        className="w-full border-none outline-none bg-transparent"
      />
    </div>
  );
}
