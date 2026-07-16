import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { API_BASE_URL } from "../../config/api";
import "react-calendar/dist/Calendar.css";
import { 
  FiHash, FiMail, FiShield, FiCheckCircle, 
  FiList, FiCalendar as FiCal, FiMapPin 
} from "react-icons/fi";

// ----------- Profile Section -----------
const ProfileTab = ({ user }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", textLabel: "text-blue-700", textValue: "text-blue-900" },
    green: { bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-100", textLabel: "text-green-700", textValue: "text-green-900" },
    red: { bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-100", textLabel: "text-red-700", textValue: "text-red-900" },
  };

  const infoItems = [
    { icon: <FiHash />, label: "Staff ID", value: user.staffId, color: "blue" },
    { icon: <FiMail />, label: "Email", value: user.gmail, color: "blue" },
    { icon: <FiShield />, label: "Position", value: user.position, color: "blue" },
    { icon: <FiCheckCircle />, label: "Status", value: user.status, color: user.status === "Active" ? "green" : "red" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {infoItems.map((info, i) => {
        const colors = colorMap[info.color];
        return (
          <div
            key={i}
            className={`${colors.bg} ${colors.border} p-5 rounded-xl flex items-center border hover:shadow-lg transition`}
          >
            <div className={`${colors.iconBg} p-3 rounded-full mr-4 flex items-center justify-center text-xl`}>
              {info.icon}
            </div>
            <div>
              <p className={`text-sm font-medium ${colors.textLabel}`}>{info.label}</p>
              <p className={`text-lg font-semibold ${colors.textValue}`}>{info.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ----------- Dashboard Section -----------
const TrainingSessionDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`);
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // Highlight calendar days
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const sessionDates = sessions.map((s) => new Date(s.date).toDateString());
      const today = new Date().toDateString();
      if (sessionDates.includes(date.toDateString())) {
        return date < new Date() ? "bg-red-300 text-white rounded-full" : "bg-blue-300 text-white rounded-full";
      }
      if (date.toDateString() === today) {
        return "bg-gray-400 text-white rounded-full";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FiList className="mr-2" /> Training Session Dashboard
      </h3>

      {/* Calendar */}
      <div className="mb-6">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </div>

      {/* Session Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Session ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Venue</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{session._id}</td>
                <td className="border border-gray-300 px-4 py-2">{session.title}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(session.date).toLocaleString()}</td>
                <td className="border border-gray-300 px-4 py-2 flex items-center">
                  <FiMapPin className="mr-1" /> {session.venue}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------- Combined Profile Page -----------
const ProfilePage = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>

      {/* Profile Info */}
      <ProfileTab user={user} />

      {/* Training Dashboard */}
      <TrainingSessionDashboard />
    </div>
  );
};

export default ProfilePage;
