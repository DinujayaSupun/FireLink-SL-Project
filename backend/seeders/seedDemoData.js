/**
 * Demo/presentation data seeder.
 *
 * The core seeders populate inventory, suppliers and staff, but several screens
 * still read as empty because nothing ever seeded them:
 *   - missions, training sessions, attendance and inventory logs were all zero
 *   - expenses existed but none in the CURRENT month, and the Expenses page
 *     defaults to the current month, so it always looked blank
 *
 * This fills those gaps with realistic Sri Lankan fire-service data so every
 * dashboard, chart and table shows something meaningful.
 *
 *   npm run seed:demo        (run after seed:all)
 *
 * Re-runnable: it clears only what it owns (missions/sessions/attendance/logs
 * and the current month's expenses), leaving historical expenses intact.
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const Mission = require("../models/Mission");
const TrainingSession = require("../models/UserManagement/TrainingSession");
const Attendance = require("../models/UserManagement/Attendance");
const InventoryLog = require("../models/InventoryLog");
const Inventory = require("../models/Inventory");
const Expense = require("../models/Expense");
const User = require("../models/UserManagement/UserReg");
const generateUniqueId = require("../utils/generateUniqueId");

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n, hour = 9, min = 0) => {
	const d = new Date();
	d.setDate(d.getDate() - n);
	d.setHours(hour, min, 0, 0);
	return d;
};

// description is capped at 25 chars by the Mission schema — keep these short.
const MISSIONS = [
	["Fire Emergency", "Kitchen fire, Dematagoda"],
	["Fire Emergency", "Shop fire, Pettah"],
	["Fire Emergency", "LPG leak, Maradana"],
	["Fire Emergency", "Warehouse fire, Orugod"],
	["Fire Emergency", "Vehicle fire, Galle Rd"],
	["Rescue Operation", "Lift rescue, Colombo 3"],
	["Rescue Operation", "Flood rescue, Kelaniya"],
	["Rescue Operation", "Road accident, Kotte"],
	["Rescue Operation", "Well rescue, Piliyandala"],
	["Medical Emergency", "Cardiac call, Borella"],
	["Medical Emergency", "Smoke inhalation, C-10"],
	["Training Exercise", "Ladder drill, HQ yard"],
	["Training Exercise", "Hose drill, Kotte"],
	["Maintenance", "Pump service, Engine 1"],
	["Maintenance", "Hydrant check, Col-07"],
	["Other", "Tree removal, Nugegoda"],
];

const SESSIONS = [
	["Breathing Apparatus Drill", "BA set checks, confined-space entry and buddy-breathing procedure.", "HQ Drill Yard, Colombo 10"],
	["Ladder & Rope Rescue", "Extension ladder pitching, rope descent and casualty lowering.", "Training Ground, Kotte"],
	["Hazmat Response", "Chemical spill containment and decontamination line setup.", "HQ Drill Yard, Colombo 10"],
	["High-Rise Firefighting", "Standpipe operations and stairwell hose deployment.", "Fire Tower, Colombo 02"],
	["Road Traffic Extrication", "Hydraulic cutter and spreader practice on vehicle shells.", "Training Ground, Kotte"],
	["Water Rescue Refresher", "Swift-water technique and throw-bag practice.", "Kelani River Bank"],
	["First Aid & CPR", "Annual CPR recertification and trauma dressing drill.", "HQ Classroom, Colombo 10"],
	["Fire Safety Inspection", "Commercial premises inspection and report writing.", "HQ Classroom, Colombo 10"],
];

const EXPENSES = [
	["utilities", "Electricity — HQ station"],
	["utilities", "Water supply — Kotte station"],
	["transport", "Diesel — Engine 1 & 2"],
	["maintenance", "Pump servicing — Engine 3"],
	["maintenance", "Ladder inspection & repair"],
	["training", "BA instructor fees"],
	["training", "Rescue course materials"],
	["transport", "Vehicle tyres — Rescue 1"],
	["transport", "Ambulance servicing"],
	["emergency", "Emergency foam resupply"],
	["emergency", "Hazmat suit replacement"],
	["infrastructure", "Drill yard resurfacing"],
	["infrastructure", "Station roof repair"],
	["other", "Station supplies"],
];

const LOG_ACTIONS = ["CREATE", "UPDATE", "STOCK_CHANGE", "DELETE"];

const run = async () => {
	if (!process.env.DB_URI) {
		console.error("DB_URI not set — check backend/config/config.env");
		process.exit(1);
	}
	await mongoose.connect(process.env.DB_URI);
	console.log("MongoDB connected\n");

	const users = await User.find({});
	if (!users.length) {
		console.error("No users found. Run `npm run seed:users` first.");
		process.exit(1);
	}
	const byPos = (p) => users.find((u) => u.position.replace(/[^a-z]/gi, "").toLowerCase() === p) || users[0];
	const recordMgr = byPos("recordmanager");
	const invMgr = byPos("inventorymanager");
	const trainMgr = byPos("trainingsessionmanager");

	const items = await Inventory.find({}).limit(22);

	// ---------- Missions ----------
	await Mission.deleteMany({});
	const missions = MISSIONS.map(([type, desc], i) => ({
		missionType: type,
		missionDate: daysAgo(randInt(0, 45), randInt(6, 22), pick([0, 15, 30, 45])),
		missionTime: `${String(randInt(6, 22)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`,
		description: desc.slice(0, 25),
		inventoryItems: items.length
			? Array.from({ length: randInt(1, 3) }, () => {
					const it = pick(items);
					const q = randInt(1, 6);
					return { itemCode: String(it.item_ID), quantity: q, usedQuantity: randInt(0, q) };
			  })
			: [],
		createdBy: recordMgr._id,
		status: i < 11 ? "Completed" : pick(["Active", "Completed"]),
	}));
	await Mission.insertMany(missions);
	console.log(`  missions              ${missions.length}`);

	// ---------- Training sessions ----------
	await TrainingSession.deleteMany({});
	const staffNames = users.map((u) => u.name);
	const sessionDocs = SESSIONS.map(([title, description, venue], i) => ({
		title,
		description,
		// mix of recent past and upcoming so the calendar/list looks alive
		date: i < 5 ? daysAgo(randInt(3, 40)) : daysAgo(-randInt(3, 25)),
		venue,
		teamMembers: staffNames.slice(0, randInt(4, 8)),
		createdBy: trainMgr.name,
	}));
	const createdSessions = await TrainingSession.insertMany(sessionDocs);
	console.log(`  training sessions     ${createdSessions.length}`);

	// ---------- Attendance (past sessions only) ----------
	await Attendance.deleteMany({});
	const past = createdSessions.filter((s) => s.date < new Date());
	const attendance = [];
	for (const s of past) {
		for (const u of users.slice(0, randInt(5, 9))) {
			attendance.push({
				sessionId: s._id,
				staffId: u.staffId,
				name: u.name,
				attendedAt: new Date(s.date.getTime() + randInt(5, 40) * 60000),
			});
		}
	}
	if (attendance.length) await Attendance.insertMany(attendance);
	console.log(`  attendance records    ${attendance.length}`);

	// ---------- Inventory logs ----------
	// Concentrated in the last 14 days (and weighted to the last 7) so the
	// dashboard's 7-day activity chart has real shape instead of a flat line of
	// zeros. CREATE/DELETE drive the added/removed series, so keep those frequent.
	await InventoryLog.deleteMany({});
	const logs = [];
	for (let i = 0; i < 90 && items.length; i++) {
		const it = pick(items);
		const action = i < 6 ? "CREATE" : pick(LOG_ACTIONS);
		const change = action === "STOCK_CHANGE" ? randInt(-12, 25) : 0;
		logs.push({
			action,
			itemId: it._id,
			itemName: it.item_name,
			itemCategory: it.category,
			description:
				action === "CREATE" ? `Added ${it.item_name} to inventory`
				: action === "STOCK_CHANGE" ? `Stock adjusted by ${change > 0 ? "+" : ""}${change}`
				: action === "DELETE" ? `Removed ${it.item_name}`
				: `Updated details for ${it.item_name}`,
			previousValue: action === "STOCK_CHANGE" ? it.quantity : undefined,
			newValue: action === "STOCK_CHANGE" ? it.quantity + change : undefined,
			quantityChange: change,
			performedBy: invMgr._id,
			performedByName: invMgr.name,
			// two-thirds land inside the last 7 days so the chart is lively
			timestamp: daysAgo(
				Math.random() < 0.66 ? randInt(0, 6) : randInt(7, 13),
				randInt(7, 19),
				randInt(0, 59)
			),
		});
	}
	if (logs.length) await InventoryLog.insertMany(logs);
	console.log(`  inventory logs        ${logs.length}`);

	// ---------- Current-month expenses ----------
	// The Expenses page defaults to the current month; without these it is blank.
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
	const removed = await Expense.deleteMany({ date: { $gte: monthStart, $lte: monthEnd } });

	const thisMonth = [];
	for (let i = 0; i < 26; i++) {
		const [type, description] = pick(EXPENSES);
		const day = randInt(1, Math.min(now.getDate(), 28));
		thisMonth.push({
			id: generateUniqueId("exp"),
			amount: type === "emergency" ? randInt(18000, 90000) : randInt(3500, 45000),
			type,
			description,
			date: new Date(now.getFullYear(), now.getMonth(), day, randInt(8, 17), 0, 0),
		});
	}
	await Expense.insertMany(thisMonth);
	console.log(`  expenses (this month) ${thisMonth.length}${removed.deletedCount ? `  (replaced ${removed.deletedCount})` : ""}`);

	const total = await Expense.countDocuments();
	console.log(`\n  expenses total in DB  ${total}`);
	console.log("\nDemo data seeded.");

	await mongoose.disconnect();
	process.exit(0);
};

run().catch((err) => {
	console.error("Demo seeding failed:", err.message);
	process.exit(1);
});
