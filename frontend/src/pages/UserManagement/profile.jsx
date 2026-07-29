// pages/UserManagement/Profile.js
import React from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // get logged-in user

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/stafflogin"); // or your login route
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy">
        <p className="text-xl text-fire-300">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Profile Section */}
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-navy text-white p-6 relative">
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
                {user.status || "Active"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                {/* Profile Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17
                       20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7
                       20H2v-2a3 3 0 015.356-1.857M7
                       20v-2c0-.656.126-1.283.356-1.857m0
                       0a5.002 5.002 0 019.288
                       0M15 7a3 3 0 11-6 0 3 3
                       0 016 0zm6 3a2 2 0 11-4 0
                       2 2 0 014 0zM7 10a2 2 0
                       11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="mt-1 text-fire-100">Fire Department Staff Details</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staff ID */}
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Identification
                </h2>
                <div className="flex items-center bg-fire-50 p-4 rounded-lg border border-fire-100">
                  <span className="font-medium text-gray-700 mr-3">Staff ID:</span>
                  <span className="text-fire-dark font-mono bg-fire-100 px-3 py-1 rounded">
                    {user.staffId || user._id}
                  </span>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Personal Information
                </h2>
                <p><b>Full Name:</b> {user.name || "N/A"}</p>
                <p><b>Phone:</b> {user.phone || "N/A"}</p>
                <p><b>Address:</b> {user.address || "N/A"}</p>
              </div>

              {/* Professional Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Professional Information
                </h2>
                <p><b>Email:</b> {user.gmail || "N/A"}</p>
                <p><b>Position:</b> {user.position || "N/A"}</p>
                <p><b>Status:</b> {user.status || "N/A"}</p>
              </div>
            </div>

            {/* Address (separate full-width section) */}
            <div className="col-span-2 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Address
              </h2>
              <p>{user.address || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
