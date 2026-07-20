import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Sidebar from "../UserManagement/Sidebar";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const FighterDashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [schedules, setSchedules] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [shiftModal, setShiftModal] = useState({ open: false, shiftId: null, note: "" });
  const [trainingModal, setTrainingModal] = useState({ open: false, title: "", note: "" });

  const navigate = useNavigate();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch shifts
      const { data: scheduleData } = await axios.get(`${API_BASE_URL}/shift-schedules`);
      const ownSchedules = scheduleData.schedules.filter(s =>
        s.members.some(m => m._id === user._id)
      );
      setSchedules(ownSchedules);

      // Fetch training sessions
      try {
        const { data: trainingData } = await axios.get(`${API_BASE_URL}/training-sessions`);
        // Filter sessions where the fighter is a member
        const ownSessions = trainingData.sessions.filter(t =>
          t.teamMembers.includes(user._id)
        );
        setTrainingSessions(ownSessions);
      } catch (err) {
        console.warn("No training sessions endpoint found or returned 404");
        setTrainingSessions([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setSchedules([]);
      setTrainingSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) return <div className="p-6 text-white">Please log in to view your dashboard.</div>;

  const renderTileContent = ({ date }) => {
    const dateStr = date.toDateString();
    const dayShifts = schedules.filter(s => new Date(s.date).toDateString() === dateStr);
    const dayTraining = trainingSessions.filter(t => new Date(t.date).toDateString() === dateStr);

    return (
      <div className="mt-1 flex flex-col gap-1 text-xs">
        {dayShifts.map(s => (
          <span key={s._id} className="bg-info-100 text-info-dark rounded px-1">
            {s.vehicle} ({s.shiftType})
          </span>
        ))}
        {dayTraining.map(t => (
          <span key={t._id} className="bg-success-100 text-success-dark rounded px-1">
            {t.title}
          </span>
        ))}
      </div>
    );
  };

  const openShiftModal = (shiftId) => setShiftModal({ open: true, shiftId, note: "" });
  const closeShiftModal = () => setShiftModal({ ...shiftModal, open: false });
  const closeTrainingModal = () => setTrainingModal({ ...trainingModal, open: false });

  const submitShiftRequest = async () => {
    try {
      await axios.post(`${API_BASE_URL}/shift-change-requests`, {
        shiftId: shiftModal.shiftId,
        fighterId: user._id,
        note: shiftModal.note,
      });
      alert("Shift change request submitted!");
      closeShiftModal();
    } catch (err) {
      console.error(err);
      alert("Error submitting shift request");
    }
  };

  const submitTrainingRequest = async () => {
    try {
      await axios.post(`${API_BASE_URL}/training-requests`, {
        fighterId: user._id,
        title: trainingModal.title,
        note: trainingModal.note,
      });
      alert("Training session request submitted!");
      closeTrainingModal();
    } catch (err) {
      console.error(err);
      alert("Error submitting training request");
    }
  };

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Fighter Dashboard</h1>

        {loading ? (
          <div className="text-white">Loading your shifts and sessions...</div>
        ) : (
          <>
            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Calendar</h2>
              <Calendar value={selectedDate} onChange={setSelectedDate} tileContent={renderTileContent} />
            </div>

            {/* Shifts */}
            <div className="bg-white p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">My Shifts</h2>
              {schedules.length === 0 ? (
                <p>No shifts assigned.</p>
              ) : (
                schedules.map(s => (
                  <div key={s._id} className="border p-3 rounded mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{s.vehicle} - {s.shiftType}</p>
                      <p className="text-sm text-gray-600">{new Date(s.date).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => openShiftModal(s._id)}
                      className="bg-success text-white px-3 py-1 rounded hover:bg-success-dark"
                    >
                      Request Shift Change
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Training Sessions */}
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">My Training Sessions</h2>
              {trainingSessions.length === 0 ? (
                <p>No training sessions assigned.</p>
              ) : (
                trainingSessions.map(t => (
                  <div key={t._id} className="border p-3 rounded mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-sm text-gray-600">{new Date(t.date).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/update-session/${t._id}`)}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setTrainingModal({ open: true, title: t.title, note: "" })}
                        className="bg-info text-white px-3 py-1 rounded hover:bg-info-dark"
                      >
                        Request Training Session
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Shift Request Modal */}
        {shiftModal.open && (
          <Modal
            title="Request Shift Change"
            value={shiftModal.note}
            onChange={(e) => setShiftModal({ ...shiftModal, note: e.target.value })}
            onClose={closeShiftModal}
            onSubmit={submitShiftRequest}
            placeholder="Explain reason for shift change..."
            submitText="Submit"
            color="green"
          />
        )}

        {/* Training Request Modal */}
        {trainingModal.open && (
          <Modal
            title="Request Training Session"
            value={trainingModal.note}
            onChange={(e) => setTrainingModal({ ...trainingModal, note: e.target.value })}
            extraInput={{
              value: trainingModal.title,
              onChange: (e) => setTrainingModal({ ...trainingModal, title: e.target.value }),
              placeholder: "Training session title",
            }}
            onClose={closeTrainingModal}
            onSubmit={submitTrainingRequest}
            placeholder="Explain reason for training..."
            submitText="Submit"
            color="blue"
          />
        )}
      </div>
    </div>
  );
};

// Reusable Modal
const Modal = ({ title, value, onChange, extraInput, onClose, onSubmit, placeholder, submitText, color }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {extraInput && (
        <input
          type="text"
          value={extraInput.value}
          onChange={extraInput.onChange}
          placeholder={extraInput.placeholder}
          className="w-full p-3 border rounded mb-3"
        />
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border rounded mb-4"
        rows="4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
        <button onClick={onSubmit} className={`px-4 py-2 text-white rounded hover:opacity-90`} style={{ backgroundColor: color === "green" ? "#16a34a" : "var(--color-info-dark)" }}>
          {submitText}
        </button>
      </div>
    </div>
  </div>
);

export default FighterDashboard;
