import React, { useState } from "react";
import { FiArrowLeft, FiCalendar, FiMapPin, FiPlus, FiSettings } from "react-icons/fi";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";

const CreateSessionTab = ({ user, staffMembers, onSubmit, formData, setFormData, loading, setActiveTab }) => {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamMemberChange = (staffId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(staffId)
        ? prev.teamMembers.filter(id => id !== staffId)
        : [...prev.teamMembers, staffId]
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <InputField label="Session Title" name="title" value={formData.title} handleInputChange={handleInputChange} />
      <TextAreaField label="Description" name="description" value={formData.description} handleInputChange={handleInputChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Date & Time"
          name="date"
          value={formData.date}
          handleInputChange={handleInputChange}
          type="datetime-local"
          icon={<FiCalendar className="mr-2 text-fire" />}
          inputProps={{ min: new Date().toISOString().slice(0,16) }}
        />
        <InputField
          label="Venue"
          name="venue"
          value={formData.venue}
          handleInputChange={handleInputChange}
          icon={<FiMapPin className="mr-2 text-fire" />}
        />
      </div>

      {/* Team Members */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Members *</label>
        <select
          value={formData.selectedDropdownId || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            if (selectedId && !formData.teamMembers.includes(selectedId)) {
              handleTeamMemberChange(selectedId);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">-- Select staff --</option>
          {staffMembers.map(staff => (
            <option key={staff.staffId} value={staff.staffId}>
              {staff.name} ({staff.staffId})
            </option>
          ))}
        </select>

        {/* Display selected team members */}
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.teamMembers.map((id, idx) => {
            const staff = staffMembers.find(s => s.staffId === id);
            const displayName = staff ? `${staff.name} (${staff.staffId})` : id;
            return (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                {displayName}
                <button type="button" onClick={() => handleTeamMemberChange(id)} className="text-red-500 font-bold">×</button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Cancel
        </button>
        <button
          type="submit"
          disabled={loading || formData.teamMembers.length === 0}
          className="px-8 py-3 bg-gradient-to-r from-fire to-fire text-white rounded-lg hover:from-fire-dark hover:to-fire disabled:opacity-50 transition flex items-center shadow-md"
        >
          {loading ? <><FiSettings className="animate-spin mr-2" /> Creating...</> : <><FiPlus className="mr-2" /> Create Session</>}
        </button>
      </div>
    </form>
  );
};

export default CreateSessionTab;
