import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaUserAlt, FaLock, FaEnvelope, FaPhoneAlt, FaUser } from "react-icons/fa";
import { API_V1_URL } from "../../config/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const CivilianLogin = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    username: "",
    newsletterSubscription: false,
  });
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleDebug, setGoogleDebug] = useState(null);

  // ---------------------- Validation functions ----------------------
  const validateName = (name) => /^[a-zA-Z\s\.\-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pw);
  const validatePhone = (phone) => /^0\d{9}$/.test(phone);
  const validateUsername = (username) => /^[a-zA-Z0-9_\.]{4,20}$/.test(username);

  const isLoginFormValid = () => formData.email && formData.password && validateEmail(formData.email);
  const isSignupFormValid = () =>
    signupData.firstName &&
    signupData.lastName &&
    signupData.username &&
    signupData.phoneNumber &&
    signupData.address &&
    signupData.email &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password === signupData.confirmPassword &&
    validateEmail(signupData.email) &&
    validatePhone(signupData.phoneNumber) &&
    validatePassword(signupData.password);

  // ---------------------- Input handlers ----------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isSignup) {
      setSignupData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
    setSuccess("");
  };

  // ---------------------- Form submissions ----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoginFormValid()) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_V1_URL}/civilian-auth/login`,
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        // Ensure we persist a usable value so route checks that read localStorage see it
  const token = data.accessToken && data.accessToken.length > 0 ? data.accessToken : "civilian-session-token";
  // Store under both keys so different parts of app (auth context vs route guard) can read it
  localStorage.setItem("accessToken", token);
  localStorage.setItem("token", token);
        // Persist basic user info if available (helps other parts of the app)
        if (data.user) {
          try {
            localStorage.setItem("user", JSON.stringify(data.user));
          } catch (e) {
            console.warn("Failed to store user object", e);
          }
        }
        // Navigate using router replace so React Router re-evaluates routes and avoids stacking history
        setTimeout(() => {
          navigate("/civilian-dashboard", { replace: true });
        }, 150);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Google Identity Services ----------------------
  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Add script if not present
    if (!document.getElementById("google-identity-script")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-identity-script";
      document.body.appendChild(script);

      script.onload = () => initGoogle();
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (!window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            // response.credential is the ID token
            try {
              setLoading(true);
              const res = await axios.post(
                `${API_V1_URL}/civilian-auth/google-login`,
                { credential: response.credential },
                { withCredentials: true }
              );

              const data = res.data;
              if (data.success) {
                // reuse success logic: persist tokens/user and navigate
                const token = data.token && data.token.length > 0 ? data.token : "civilian-session-token";
                localStorage.setItem("accessToken", token);
                localStorage.setItem("token", token);
                if (data.user) {
                  try { localStorage.setItem("user", JSON.stringify(data.user)); } catch (e) { /* ignore */ }
                }
                setSuccess("Login successful! Redirecting...");
                setTimeout(() => navigate("/civilian-dashboard", { replace: true }), 150);
              } else {
                setError(data.message || "Google login failed");
              }
            } catch (err) {
              console.error(err);
              setError("Google login failed");
            } finally {
              setLoading(false);
            }
          },
        });

        // Render a visible button (optional) into the ref
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
          });
        }
      } catch (err) {
        console.warn("GSI init failed", err);
      }
    }

    return () => {
      // cleanup not strictly necessary; GSI doesn't provide destroy
    };
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isSignupFormValid()) {
      setError("Please fill all fields correctly");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_V1_URL}/civilian-auth/register`,
        signupData,
        { withCredentials: true }
      );

      if (data.success) {
        // Show success and auto-redirect to the login page
        setSuccess("Account created successfully! Redirecting to login...");
        // clear form
        setSignupData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          address: "",
          username: "",
          newsletterSubscription: false,
        });
        // briefly show message then redirect to login route
        setTimeout(() => {
          setIsSignup(false);
          navigate("/civilian-login");
        }, 1200);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Google Login ----------------------
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed. No credential returned.");
      return;
    }
    setLoading(true);
    setError("");
    // quick debug info for developer
    setGoogleDebug({ credentialPreview: credentialResponse.credential?.slice(0, 40) });
    console.debug("Google credential (preview):", credentialResponse.credential?.slice(0, 80));

    try {
      const payload = { credential: credentialResponse.credential, id_token: credentialResponse.credential };
      console.debug("Sending Google login payload:", payload);
      const { data } = await axios.post(
        `${API_V1_URL}/civilian-auth/google-login`,
        // send both common keys some backends expect
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("civilianLoggedIn", "true");
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          try {
            navigate("/civilian-dashboard", { replace: true });
          } catch (err) {
            window.location.href = "/civilian-dashboard";
          }
        }, 800);
      } else {
        setError(data.message || "Google login failed");
        setGoogleDebug((prev) => ({ ...prev, server: data }));
      }
    } catch (err) {
      console.error(err);
      // Axios error handling: prefer server message if available
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      if (status === 400) {
        setError(
          `Google login failed (400): ${serverMsg}. This often means the request is malformed or your Google OAuth client is misconfigured. Check VITE_GOOGLE_CLIENT_ID, and ensure your OAuth origin (e.g. http://localhost:5173) is added in Google Cloud Console.`
        );
        setGoogleDebug((prev) => ({ ...prev, status, server: serverMsg }));
      } else {
        setError(serverMsg || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto redirect if logged in
  useEffect(() => {
    if (localStorage.getItem("accessToken") || localStorage.getItem("civilianLoggedIn")) navigate("/civilian-dashboard");
  }, [navigate]);

  // ---------------------- JSX ----------------------
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-4xl font-bold text-fire mb-2 text-center">
          Civilian Portal
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isSignup ? "Create your account" : "Enter your credentials to login"}
        </p>

        {error && <div className="mb-4 text-red-700 bg-red-50 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 text-green-700 bg-green-50 px-4 py-2 rounded">{success}</div>}

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          {isSignup && (
            <>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={signupData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.firstName && !validateName(signupData.firstName)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={signupData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.lastName && !validateName(signupData.lastName)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={signupData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.username && !validateUsername(signupData.username)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={signupData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.phoneNumber && !validatePhone(signupData.phoneNumber)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
              <textarea
                name="address"
                placeholder="Address"
                value={signupData.address}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber transition"
                disabled={loading}
              />
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.password && !validatePassword(signupData.password)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.confirmPassword &&
                    signupData.confirmPassword !== signupData.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber transition`}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Email & Password for Login */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={isSignup ? signupData.email : formData.email}
              onChange={handleChange}
              className={`w-full pl-10 p-3 rounded-xl border ${
                (isSignup ? signupData.email : formData.email) &&
                !validateEmail(isSignup ? signupData.email : formData.email)
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-amber transition`}
              disabled={loading}
            />
          </div>

          {!isSignup && (
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber transition"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignup ? !isSignupFormValid() : !isLoginFormValid())}
            className={`w-full p-3 font-semibold rounded-xl shadow-lg transition ${
              isSignup
                ? isSignupFormValid()
                  ? "bg-amber text-white hover:shadow-xl"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                : isLoginFormValid()
                ? "bg-amber text-white hover:shadow-xl"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {loading ? (isSignup ? "Creating..." : "Logging in...") : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Google Sign-in button (rendered by Google Identity Services) */}
        <div className="mt-4 text-center">
          <div ref={googleButtonRef} />
          {!window.google && (
            <button
              type="button"
              onClick={() => {
                // If GSI isn't loaded yet, try to prompt the user to wait
                if (window.google && window.google.accounts) {
                  window.google.accounts.id.prompt();
                } else {
                  alert("Please wait a moment — Google sign-in is loading.");
                }
              }}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path d="M533.5 278.4c0-17.4-1.6-34.3-4.6-50.6H272v95.7h146.9c-6.3 34-25.6 62.8-54.5 82v68.1h87.9c51.5-47.4 80.2-117.5 80.2-195.2z" fill="#4285F4"/><path d="M272 544.3c73.7 0 135.6-24.6 180.8-66.8l-87.9-68.1c-24.4 16.3-55.8 26-92.9 26-71.4 0-132-48.1-153.6-112.8H29.6v70.9C74.7 487.4 167 544.3 272 544.3z" fill="#34A853"/><path d="M118.4 325.6c-10.9-32.2-10.9-66.8 0-99l-88.8-70.9C9.9 210 0 247.3 0 284.6s9.9 74.6 29.6 128.9l88.8-70.9z" fill="#FBBC05"/><path d="M272 109.6c39.9 0 75.8 13.7 104.1 40.6l78.2-78.2C401.7 24.3 339.8 0 272 0 167 0 74.7 56.9 29.6 142.2l88.8 70.9C140 157.7 200.6 109.6 272 109.6z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignup(false)} className="text-fire underline">
                Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsSignup(true)} className="text-fire underline">
                Sign Up
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/staff-login" className="text-gray-500 underline text-sm">
            ← Back to Staff Login
                    {/* Debug panel for Google OAuth issues */}
                    {googleDebug && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded">
                        <div><strong>Google Debug:</strong></div>
                        <div>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID || "(not set)"}</div>
                        <div>Origin: {window.location.origin}</div>
                        {googleDebug.credentialPreview && (
                          <div>Credential (preview): {googleDebug.credentialPreview}...</div>
                        )}
                        {googleDebug.status && <div>Server status: {googleDebug.status}</div>}
                        {googleDebug.server && (
                          <div className="mt-2 whitespace-pre-wrap">Server response: {JSON.stringify(googleDebug.server)}</div>
                        )}
                      </div>
                    )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CivilianLogin;
