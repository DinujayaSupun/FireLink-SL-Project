// Seeds one staff account per position.
//
// This is the bootstrap for the system: POST /users requires an authenticated
// chief officer, so the first chief officer has to come from here.
//
// Usage:  npm run seed:users
//
// Positions must match the list in frontend AddUsers.jsx and the guards in
// App.jsx / the backend routes. Staff sign in with the generated staffId — NOT
// their email.

const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const User = require("../models/UserManagement/UserReg");

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || "password123";

const staff = [
	{ position: "chief officer", name: "Chief Fire Officer", phone: "0770000001" },
	{ position: "1stclassofficer", name: "First Class Officer", phone: "0770000002" },
	{ position: "finance_manager", name: "Finance Manager", phone: "0770000003" },
	{ position: "inventorymanager", name: "Inventory Manager", phone: "0770000004" },
	{ position: "supply_manager", name: "Supply Manager", phone: "0770000005" },
	{ position: "recordmanager", name: "Record Manager", phone: "0770000006" },
	{ position: "preventionmanager", name: "Prevention Manager", phone: "0770000007" },
	{ position: "trainingsessionmanager", name: "Training Session Manager", phone: "0770000008" },
	{ position: "teamcaptain", name: "Team Captain", phone: "0770000009" },
	{ position: "fighter", name: "Fire Fighter", phone: "0770000010" },
];

const seedUsers = async () => {
	if (!process.env.DB_URI) {
		console.error("DB_URI is not set — check backend/config/config.env");
		process.exit(1);
	}

	await mongoose.connect(process.env.DB_URI);
	console.log("MongoDB connected");

	await User.deleteMany({});
	console.log("Cleared existing users");

	const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
	const created = [];

	for (const [index, member] of staff.entries()) {
		const prefix = member.position.replace(/\s+/g, "").substring(0, 3).toUpperCase();
		// Index keeps the id unique when several are created in the same millisecond.
		const staffId = `${prefix}${String(Date.now()).slice(-4)}${index}`;

		const user = await User.create({
			name: member.name,
			gmail: `${member.position.replace(/[^a-z0-9]/gi, "")}@firedept.lk`,
			age: 30 + index,
			phone: member.phone,
			position: member.position,
			status: "active",
			password: hashed,
			address: "Colombo, Sri Lanka",
			staffId,
		});

		created.push({ staffId: user.staffId, position: user.position });
	}

	console.log(`\nSeeded ${created.length} staff accounts.`);
	console.log("=".repeat(52));
	console.log("STAFF ID".padEnd(12) + "PASSWORD".padEnd(16) + "POSITION");
	console.log("=".repeat(52));
	for (const c of created) {
		console.log(c.staffId.padEnd(12) + DEFAULT_PASSWORD.padEnd(16) + c.position);
	}
	console.log("=".repeat(52));
	console.log("Sign in at /staff-login with the STAFF ID (not the email).");

	await mongoose.disconnect();
	process.exit(0);
};

seedUsers().catch((err) => {
	console.error("User seeding failed:", err.message);
	process.exit(1);
});
