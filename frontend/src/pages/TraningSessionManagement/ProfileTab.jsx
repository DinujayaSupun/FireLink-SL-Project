import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiList, FiMapPin, FiHash, FiMail, FiShield, FiCheckCircle } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";

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

  const todayStr = new Date().toDateString();

  // Categorize sessions
  const upcomingSessions = sessions.filter(s => new Date(s.date) > new Date());
  const expiredSessions = sessions.filter(s => new Date(s.date) < new Date());
  const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === todayStr);

  // Highlight calendar days
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toDateString();
      if (todaySessions.some(s => new Date(s.date).toDateString() === dateStr)) {
        return "bg-gray-400 text-white rounded-full";
      }
      if (upcomingSessions.some(s => new Date(s.date).toDateString() === dateStr)) {
        return "bg-blue-300 text-white rounded-full";
      }
      if (expiredSessions.some(s => new Date(s.date).toDateString() === dateStr)) {
        return "bg-red-300 text-white rounded-full";
      }
    }
  };

  const renderTable = (title, data) => (
    <div className="overflow-x-auto mt-6">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Venue</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map(session => (
              <tr key={session._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{session.title}</td>
                <td className="border border-gray-300 px-4 py-2">{session.venue}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(session.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No sessions.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FiList className="mr-2" /> Training Session Dashboard
      </h3>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      {renderTable("Today's Sessions", todaySessions)}
      {renderTable("Upcoming Sessions", upcomingSessions)}
      {renderTable("Expired Sessions", expiredSessions)}
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
