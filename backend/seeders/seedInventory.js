const mongoose = require("mongoose");
const path = require("path");
const Inventory = require("../models/Inventory");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

// Sample inventory data for FireLink SL
const sampleInventory = [
	{
		item_ID: 1001,
		item_name: "Fire Extinguisher - CO2",
		category: "Firefighting Equipment",
		quantity: 25,
		condition: "Good",
		location: "Main Station - Equipment Room A",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2026-12-31"),
	},
	{
		item_ID: 1002,
		item_name: "Fire Extinguisher - Foam",
		category: "Firefighting Equipment",
		quantity: 18,
		condition: "Good",
		location: "Main Station - Equipment Room A",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2026-12-31"),
	},
	{
		item_ID: 1003,
		item_name: "Fire Hose - 2.5 inch",
		category: "Firefighting Equipment",
		quantity: 12,
		condition: "Good",
		location: "Main Station - Hose Storage",
		status: "Available",
		threshold: 3,
		expire_date: null,
	},
	{
		item_ID: 1004,
		item_name: "Fire Hose - 1.5 inch",
		category: "Firefighting Equipment",
		quantity: 20,
		condition: "Good",
		location: "Main Station - Hose Storage",
		status: "Available",
		threshold: 5,
		expire_date: null,
	},
	{
		item_ID: 1005,
		item_name: "Fire Helmet - Standard",
		category: "Personal Protective Equipment",
		quantity: 35,
		condition: "Good",
		location: "Main Station - PPE Storage",
		status: "Available",
		threshold: 8,
		expire_date: null,
	},
	{
		item_ID: 1006,
		item_name: "Fire Jacket - Heat Resistant",
		category: "Personal Protective Equipment",
		quantity: 30,
		condition: "Good",
		location: "Main Station - PPE Storage",
		status: "Available",
		threshold: 8,
		expire_date: null,
	},
	{
		item_ID: 1007,
		item_name: "Fire Boots - Steel Toe",
		category: "Personal Protective Equipment",
		quantity: 32,
		condition: "Good",
		location: "Main Station - PPE Storage",
		status: "Available",
		threshold: 8,
		expire_date: null,
	},
	{
		item_ID: 1008,
		item_name: "Oxygen Tank - Medical",
		category: "Medical Supplies",
		quantity: 15,
		condition: "Good",
		location: "Main Station - Medical Storage",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2025-06-30"),
	},
	{
		item_ID: 1009,
		item_name: "First Aid Kit - Complete",
		category: "Medical Supplies",
		quantity: 22,
		condition: "Good",
		location: "Main Station - Medical Storage",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2025-12-31"),
	},
	{
		item_ID: 1010,
		item_name: "Defibrillator - AED",
		category: "Medical Equipment",
		quantity: 8,
		condition: "Good",
		location: "Main Station - Medical Storage",
		status: "Available",
		threshold: 2,
		expire_date: new Date("2026-03-31"),
	},
	{
		item_ID: 1011,
		item_name: "Thermal Imaging Camera",
		category: "Electronics",
		quantity: 5,
		condition: "Good",
		location: "Main Station - Equipment Room B",
		status: "Available",
		threshold: 2,
		expire_date: null,
	},
	{
		item_ID: 1012,
		item_name: "Radio - Handheld",
		category: "Electronics",
		quantity: 28,
		condition: "Good",
		location: "Main Station - Equipment Room B",
		status: "Available",
		threshold: 5,
		expire_date: null,
	},
	{
		item_ID: 1013,
		item_name: "Flashlight - LED",
		category: "Tools",
		quantity: 40,
		condition: "Good",
		location: "Main Station - Tool Storage",
		status: "Available",
		threshold: 8,
		expire_date: null,
	},
	{
		item_ID: 1014,
		item_name: "Axe - Fire",
		category: "Tools",
		quantity: 15,
		condition: "Good",
		location: "Main Station - Tool Storage",
		status: "Available",
		threshold: 3,
		expire_date: null,
	},
	{
		item_ID: 1015,
		item_name: "Crowbar - Heavy Duty",
		category: "Tools",
		quantity: 12,
		condition: "Good",
		location: "Main Station - Tool Storage",
		status: "Available",
		threshold: 3,
		expire_date: null,
	},
	{
		item_ID: 1016,
		item_name: "Uniform - Firefighter",
		category: "Uniforms",
		quantity: 45,
		condition: "Good",
		location: "Main Station - Uniform Storage",
		status: "Available",
		threshold: 10,
		expire_date: null,
	},
	{
		item_ID: 1018,
		item_name: "Gloves - Heat Resistant",
		category: "Personal Protective Equipment",
		quantity: 50,
		condition: "Good",
		location: "Main Station - PPE Storage",
		status: "Available",
		threshold: 10,
		expire_date: new Date("2025-08-31"),
	},
	{
		item_ID: 1019,
		item_name: "Fire Blanket",
		category: "Firefighting Equipment",
		quantity: 8,
		condition: "Good",
		location: "Main Station - Equipment Room A",
		status: "Available",
		threshold: 2,
		expire_date: null,
	},
	{
		item_ID: 1020,
		item_name: "Hydrant Wrench",
		category: "Tools",
		quantity: 6,
		condition: "Good",
		location: "Main Station - Tool Storage",
		status: "Available",
		threshold: 2,
		expire_date: null,
	},
	{
		item_ID: 1021,
		item_name: "Fire Extinguisher - Powder",
		category: "Firefighting Equipment",
		quantity: 3,
		condition: "Good",
		location: "Main Station - Equipment Room A",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2026-12-31"),
	},
	{
		item_ID: 1022,
		item_name: "Medical Bandages",
		category: "Medical Supplies",
		quantity: 200,
		condition: "Good",
		location: "Main Station - Medical Storage",
		status: "Available",
		threshold: 50,
		expire_date: new Date("2025-10-31"),
	},
	{
		item_ID: 1023,
		item_name: "Fire Extinguisher - Water",
		category: "Firefighting Equipment",
		quantity: 2,
		condition: "Good",
		location: "Main Station - Equipment Room A",
		status: "Available",
		threshold: 5,
		expire_date: new Date("2026-12-31"),
	},
];

// Connect to MongoDB and seed data
const seedInventory = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.DB_URI);
		console.log("Connected to MongoDB");

		// Clear existing inventory data
		await Inventory.deleteMany({});
		console.log("Cleared existing inventory data");

		// Insert sample data
		const result = await Inventory.insertMany(sampleInventory);
		console.log(`Successfully seeded ${result.length} inventory items`);

		// Display some statistics
		const totalItems = await Inventory.countDocuments();
		const lowStockItems = await Inventory.findLowStock();
		const expiredItems = await Inventory.findExpired();
		const damagedItems = await Inventory.countDocuments({
			condition: "Damaged",
		});

		console.log("\n Inventory Statistics:");
		console.log(`Total Items: ${totalItems}`);
		console.log(`Low Stock Items: ${lowStockItems.length}`);
		console.log(`Expired Items: ${expiredItems.length}`);
		console.log(`Damaged Items: ${damagedItems}`);

		console.log("\n Sample Categories:");
		const categories = await Inventory.distinct("category");
		categories.forEach((category) => {
			console.log(`- ${category}`);
		});

		console.log("\n Alerts:");
		if (lowStockItems.length > 0) {
			console.log(` Low Stock Items (${lowStockItems.length}):`);
			lowStockItems.slice(0, 5).forEach((item) => {
				console.log(
					`   - ${item.item_name}: ${item.quantity}/${item.threshold}`
				);
			});
		}

		if (expiredItems.length > 0) {
			console.log(` Expired Items (${expiredItems.length}):`);
			expiredItems.slice(0, 5).forEach((item) => {
				console.log(`   - ${item.item_name}: Expired ${item.expire_date}`);
			});
		}

		console.log("\n Inventory seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error(" Error seeding inventory:", error);
		process.exit(1);
	}
};

// Run the seeding function
seedInventory();
