import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaBirthdayCake, FaEnvelope, FaBriefcase, FaFlag, FaMapMarkerAlt, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import Sidebar from '../UserManagement/Sidebar'; // import sidebar

const URL = `${API_BASE_URL}/users`;

function AddFireStaff() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // logged-in user for sidebar

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gmail: "",
    position: "",
    status: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // These strings are what get stored on the user and matched by the route guards
  // in App.jsx and the backend. Keep them in sync with those guards.
  const positions = [
  "chief officer",
  "1stclassofficer",
  "finance_manager",
  "inventorymanager",
  "recordmanager",
  "preventionmanager",
  "trainingsessionmanager",
  "supply_manager",
  "teamcaptain",
  "fighter",
];
  const statuses = ["active", "inactive", "suspended", "retired"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate input as user types
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let err = { ...errors };

    if (name === "name") {
      if (value.trim().length < 5) err.name = "Full name must be at least 5 characters";
      else delete err.name;
    }

    if (name === "age") {
      const ageNum = Number(value);
      if (ageNum < 20 || ageNum > 55) err.age = "Age must be between 20 and 55";
      else delete err.age;
    }

    if (name === "gmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) err.gmail = "Invalid email format";
      else delete err.gmail;
    }

    if (name === "address") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount < 4 || wordCount > 15) err.address = "Address must be 4 to 15 words";
      else delete err.address;
    }

    if (name === "phone") {
      const phonePattern = /^0\d{9}$/; // must start with 0 and be 10 digits
      if (!phonePattern.test(value)) err.phone = "Phone must start with 0 and contain 10 digits";
      else delete err.phone;
    }

    // Password validation — the 8 character floor must match MIN_PASSWORD_LENGTH
    // in the backend's UserController, or the form accepts passwords the API rejects.
    if (name === "password") {
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!passwordPattern.test(value))
        err.password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
      else delete err.password;
    }

    setErrors(err);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.age &&
      formData.phone &&
      formData.gmail &&
      formData.position &&
      formData.status &&
      formData.address &&
      formData.password &&
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(URL, formData);
      if (res.data.status === "ok") {
        alert(`Staff added successfully! Staff ID: ${res.data.staffId}`);
        setFormData({
          name: "",
          phone: "",
          age: "",
          gmail: "",
          position: "",
          status: "",
          address: "",
          password: "",
        });
        navigate("/staff-login");
      } else alert("Error adding staff");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/staff-login");
  };

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border-t-8 border-fire">
          <h2 className="text-3xl font-bold text-fire mb-8 text-center">
            Add Fire Department Staff
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Age */}
            <div className="relative">
              <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                required
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="gmail"
                placeholder="Email"
                value={formData.gmail}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                required
              />
              {errors.gmail && <p className="text-red-500 text-sm mt-1">{errors.gmail}</p>}
            </div>

            {/* Position */}
            <div className="relative">
              <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber appearance-none"
                required
              >
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="relative">
              <FaFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber appearance-none"
                required
              >
                <option value="">Select Status</option>
                {statuses.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pt-3 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                rows={3}
                required
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber"
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full p-3 text-white font-semibold rounded-xl shadow-lg transition ${
                isFormValid() && !loading
                  ? "bg-amber hover:shadow-xl"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Adding..." : "Add Staff"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddFireStaff;
