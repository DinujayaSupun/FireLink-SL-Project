const User = require("../../models/UserManagement/UserReg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//data insert

// Enforced here rather than on the schema: the schema stores the bcrypt hash,
// so a minlength there would measure the hash (always 60 chars), not the password.
const MIN_PASSWORD_LENGTH = 8;

const addUsers = async (req, res, next) => {
	const { name, gmail, age, phone, position, status, password, address } =
		req.body;

	try {
		if (!position) {
			return res
				.status(400)
				.json({ status: "error", message: "Position is required" });
		}

		if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
			return res.status(400).json({
				status: "error",
				message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate a unique staff ID based on position, e.g. "INV" + timestamp
		const prefix = position.replace(/\s+/g, "").substring(0, 3).toUpperCase(); // e.g., "1ST" for "1stclassofficer"
		const staffId = `${prefix}${Date.now().toString().slice(-5)}`;

		const users = new User({
			name,
			gmail,
			age,
			phone,
			position,
			status,
			password: hashedPassword,
			address,
			staffId, // assign unique staff ID
		});

		await users.save();

		return res.status(200).json({ status: "ok", users, staffId });
	} catch (err) {
		// Unique index violation on gmail or staffId
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue || {})[0] || "value";
			return res.status(409).json({
				status: "error",
				message: `A user with that ${field} already exists`,
			});
		}

		if (err.name === "ValidationError") {
			return res.status(400).json({
				status: "error",
				message: Object.values(err.errors)
					.map((e) => e.message)
					.join(", "),
			});
		}

		console.error("Add user error:", err);
		return res.status(500).json({
			status: "error",
			message: "Server error while adding user",
		});
	}
};

const staffLogin = async (req, res) => {
	try {
		const { staffId, password } = req.body;

		if (!staffId || !password) {
			return res
				.status(400)
				.json({
					status: "error",
					message: "Staff ID and password are required",
				});
		}

		const user = await User.findOne({ staffId });
		if (!user) {
			return res
				.status(401)
				.json({ status: "error", err: "Invalid Staff ID or password" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res
				.status(401)
				.json({ status: "error", err: "Invalid Staff ID or password" });
		}

		// Generate JWT. The `type` claim matters: staff, suppliers and civilians are
		// all signed with the same JWT_SECRET, so without it a civilian token is a
		// structurally valid staff token and passes the staff middleware.
		const token = jwt.sign(
			{ userId: user._id, type: "staff" },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		// The schema's toJSON transform strips the password hash on serialisation.
		return res.status(200).json({ status: "ok", user, token });
	} catch (err) {
		console.error("Staff login error:", err);
		return res.status(500).json({
			status: "error",
			message: "Server error during login",
			error: err.message,
		});
	}
};

exports.addUsers = addUsers;
exports.staffLogin = staffLogin;
