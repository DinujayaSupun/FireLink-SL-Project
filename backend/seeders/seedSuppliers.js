const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Supplier = require("../models/Supplier");
const connectDatabase = require("../config/database");
const generateUniqueId = require("../utils/generateUniqueId");

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const suppliers = [
	{
		id: generateUniqueId("sup"),
		email: "contact@fire-safety-equip.com",
		password: "password123",
		name: "Fire Safety Equipment Inc.",
		nic: "199012345V",
		supplierType: "Equipment",
		phone: "555-0101",
		rating: 4.8,
		status: "active",
		supplyCount: 150,
		failedSupplyCount: 2,
	},
	{
		id: generateUniqueId("sup"),
		email: "service@heavyduty-mechanics.net",
		password: "password123",
		name: "Heavy Duty Mechanics",
		nic: "198512345678",
		supplierType: "Vehicle Maintenance",
		phone: "555-0102",
		rating: 4.5,
		status: "active",
		supplyCount: 88,
		failedSupplyCount: 5,
	},
	{
		id: generateUniqueId("sup"),
		email: "sales@uniforms-pro.com",
		password: "password123",
		name: "Uniforms Pro",
		nic: "923456789V",
		supplierType: "Uniforms",
		phone: "555-0103",
		rating: 4.2,
		status: "inactive",
		supplyCount: 210,
		failedSupplyCount: 15,
	},
	{
		id: generateUniqueId("sup"),
		email: "admin@ems-supplies.org",
		password: "password123",
		name: "EMS Medical Supplies Co.",
		nic: "200112345678",
		supplierType: "Medical Supplies",
		phone: "555-0104",
		rating: 5.0,
		status: "active",
		supplyCount: 300,
		failedSupplyCount: 0,
	},
	{
		id: generateUniqueId("sup"),
		email: "support@pro-fire-services.com",
		password: "password123",
		name: "Pro Fire Services",
		nic: "951234567V",
		supplierType: "Services",
		phone: "555-0105",
		rating: 3.9,
		status: "active",
		supplyCount: 45,
		failedSupplyCount: 8,
	},
];

const importData = async () => {
	try {
		await Supplier.create(suppliers);
		console.log("Data Imported Successfully!");
	} catch (err) {
		console.error("Error importing data:", err);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await Supplier.deleteMany();
		console.log("Data Destroyed Successfully!");
	} catch (err) {
		console.error("Error destroying data:", err);
		process.exit(1);
	}
};

const run = async () => {
	await connectDatabase();

	await destroyData();
	await importData();
	process.exit();
};

run();
