import React, { useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import { FiSend, FiList } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";

const AttendanceTab = ({ sessions }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedNumber, setSelectedNumber] = useState("");

  const fetchAttendance = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/attendance/${sessionId}`);
      const data = await res.json();
      if (data.status === "ok") {
        setAttendanceData(prev => ({ ...prev, [sessionId]: data.attendance }));
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleSendReport = (mobileNumber, session) => {
    if (!mobileNumber) {
      alert("Please enter a mobile number");
      return;
    }

    const message =
      `Attendance report for session "${session.title}" (ID: ${session._id}):\n` +
      (attendanceData[session._id]?.length > 0
        ? attendanceData[session._id].map(a => `${a.staffName} (${a.staffId})`).join("\n")
        : "No attendance yet.");

    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${mobileNumber}&text=${encodeURIComponent(message)}`;
    window.open(WhatsAppUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <FiList className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500">No sessions created yet.</p>
        </div>
      ) : (
        sessions.map(session => (
          <div key={session._id} className="border border-gray-300 rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
            <div className="mt-4">
              <QRCodeGenerator sessionId={session._id} />
            </div>
            <p className="text-sm text-gray-600 mb-2">Session ID: {session._id}</p>

            <button
              onClick={() => fetchAttendance(session._id)}
              className="px-4 py-2 bg-info text-white rounded-lg mb-2 hover:bg-info-dark transition text-sm"
            >
              Load Attendance
            </button>

            {attendanceData[session._id]?.length > 0 ? (
              <div className="space-y-1">
                {attendanceData[session._id].map((att, idx) => (
                  <div key={idx} className="flex justify-between items-center px-3 py-1 bg-gray-100 rounded">
                    <span>{att.name} ({att.staffId})</span>
                    <span>{new Date(att.attendedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No attendance yet.</p>
            )}

            {/* WhatsApp report */}
            <div className="mt-3 flex gap-2 items-center">
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={selectedNumber}
                onChange={e => setSelectedNumber(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info focus:border-transparent transition flex-1"
              />
              <button
                onClick={() => handleSendReport(selectedNumber, session)}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition flex items-center"
              >
                <FiSend className="mr-2" /> Send Report
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AttendanceTab;
