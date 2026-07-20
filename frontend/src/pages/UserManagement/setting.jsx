// pages/UserManagement/Settings.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FiLock, FiSave, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [inputs, setInputs] = useState({
    name: "",
    age: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!user || !token) {
      navigate("/staff-login");
      return;
    }

    setInputs({
      name: user.name || "",
      age: user.age || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (passwordError) setPasswordError("");
  };

  const validatePasswords = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/users/${user._id}`,
        {
          name: inputs.name,
          age: inputs.age,
          phone: inputs.phone,
          address: inputs.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    try {
      await axios.put(
        `${API_BASE_URL}/users/${user._id}/password`,
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordData({ newPassword: "", confirmPassword: "" });
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Account deleted successfully!");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/staff-login");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account");
      }
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={() => navigate("/staff-login")} />

      {/* Main Settings Section */}
      <div className="flex-1 py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-fire to-fire-dark text-white p-6">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Profile Update */}
            {user.position !== "1stclass officer" && (
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                <form onSubmit={handleUpdateProfile} className="grid gap-4">
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="p-3 border rounded"
                    required
                  />
                  <input
                    type="number"
                    name="age"
                    value={inputs.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="p-3 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="phone"
                    value={inputs.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="p-3 border rounded"
                    required
                  />
                  <textarea
                    name="address"
                    value={inputs.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="p-3 border rounded"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-info text-white rounded hover:bg-info-dark"
                  >
                    <FiSave /> Update Profile
                  </button>
                </form>
              </div>
            )}

            {/* Change Password */}
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handleUpdatePassword} className="grid gap-4">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="p-3 border rounded"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm Password"
                  className="p-3 border rounded"
                />
                {passwordError && (
                  <p className="text-fire text-sm">{passwordError}</p>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber text-white rounded hover:bg-amber-dark"
                >
                  <FiLock /> Update Password
                </button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-2 text-fire">
                Delete Account
              </h2>
              <p className="mb-4">
                This action is permanent and cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-4 py-2 bg-fire text-white rounded hover:bg-fire-dark"
              >
                <FiTrash2 /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
