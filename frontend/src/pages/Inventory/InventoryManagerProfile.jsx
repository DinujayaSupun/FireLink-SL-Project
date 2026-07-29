import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaEdit, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const InventoryManagerProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    gmail: user?.gmail || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState("");

  // Redirect if not logged in or not inventory manager
  if (!user) {
    navigate("/staff-login");
    return null;
  }

  if (user.position?.toLowerCase() !== "inventorymanager") {
    navigate("/dashboard");
    return null;
  }

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.gmail || !emailRegex.test(formData.gmail)) {
      newErrors.gmail = "Valid email is required";
    }

    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits starting with 0";
    }

    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError(
        "Password must have uppercase, lowercase, number, special character, and at least 6 characters"
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
  };

  // Update profile information
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${user._id}`,
        {
          name: formData.name,
          gmail: formData.gmail,
          phone: formData.phone,
          address: formData.address,
          age: user.age, // Keep existing age
          position: user.position, // Keep existing position
          status: user.status, // Keep existing status
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // Update local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
        setIsEditing(false);
        window.location.reload(); // Refresh to show updated data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${API_BASE_URL}/users/${user._id}/password`,
        { password: passwordData.newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || "",
      gmail: user?.gmail || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gray-800 text-white p-6 relative">
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                {user.status || "Active"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaUser className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Inventory Manager Profile</h1>
                <p className="mt-1 text-gray-300">Manage your profile information</p>
              </div>
            </div>
          </div>

          {/* Staff ID Section */}
          <div className="p-6 border-b">
            <div className="flex items-center bg-fire-50 p-4 rounded-lg border border-fire-100">
              <FaIdCard className="text-fire mr-3 text-xl" />
              <div>
                <span className="font-medium text-gray-700 mr-3">Staff ID:</span>
                <span className="text-fire-dark font-mono bg-fire-100 px-3 py-1 rounded">
                  {user.staffId || user._id}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="p-6">
            {!isEditing ? (
              // View Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 flex justify-between items-center border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-fire text-white rounded-lg hover:bg-fire-dark transition"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaUser className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-800">{user.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">{user.gmail || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-800">{user.phone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaBriefcase className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-semibold text-gray-800">{user.position || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-semibold text-gray-800">{user.address || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="col-span-2 border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Edit Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-fire">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire ${
                        errors.name ? "border-fire" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-fire text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-fire">*</span>
                    </label>
                    <input
                      type="email"
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire ${
                        errors.gmail ? "border-fire" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.gmail && <p className="text-fire text-xs mt-1">{errors.gmail}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-fire">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire ${
                        errors.phone ? "border-fire" : "border-gray-300"
                      }`}
                      placeholder="0XXXXXXXXX"
                    />
                    {errors.phone && <p className="text-fire text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Position (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={user.position}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-fire">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire ${
                        errors.address ? "border-fire" : "border-gray-300"
                      }`}
                      placeholder="Enter your full address"
                    />
                    {errors.address && <p className="text-fire text-xs mt-1">{errors.address}</p>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-fire text-white rounded-lg hover:bg-fire-dark transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {!isChangingPassword ? (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FaLock className="text-gray-600" />
                    Security
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your password and security settings</p>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-fire text-white rounded-lg hover:bg-fire-dark transition"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 pb-4 border-b">
                  <FaLock className="text-gray-600" />
                  Change Password
                </h2>

                {passwordError && (
                  <div className="bg-fire-50 text-fire-dark px-4 py-3 rounded-lg">{passwordError}</div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-fire">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fire"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must include uppercase, lowercase, number, and special character (min 6 chars)
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-fire">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fire"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-fire text-white rounded-lg hover:bg-fire-dark transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/inventory")}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerProfile;
