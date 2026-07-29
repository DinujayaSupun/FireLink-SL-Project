const dotenv = require("dotenv");
const path = require("path");
const Transaction = require("../models/Expense");
const generateUniqueId = require("../utils/generateUniqueId");
const connectDatabase = require("../config/database");

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const types = [
	"emergency",
	"maintenance",
	"transport",
	"utilities",
	"infrastructure",
	"training",
	"other",
];

const getAmountByType = (type) => {
	switch (type) {
		case "emergency":
			return Math.floor(Math.random() * 15000) + 5000; // 5k–20k
		case "maintenance":
			return Math.floor(Math.random() * 10000) + 5000; // 5k–15k
		case "transport":
			return Math.floor(Math.random() * 7000) + 2000; // 2k–9k
		case "utilities":
			return Math.floor(Math.random() * 5000) + 1000; // 1k–6k
		case "infrastructure":
			return Math.floor(Math.random() * 30000) + 10000; // 10k–40k
		case "training":
			return Math.floor(Math.random() * 8000) + 2000; // 2k–10k
		default:
			return Math.floor(Math.random() * 4000) + 1000; // 1k–5k
	}
};

// Generate a random date within this year
const getRandomDate = () => {
	const start = new Date(new Date().getFullYear(), 0, 1); // Jan 1
	const end = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		new Date().getDay()
	);
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

const importData = async () => {
	const transactions = [];

	for (let i = 0; i < 150; i++) {
		const type = types[Math.floor(Math.random() * types.length)];
		const amount = getAmountByType(type);

		transactions.push({
			id: generateUniqueId("exp"),
			amount,
			type,
			description: `${type.charAt(0).toUpperCase() + type.slice(1)} expense #${
				i + 1
			}`,
			date: getRandomDate(),
		});
	}
	try {
		await Transaction.insertMany(transactions);
		console.log("Transaction data imported successfully!");
	} catch (err) {
		console.error("Error importing data:", err);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await Transaction.deleteMany();
		console.log("All transaction data successfully deleted!");
	} catch (err) {
		console.error("Error destroying data:", err);
		process.exit(1);
	}
};

const run = async () => {
	console.log(process.env.DB_URI);
	await connectDatabase();

	await destroyData();
	await importData();
	process.exit();
};

run();
