import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiUser, FiCalendar, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const AttendanceForm = () => {
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]); // ✅ fixed: declare state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all sessions for the dropdown
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions`);
        if (res.data.sessions) setSessions(res.data.sessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      alert("Please select a session!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/attendance/mark`, {
        staffId,
        name,
        sessionId,
      });
      setMessage(res.data.status === "ok" ? "Attendance marked ✅" : res.data.err);
    } catch (err) {
      setMessage("Error marking attendance ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center text-navy hover:text-gray-700 transition"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <h2 className="text-2xl font-bold text-center text-navy mb-6">
          Mark Attendance
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session Dropdown */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
              required
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.title} ({new Date(session.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Staff ID */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
              required
            />
          </div>

          {/* Name */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-amber text-white rounded-md hover:bg-amber transition font-semibold"
          >
            {loading ? "Submitting..." : <>
              <FiCheck /> Submit
            </>}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
