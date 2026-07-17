import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { API_BASE_URL } from "../../config/api";

// Add Public Sans font from Google Fonts
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// CSS for dropdown options
const dropdownCSS = `
  .modern-select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    font-size: 14px;
    box-sizing: border-box;
    background-color: white;
    transition: all 0.3s ease;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
    color: var(--color-gray-700);
    font-weight: 500;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .modern-select:hover {
    border-color: var(--color-gray-300);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .modern-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .modern-select option {
    padding: 12px 16px;
    background-color: white;
    color: var(--color-gray-700);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    border: none;
    margin: 0;
  }

  .modern-select option:hover {
    background-color: #f8fafc !important;
    color: var(--color-gray-800) !important;
    font-weight: 600 !important;
  }

  .modern-select option:checked {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 600 !important;
  }

  .modern-select option:focus {
    background-color: #eff6ff !important;
    color: #1e40af !important;
    outline: none;
  }

  /* Enhanced styling for better visual hierarchy */
  .modern-select optgroup {
    font-weight: bold;
    color: var(--color-gray-500);
    background-color: var(--color-gray-50);
    padding: 8px 16px;
  }

  /* Custom scrollbar for dropdown (WebKit browsers) */
  .modern-select::-webkit-scrollbar {
    width: 8px;
  }

  .modern-select::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .modern-select::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .modern-select::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const PreventionCertificateForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    address: "",
    contactNumber: "",
    email: "",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    preferredDate: "",
    additionalNotes: "",
    photo: null,
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;
    
    // Full Name Validation
    if (!formData.fullName || formData.fullName.trim() === "") {
      newErrors.fullName = "Please enter your full name";
      toast.error("Full name is required");
      hasErrors = true;
    }

    // Sri Lankan NIC validation with both old and new formats
    const nicRegexOld = /^\d{9}[vVxX]$/;  // Old format: 9 digits + V/X
    const nicRegexNew = /^\d{12}$/;       // New format: 12 digits
    if (!formData.nic || formData.nic.trim() === "") {
      newErrors.nic = "Please enter your NIC number";
      toast.error("NIC number is required");
      hasErrors = true;
    } else if (!nicRegexOld.test(formData.nic) && !nicRegexNew.test(formData.nic)) {
      newErrors.nic = "Please enter a valid NIC number";
      toast.error("Invalid NIC format");
      hasErrors = true;
    }

    // Address validation
    if (!formData.address || formData.address.trim() === "") {
      newErrors.address = "Please enter your address";
      toast.error("Address is required");
      hasErrors = true;
    }

    // 10-digit phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.contactNumber || formData.contactNumber.trim() === "") {
      newErrors.contactNumber = "Please enter your contact number";
      toast.error("Contact number is required");
      hasErrors = true;
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number";
      toast.error("Invalid contact number format");
      hasErrors = true;
    }

    // Email format validation with custom regex
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Please enter your email address";
      toast.error("Email address is required");
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        toast.error("Invalid email format");
        hasErrors = true;
      }
    }

    // Date validation with future date check
    if (!formData.preferredDate || formData.preferredDate.trim() === "") {
      newErrors.preferredDate = "Please select your preferred inspection date";
      toast.error("Inspection date is required");
      hasErrors = true;
    } else if (formData.preferredDate < getTodayDate()) {
      newErrors.preferredDate = "Please select a future date for inspection";
      toast.error("Invalid inspection date");
      hasErrors = true;
    }
    
    setErrors(newErrors);
    if (hasErrors) {
      toast.error("Please fill all required fields correctly", {
        duration: 4000
      });
    }
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time input filtering for contact number
    let processedValue = value;
    if (name === "contactNumber") {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for empty required fields first
    const requiredFields = {
      fullName: "Full name",
      nic: "NIC number",
      address: "Address",
      contactNumber: "Contact number",
      email: "Email",
      preferredDate: "Preferred inspection date"
    };

    let hasEmptyFields = false;
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === "") {
        toast.error(`${label} is required`);
        setErrors(prev => ({
          ...prev,
          [field]: `Please enter your ${label.toLowerCase()}`
        }));
        hasEmptyFields = true;
      }
    }

    if (hasEmptyFields) {
      return;
    }
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      if (key === "photo" && formData.photo) {
        data.append("photo", formData.photo);
      } else if (
        key !== "photo" &&
        formData[key] !== "" &&
        formData[key] !== undefined &&
        formData[key] !== null
      ) {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post("${API_BASE_URL}/api/prevention/certificates/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted successfully!");
  setMessage(""); // Clear message, only use toast
      setFormData({
        fullName: "",
        nic: "",
        address: "",
        contactNumber: "",
        email: "",
        constructionType: "Building",
        serviceType: "Fire Prevention",
        urgencyLevel: "Normal",
        preferredDate: "",
        additionalNotes: "",
        photo: null,
      });
      // Clear any remaining errors
      setErrors({});
    } catch (error) {
      const errorMessage = "Error submitting application: " + (error.response?.data?.message || error.message);
      toast.error(errorMessage);
      setMessage(errorMessage);
    }
  };

  // Inline styles
  const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "var(--color-navy)",
  backgroundImage: `url('/images/fire-truck-bg.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  backgroundRepeat: "no-repeat",
  padding: "20px 0",
  fontFamily: "Public Sans, Arial, sans-serif",
  };

  const containerStyle = {
  maxWidth: "600px",
  margin: "40px auto",
  padding: "30px",
  backgroundColor: "var(--color-gray-700)",
  backdropFilter: "blur(10px)",
  borderRadius: "15px",
  boxShadow: "0px 8px 25px rgba(0,0,0,0.4)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
  };

  const inputContainer = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "white",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
  };

  const errorInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid var(--color-fire)",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
  };

  const errorTextStyle = {
    color: "var(--color-fire)",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "bold",
  };

  const dateInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "15px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
  };

  const errorDateInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "15px",
    border: "2px solid var(--color-fire)",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: "var(--color-fire)",
    color: "white",
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    fontSize: "18px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(198, 40, 40, 0.3)",
  };

  const buttonHoverStyle = {
    backgroundColor: "var(--color-fire-dark)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(198, 40, 40, 0.4)",
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px",
    paddingRight: "40px",
    color: "var(--color-gray-700)",
    fontWeight: "500",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  };

  const selectFocusStyle = {
    borderColor: "var(--color-info)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-1px)",
  };

  const selectHoverStyle = {
    borderColor: "var(--color-gray-300)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-1px)",
  };

  const selectWithOptionsStyle = {
    ...selectStyle,
    background: `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center/16px`,
  };

  const optionStyle = {
    padding: "12px 16px",
    backgroundColor: "white",
    color: "var(--color-gray-700)",
    fontSize: "14px",
    fontWeight: "500",
    borderBottom: "1px solid var(--color-gray-100)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const optionHoverStyle = {
    backgroundColor: "var(--color-gray-50)",
    color: "var(--color-gray-800)",
    fontWeight: "600",
  };

  const optionSelectedStyle = {
    backgroundColor: "var(--color-info)",
    color: "white",
    fontWeight: "600",
  };

  const messageStyle = {
    textAlign: "center",
    fontWeight: "bold",
    color: "black",
    backgroundColor: "#FFFACD",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #f0e68c",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };


  return (
    <div style={pageStyle}>
      {/* Inject CSS for dropdown styling */}
      <style>{dropdownCSS}</style>
      <Toaster position="top-center" expand={false} richColors />
      <div style={containerStyle}>
        <h2 style={headingStyle}>Prevention Certificate Application</h2>
  {/* Removed message display, using toast instead */}
      <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
        {/* Personal Info */}
        <div style={inputContainer}>
          <label style={labelStyle}>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full legal name as per official records"
            required
            style={errors.fullName ? errorInputStyle : inputStyle}
          />
          {errors.fullName && <div style={errorTextStyle}>{errors.fullName}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>NIC:</label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            placeholder="Enter your NIC (9 digits with V/X or 12 digits)"
            required
            style={errors.nic ? errorInputStyle : inputStyle}
          />
          {errors.nic && <div style={errorTextStyle}>{errors.nic}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your official residential or business address"
            required
            style={errors.address ? errorInputStyle : inputStyle}
          />
          {errors.address && <div style={errorTextStyle}>{errors.address}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Contact Number:</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            required
            style={errors.contactNumber ? errorInputStyle : inputStyle}
          />
          {errors.contactNumber && <div style={errorTextStyle}>{errors.contactNumber}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your official email address"
            required
            style={errors.email ? errorInputStyle : inputStyle}
          />
          {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
        </div>
        {/* Service Details */}
        <div style={inputContainer}>
          <label style={labelStyle}>Construction Type:</label>
          <select
            name="constructionType"
            value={formData.constructionType}
            onChange={handleChange}
            className="modern-select"
          >
            <option value="Building">Building</option>
            <option value="Renovation">Renovation</option>
            <option value="Demolition">Demolition</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Type of Service:</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="modern-select"
          >
            <option value="Fire Prevention">Fire Prevention</option>
            <option value="Safety Audit">Safety Audit</option>
            <option value="Inspection">Inspection</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Urgency Level:</label>
          <select
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            className="modern-select"
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Preferred Inspection Date:</label>
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            min={getTodayDate()}
            style={errors.preferredDate ? errorDateInputStyle : dateInputStyle}
          />
          {errors.preferredDate && <div style={errorTextStyle}>{errors.preferredDate}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Additional Notes:</label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={inputContainer}>
          <label style={labelStyle} htmlFor="photo">
            Upload Document
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={handleFileChange}
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
        >
          Submit Application
        </button>
      </form>
    </div>
      </div>
  );
};

export default PreventionCertificateForm;
