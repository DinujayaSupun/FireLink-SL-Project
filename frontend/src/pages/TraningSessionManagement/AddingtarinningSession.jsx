import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const MakeTrainingSession = ({ manager }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    teamMembers: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        teamMembers: form.teamMembers.split(",").map((id) => ({ staffId: id.trim() })),
        createdBy: manager.staffId,
      };

      const res = await axios.post(`${API_BASE_URL}/sessions`, payload);
      alert("Session Created ✅ ID: " + res.data.session._id);
      setForm({ title: "", description: "", date: "", venue: "", teamMembers: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating session");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📅 Make Training Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Session Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <textarea
          name="description"
          placeholder="Short Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={form.venue}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          name="teamMembers"
          placeholder="Assign Team Members (comma separated Staff IDs)"
          value={form.teamMembers}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <button
          type="submit"
          className="bg-info text-white w-full py-2 rounded-lg hover:bg-info-dark"
        >
          Create Session
        </button>
      </form>
    </div>
  );
};

export default MakeTrainingSession;
