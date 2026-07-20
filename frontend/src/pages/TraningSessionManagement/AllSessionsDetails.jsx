// src/Components/SessionsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { FiClock, FiMapPin, FiUsers, FiHash } from "react-icons/fi";
import Sidebar from "../UserManagement/Sidebar";
import { API_BASE_URL } from "../../config/api";

const SessionsList = ({ userFromProps }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQR, setActiveQR] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time

  const user =
    userFromProps || (window.history.state && window.history.state.usr) || null;

  // Update current time every minute to handle session status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/sessions`);
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openQR = (sessionId) => {
    setActiveQR(sessionId);
  };

  const closeQR = () => {
    setActiveQR(null);
  };

  // Helper to determine session status
  const sessionStatus = (sessionDate) => {
    const sessionTime = new Date(sessionDate);
    const expiryTime = new Date(sessionTime.getTime() + 30 * 60000); // +30 mins
    
    if (currentTime < sessionTime) return "coming"; // before session
    if (currentTime >= sessionTime && currentTime <= expiryTime) return "active"; // session ongoing
    return "expired"; // past 30 mins
  };

  if (loading) return <div className="p-6 text-white">Loading sessions...</div>;
  if (error) return <div className="p-6 text-fire-300">{error}</div>;

  return (
    
    <div className="min-h-screen bg-navy p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl text-white font-bold">Training Sessions</h1>

        {sessions.length === 0 && (
          <div className="bg-white rounded p-6">No sessions found.</div>
        )}

        {sessions.map((s) => {
          const status = sessionStatus(s.date);
          
          return (
            <div
              key={s._id}
              className="bg-white rounded-lg p-6 shadow flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{s.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiHash /> {s._id}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {new Date(s.date).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin /> {s.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers /> {s.teamMembers?.length || 0} assigned
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status === "coming" ? "bg-amber-100 text-amber-dark" :
                    status === "active" ? "bg-success-100 text-success-dark" :
                    "bg-fire-100 text-fire-dark"
                  }`}>
                    {status === "coming" ? "Upcoming" : 
                     status === "active" ? "Active" : "Expired"}
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col gap-2 items-stretch">
                {/* Only show QR button for active sessions */}
                {status === "active" && (
                  <button
                    onClick={() => openQR(s._id)}
                    className="px-4 py-2 bg-info-dark text-white rounded hover:bg-info"
                  >
                    Show QR for attendance
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* QR Modal */}
        {activeQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">
                Attendance
              </h3>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded mb-4">
                {(() => {
                  const s = sessions.find((sess) => sess._id === activeQR);
                  const status = sessionStatus(s.date);
                  
                  if (status === "coming") {
                    return (
                      <div className="text-center">
                        <span className="text-amber-dark font-semibold block mb-2">
                          Session hasn't started yet
                        </span>
                        <p className="text-sm text-gray-600">
                          Starts at: {new Date(s.date).toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  
                  if (status === "expired") {
                    return (
                      <div className="text-center">
                        <span className="text-fire-dark font-semibold block mb-2">
                          Session has expired
                        </span>
                        <p className="text-sm text-gray-600">
                          Attendance can only be marked during the session or within 30 minutes after it starts.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Scan with your phone to confirm attendance.
                      </p>
                      <QRCode
                        value={`${API_BASE_URL}/attendance?sessionId=${activeQR}`}
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-center mt-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={closeQR}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
