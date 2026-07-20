// Components/UpdateSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import {
  FiArrowLeft,
  FiSave,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiFileText,
} from "react-icons/fi";

const UpdateSession = () => {
  const { id } = useParams(); // get session id from route
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    teamMembers: [],
  });
  const [newMember, setNewMember] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch session details on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions/${id}`);
        const session = res.data.session;
        setInputs({
          title: session.title || "",
          description: session.description || "",
          date: session.date ? session.date.slice(0, 16) : "", // format for datetime-local
          venue: session.venue || "",
  teamMembers: session.teamMembers || [],
        });
      } catch (err) {
        console.error("Error fetching session:", err);
        alert("Failed to fetch session details.");
      }
    };
    fetchSession();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Add a team member
  const addTeamMember = () => {
    if (newMember && !inputs.teamMembers.includes(newMember)) {
      setInputs((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newMember],
      }));
      setNewMember("");
    }
  };

  // Remove a team member
  const removeTeamMember = (member) => {
    setInputs((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== member),
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await axios.put(`${API_BASE_URL}/sessions/${id}`, {
      title: inputs.title,
      description: inputs.description,
      date: inputs.date,
      venue: inputs.venue,
      teamMembers: inputs.teamMembers, // Just send the array directly
    });
    alert("Session updated successfully!");
    navigate(-1);
  } catch (err) {
    console.error("Error updating session:", err);
    alert("Failed to update session.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-navy py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-6 hover:text-gray-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-fire text-white p-6">
            <h1 className="text-3xl font-bold text-center">
              Update Training Session
            </h1>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiFileText className="mr-2" /> Session Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={inputs.title}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiFileText className="mr-2" /> Description
                </label>
                <textarea
                  name="description"
                  value={inputs.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                ></textarea>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiCalendar className="mr-2" /> Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={inputs.date}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiMapPin className="mr-2" /> Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={inputs.venue}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Team Members */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                  <FiUsers className="mr-2" /> Team Members
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter staff ID"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fire focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="px-4 py-2 bg-fire text-white rounded-lg hover:bg-fire-dark transition"
                  >
                    Add
                  </button>
                </div>
                {inputs.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {inputs.teamMembers.map((member, index) => (
                      <span
                        key={index}
                        className="bg-info-100 text-info-dark px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {member}
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member)}
                          className="text-fire font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition flex items-center"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-fire text-white rounded-lg shadow hover:bg-fire-dark transition flex items-center"
              >
                {loading ? "Updating..." : <><FiSave className="mr-2" /> Update Session</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateSession;
