import React from "react";

const InputField = ({ label, name, value, handleInputChange, type = "text", icon, inputProps = {} }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      {icon} {label} *
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleInputChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info transition"
      {...inputProps}
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export default InputField;