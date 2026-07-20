import React from "react";

const TextAreaField = ({ label, name, value, handleInputChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
    <textarea
      name={name}
      value={value}
      onChange={handleInputChange}
      rows={4}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info transition"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export default TextAreaField;