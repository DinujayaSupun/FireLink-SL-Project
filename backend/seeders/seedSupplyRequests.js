const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const SupplyRequest = require("../models/SupplyRequest");
const connectDatabase = require("../config/database");
const generateUniqueId = require("../utils/generateUniqueId");

// Resolved from this file, not the working directory
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const sampleSupplyRequests = [
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2a"),
		title: "Winter Uniforms and Gear",
		description:
			"Request for waterproof winter uniforms and protective gear for patrol officers.",
		category: "Uniforms",
		quantity: 50,
		unit: "sets",
		public: true,
		status: "Open",
		applicationDeadline: new Date("2026-11-15T00:00:00Z"),
		bids: [
			{
				supplier: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2b"),
				offerPrice: 25000,
				notes: "Discount for bulk order.",
				deliveryDate: new Date("2026-11-30T00:00:00Z"),
			},
			{
				supplier: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2c"),
				offerPrice: 26500,
				notes: "Includes fast shipping.",
				deliveryDate: new Date("2026-12-05T00:00:00Z"),
			},
		],
	},
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2d"),
		title: "Vehicle Maintenance for Fleet 1",
		description: "Routine maintenance service for ten vehicles in Fleet 1.",
		category: "Vehicle Maintenance",
		quantity: 1,
		unit: "service",
		public: false,
		status: "Open",
		applicationDeadline: new Date("2026-12-01T00:00:00Z"),
		assignedSupplier: null,
	},
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2a"),
		title: "First-Aid Kits Replenishment",
		description:
			"Bulk order of standard first-aid kits for all patrol cars and stations.",
		category: "Medical Supplies",
		quantity: 100,
		unit: "kits",
		public: true,
		status: "Closed",
		applicationDeadline: new Date("2025-09-01T00:00:00Z"),
		assignedSupplier: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2b"),
	},
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2e"),
		title: "New Fire Extinguishers",
		description:
			"Procurement of new fire extinguishers for all public buildings.",
		category: "Equipment",
		quantity: 75,
		unit: "units",
		public: true,
		status: "Open",
		applicationDeadline: new Date("2026-03-20T00:00:00Z"),
		bids: [],
		assignedSupplier: null,
	},
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2f"),
		title: "IT Support Services",
		description: "Annual contract for IT support and network maintenance.",
		category: "Services",
		quantity: 1,
		unit: "contract",
		public: true,
		status: "Closed",
		applicationDeadline: new Date("2025-07-01T00:00:00Z"),
		assignedSupplier: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2d"),
	},
	{
		id: generateUniqueId("req"),
		createdBy: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2d"),
		title: "Emergency Food and Water Rations",
		description:
			"Replenishment of emergency rations for disaster preparedness kits.",
		category: "Other",
		quantity: 500,
		unit: "rations",
		public: false,
		status: "Open",
		applicationDeadline: new Date("2026-06-30T00:00:00Z"),
		bids: [
			{
				supplier: new mongoose.Types.ObjectId("60c72b2f9f1b2c001f8e4d2e"),
				offerPrice: 5000,
				notes: "Can supply immediately.",
				deliveryDate: new Date("2026-07-15T00:00:00Z"),
			},
		],
		assignedSupplier: null,
	},
];

const importData = async () => {
	try {
		await SupplyRequest.create(sampleSupplyRequests);
		console.log("Supply request data imported successfully!");
	} catch (err) {
		console.error("Error importing data:", err);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await SupplyRequest.deleteMany();
		console.log("All supply request data successfully deleted!");
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
