// Components/UpdateUser.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiActivity,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiSave
} from "react-icons/fi";

function UpdateUser() {
  const [inputs, setInputs] = useState({});
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/staff-login");
      return;
    }

    const fetchUser = async () => {
      try {
        console.log("Fetching user with ID:", id);
        console.log("Token:", token);

        const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("User fetched:", response.data.user);
        setInputs(response.data.user);
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error.response ? error.response.data : error.message
        );
        alert(
          "Failed to fetch user data. Make sure you are logged in and the user exists."
        );
        navigate("/dashboard");
      }
    };

    fetchUser();
  }, [id, navigate, token]);

  const sendRequest = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/users/${id}`,
        {
          name: String(inputs.name),
          gmail: String(inputs.gmail),
          age: Number(inputs.age),
          address: String(inputs.address),
          phone: String(inputs.phone),
          position: String(inputs.position),
          status: String(inputs.status)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User updated successfully!");
      navigate(`/userdetails/${id}`);
    } catch (error) {
      console.error("Error updating user:", error.response || error.message);
      alert("Failed to update user");
    }
  };

  const updatePassword = async () => {
    if (passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword) {
      try {
        await axios.put(
          `${API_BASE_URL}/users/${id}/password`,
          { password: passwordData.newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setPasswordError("");
        alert("Password updated successfully!");
      } catch (error) {
        console.error("Error updating password:", error.response || error.message);
        setPasswordError("Failed to update password");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    // Validation
    if (name === "name") {
      value.trim().length < 5
        ? setErrors((prev) => ({ ...prev, name: "Full Name must be at least 5 characters" }))
        : setErrors((prev) => { const temp = { ...prev }; delete temp.name; return temp; });
    }

    if (name === "age") {
      const ageVal = Number(value);
      ageVal < 20 || ageVal > 55
        ? setErrors((prev) => ({ ...prev, age: "Age must be between 20 and 55" }))
        : setErrors((prev) => { const temp = { ...prev }; delete temp.age; return temp; });
    }

    if (name === "gmail") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      !emailPattern.test(value)
        ? setErrors((prev) => ({ ...prev, gmail: "Invalid email format" }))
        : setErrors((prev) => { const temp = { ...prev }; delete temp.gmail; return temp; });
    }

    if (name === "address") {
      const wordCount = value.trim().split(/\s+/).length;
      wordCount < 4 || wordCount > 15
        ? setErrors((prev) => ({ ...prev, address: "Address must be 4 to 15 words" }))
        : setErrors((prev) => { const temp = { ...prev }; delete temp.address; return temp; });
    }

    if (name === "phone") {
      const phonePattern = /^0\d{9}$/;
      !phonePattern.test(value)
        ? setErrors((prev) => ({ ...prev, phone: "Phone must start with 0 and contain 10 digits" }))
        : setErrors((prev) => { const temp = { ...prev }; delete temp.phone; return temp; });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (passwordError) setPasswordError("");
  };

  const validatePasswords = () => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (!passwordPattern.test(passwordData.newPassword)) {
      setPasswordError(
        "Password must have uppercase, lowercase, number, special character, and at least 6 characters"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) sendRequest();
    else alert("Please fix validation errors before submitting.");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswords()) updatePassword();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/staff-login");
  };

  return (
    <div className="min-h-screen bg-navy py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/userdetails/${id}`)}
          className="flex items-center text-white mb-6 hover:text-gray-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to User Details
        </button>

        {/* Update User Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-fire text-white p-6">
            <h1 className="text-3xl font-bold text-center">Update User Information</h1>
          </div>
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiUser className="mr-2" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={inputs.name || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiCalendar className="mr-2" /> Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={inputs.age || ""}
                  onChange={handleChange}
                  min="20"
                  max="55"
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiMail className="mr-2" /> Email
                </label>
                <input
                  type="email"
                  name="gmail"
                  value={inputs.gmail || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
                {errors.gmail && <p className="text-red-500 text-sm mt-1">{errors.gmail}</p>}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiMapPin className="mr-2" /> Address
                </label>
                <textarea
                  name="address"
                  value={inputs.address || ""}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiPhone className="mr-2" /> Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={inputs.phone || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none transition"
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiBriefcase className="mr-2" /> Position
                </label>
                <select
                  name="position"
                  value={inputs.position || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Position</option>
                  <option value="1stclass officer">1st Class Officer</option>
                  <option value="financeManager">Finance Manager</option>
                  <option value="firefighter">Firefighter</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiActivity className="mr-2" /> Status
                </label>
                <select
                  name="status"
                  value={inputs.status || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-fire focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition flex items-center"
                onClick={() => navigate(`/dashboard`)}
              >
                <FiArrowLeft className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-fire text-white rounded-lg shadow hover:bg-red-800 transition flex items-center"
                disabled={Object.keys(errors).length > 0}
              >
                <FiSave className="mr-2" /> Update User
              </button>
            </div>
          </form>
        </div>

        {/* Password Update */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-navy-light text-white p-6">
            <h2 className="text-2xl font-bold text-center flex items-center justify-center">
              <FiLock className="mr-2" /> Update Password
            </h2>
          </div>

          <form className="p-6 md:p-8" onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-gray-600 mb-4">
                  Leave these fields blank if you don't want to change the password.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiLock className="mr-2" /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-navy-light focus:border-transparent outline-none transition pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiLock className="mr-2" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-navy-light focus:border-transparent outline-none transition pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-navy-light text-white rounded-lg shadow hover:bg-navy-dark transition flex items-center"
                disabled={!passwordData.newPassword && !passwordData.confirmPassword}
              >
                <FiLock className="mr-2" /> Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUser;
