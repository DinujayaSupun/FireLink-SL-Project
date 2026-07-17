import React from "react";
import { FiUser, FiPlus, FiCheckCircle, FiList } from "react-icons/fi";

const Sidebar = ({ activeTab, setActiveTab, topLayout }) => {
  const tabs = [
    { name: "profile", icon: <FiUser />, label: "" },
    { name: "create", icon: <FiPlus />, label: "Create Session" },
    { name: "sessions", icon: <FiList />, label: "View Sessions" },
    { name: "attendance", icon: <FiCheckCircle />, label: "Attendance" },
  ];

  return (
    <div
      className={`flex ${
        topLayout ? "flex-row justify-center" : "flex-col w-60 min-h-screen p-4"
      } bg-gray-50`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`flex items-center gap-2 px-4 py-3 m-2 rounded-lg font-medium transition ${
            activeTab === tab.name
              ? "bg-fire text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
