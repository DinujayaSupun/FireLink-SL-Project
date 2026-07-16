const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const Salary = require("../models/Salary");
const connectDatabase = require("../config/database");

// Load environment variables — resolved from this file, not the working directory
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

// ============================
// User Data (From your list)
// ============================
const users = [
	{
		_id: "68d03b24f91d0769bb097438",
		name: "ishu",
		gmail: "ishu@123",
		position: "recordmanager",
	},
	{
		_id: "68d03bb3f91d0769bb09743e",
		name: "Tharuka",
		gmail: "tharu0507@gmail.com",
		position: "supply_manager",
	},
	{
		_id: "68e74cbc0dad4da914121fda",
		name: "jhone sheo",
		gmail: "jhone@gmail.com",
		position: "finance_manager",
	},
	{
		_id: "68e74bb10dad4da914121fd5",
		name: "vidura",
		gmail: "vidura@gmail.com",
		position: "supply_manager",
	},
	{
		_id: "68e74d920dad4da914121fdf",
		name: "dinusha dev",
		gmail: "dinu@gmail.com",
		position: "teamcaptain",
	},
	{
		_id: "68e74a890dad4da914121fcb",
		name: "arindu",
		gmail: "a@gmail.com",
		position: "preventionmanager",
	},
	{
		_id: "68e74a230dad4da914121fc6",
		name: "isiwari thimethya",
		gmail: "Ishu@gmail.com",
		position: "recordmanager",
	},
	{
		_id: "68e74e180dad4da914121fe4",
		name: "chanu",
		gmail: "chanu@gmail.com",
		position: "fighter",
	},
	{
		_id: "68ebc8c7f1795c178437ff5d",
		name: "Dinujaya Supun",
		gmail: "mdinujayasupun@gmail.com",
		position: "inventorymanager",
	},
];

// ============================
// Utility functions
// ============================

// Random int between range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random salary data
const generateSalaryData = (user) => {
	const totalWorkingDays = 22;
	const daysPresent = rand(18, 22);
	const daysAbsent = totalWorkingDays - daysPresent;

	const basicSalary = rand(80000, 200000);
	const perDaySalary = Math.round(basicSalary / totalWorkingDays);
	const otHours = rand(0, 15);
	const otPay = otHours * rand(400, 800);

	const mealAllowance = rand(2000, 6000);
	const transportAllowance = rand(3000, 8000);
	const medicalAllowance = rand(2000, 7000);

	const noPayLeaves = daysAbsent;
	const taxRate = 6;
	const epfRate = 8;

	const grossSalary =
		basicSalary + otPay + mealAllowance + transportAllowance + medicalAllowance;

	const taxAmount = Math.round((grossSalary * taxRate) / 100);
	const epfAmount = Math.round((basicSalary * epfRate) / 100);

	const finalSalary = Math.round(grossSalary - taxAmount - epfAmount);

	return {
		employeeName: user.name,
		email: user.gmail,
		role: user.position,
		totalWorkingDays,
		daysPresent,
		daysAbsent,
		basicSalary,
		perDaySalary,
		otHours,
		otPay,
		mealAllowance,
		transportAllowance,
		medicalAllowance,
		noPayLeaves,
		taxRate,
		epfRate,
		epfAmount,
		finalSalary,
		status: ["pending", "paid", "rejected"][rand(0, 2)],
		createdBy: user._id,
	};
};

const salaries = users.map((user) => generateSalaryData(user));

// ============================
// Seeder Functions
// ============================

const importData = async () => {
	try {
		console.log("🚀 Importing salary data...");
		await Salary.insertMany(salaries);
		console.log("✅ Salary data imported successfully!");
		process.exit();
	} catch (error) {
		console.error("❌ Error importing salary data:", error);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await Salary.deleteMany();
		console.log("🗑️  All salary data deleted successfully!");
		process.exit();
	} catch (err) {
		console.error("❌ Error deleting salary data:", err);
		process.exit(1);
	}
};

const run = async () => {
	await connectDatabase();

	const action = process.argv[2];

	// if (action === "-d") {
	// 	await destroyData();
	// } else {
	// 	await destroyData();
	// 	await importData();
	// }
	await importData();
};

run();
