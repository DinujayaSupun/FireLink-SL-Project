import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Sidebar from "./Sidebar";
import ProfileTab from "./ProfileTab";
import CreateSessionTab from "./CreateSessionTab";
import SessionsTab from "./SessionsTab";
import AttendanceTab from "./AttendanceTab";
import { API_BASE_URL } from "../../config/api";

const TrainingSessionManager = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(
    location.state?.user || JSON.parse(localStorage.getItem("user")) || null
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [staffMembers, setStaffMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    teamMembers: [],
    createdBy: user?.staffId || "",
  });

  useEffect(() => {
    if (!user) navigate("/staff-login");
    else localStorage.setItem("user", JSON.stringify(user));
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "create") fetchStaffMembers();
    if (activeTab === "sessions" || activeTab === "attendance") fetchSessions();
  }, [activeTab]);

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/staff-members`);
      const data = await res.json();
      if (data.users) setStaffMembers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`);
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await fetch(`${API_BASE_URL}/sessions/${id}`, { method: "DELETE" });
        setSessions((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePrint = () => window.print();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setFormData({
          title: "",
          description: "",
          date: "",
          venue: "",
          teamMembers: [],
          createdBy: user.staffId,
        });
        setActiveTab("sessions");
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>No user data. Please login again.</div>;

  // ---- Inline Calendar Tile Styling ----
  const today = new Date().toDateString();
  const upcomingSessions = sessions.filter(s => new Date(s.date) > new Date());
  const expiredSessions = sessions.filter(s => new Date(s.date) < new Date());
  const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toDateString();
      let bgColor = "";

      if (todaySessions.some(s => new Date(s.date).toDateString() === dateStr)) bgColor = "#9ca3af"; // gray
      else if (upcomingSessions.some(s => new Date(s.date).toDateString() === dateStr)) bgColor = "#3b82f6"; // blue
      else if (expiredSessions.some(s => new Date(s.date).toDateString() === dateStr)) bgColor = "#ef4444"; // red

      if (bgColor)
        return (
          <div
            style={{
              backgroundColor: bgColor,
              color: "white",
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              lineHeight: "2rem",
              textAlign: "center",
              margin: "auto",
            }}
          >
            {date.getDate()}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Sidebar */}
      <div className="w-full border-b bg-gray-50">
        <div className="flex justify-center">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} topLayout user={user} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "create" && (
          <CreateSessionTab
            user={user}
            staffMembers={staffMembers}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "sessions" && (
          <>
            <div className="mb-6">
              <Calendar
                onChange={() => {}}
                value={new Date()}
                tileContent={tileContent}
              />
            </div>
            <SessionsTab
              sessions={sessions}
              handleDeleteSession={handleDeleteSession}
              handlePrint={handlePrint}
            />
          </>
        )}
        {activeTab === "attendance" && <AttendanceTab sessions={sessions} />}
      </div>
    </div>
  );
};

export default TrainingSessionManager;

