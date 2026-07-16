// controllers/civilianAuthController.js
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const Civilian = require("../../models/UserManagement/civilian");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// The `type` claim keeps this token out of the staff and supplier middleware —
// all three identities share JWT_SECRET, so the shape alone is not enough.
const generateToken = (id) => {
  return jwt.sign({ id, type: "civilian" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Civilian register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, phoneNumber, address } = req.body;

    const existing = await Civilian.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const civilian = await Civilian.create({ firstName, lastName, email, username, password, phoneNumber, address });

    res.status(201).json({ success: true, message: "Civilian registered successfully", civilian });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Civilian login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const civilian = await Civilian.findOne({ email });
    if (!civilian || !(await civilian.comparePassword(password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(civilian._id);
    res.cookie("token", token, { httpOnly: true, secure: false });

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, given_name, family_name } = payload;

    let civilian = await Civilian.findOne({ email });
    if (!civilian) {
      civilian = await Civilian.create({
        googleId: sub,
        email,
        firstName: given_name,
        lastName: family_name,
        username: email.split("@")[0],
        password: Math.random().toString(36).slice(-8), // random password (hashed)
      });
    }

    const token = generateToken(civilian._id);
    res.cookie("token", token, { httpOnly: true, secure: false });

    res.json({ success: true, message: "Google login successful", token });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google authentication failed" });
  }
};

// Forgot password (stub: send reset link)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const civilian = await Civilian.findOne({ email });

    if (!civilian) {
      return res.status(400).json({ success: false, message: "No account found with that email" });
    }

    // TODO: generate reset token + send email
    res.json({ success: true, message: "Password reset link sent to email (stub)" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
