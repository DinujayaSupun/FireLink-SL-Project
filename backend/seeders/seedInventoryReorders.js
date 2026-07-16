const mongoose = require("mongoose");
const path = require("path");
const InventoryReorder = require("../models/inventoryReorder");
const Inventory = require("../models/Inventory");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

// Sample reorder data
const sampleReorders = [
	{
		item_ID: 1001,
		quantity: 25,
		priority: "High",
		expectedDate: new Date("2025-09-15"),
		supplier: "Fire Safety Supplies Co.",
		notes: "Urgent replacement needed for damaged units",
		status: "Pending",
	},
	{
		item_ID: 1002,
		quantity: 30,
		priority: "Medium",
		expectedDate: new Date("2025-09-20"),
		supplier: "Emergency Equipment Ltd.",
		notes: "Regular restocking order",
		status: "Approved",
	},
	{
		item_ID: 1003,
		quantity: 15,
		priority: "Urgent",
		expectedDate: new Date("2025-09-10"),
		supplier: "Safety First Supplies",
		notes: "Critical safety equipment - expedite delivery",
		status: "In Transit",
	},
	{
		item_ID: 1004,
		quantity: 20,
		priority: "Low",
		expectedDate: new Date("2025-09-25"),
		supplier: "Fire Equipment Pro",
		notes: "Preventive restocking",
		status: "Pending",
	},
	{
		item_ID: 1005,
		quantity: 12,
		priority: "High",
		expectedDate: new Date("2025-09-12"),
		supplier: "Emergency Response Gear",
		notes: "Replace expired units",
		status: "Delivered",
	},
];

const seedInventoryReorders = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.DB_URI);
		console.log("Connected to MongoDB");

		// Clear existing reorders
		await InventoryReorder.deleteMany({});
		console.log("Cleared existing reorders");

		// Get inventory items to reference
		const inventoryItems = await Inventory.find({});
		if (inventoryItems.length === 0) {
			console.log("No inventory items found. Please run inventory seed first.");
			process.exit(1);
		}

		// Create reorders with proper inventory references
		const createdReorders = [];
		for (const reorderData of sampleReorders) {
			// Find matching inventory item
			const inventoryItem = inventoryItems.find(
				(item) => item.item_ID === reorderData.item_ID
			);

			if (inventoryItem) {
				const reorder = new InventoryReorder({
					inventoryItemId: inventoryItem._id,
					item_ID: inventoryItem.item_ID,
					item_name: inventoryItem.item_name,
					category: inventoryItem.category,
					quantity: reorderData.quantity,
					priority: reorderData.priority,
					expectedDate: reorderData.expectedDate,
					supplier: reorderData.supplier,
					notes: reorderData.notes,
					status: reorderData.status,
				});

				await reorder.save();
				createdReorders.push(reorder);
				console.log(`Created reorder for ${reorder.item_name}`);
			} else {
				console.log(
					`Skipped reorder for item ID ${reorderData.item_ID} - not found in inventory`
				);
			}
		}

		// Get statistics
		const totalReorders = await InventoryReorder.countDocuments();
		const pendingReorders = await InventoryReorder.countDocuments({
			status: "Pending",
		});
		const urgentReorders = await InventoryReorder.countDocuments({
			priority: "Urgent",
		});

		console.log("\nInventory Reorders Seeding Complete!");
		console.log(`Total Reorders: ${totalReorders}`);
		console.log(`Pending: ${pendingReorders}`);
		console.log(`Urgent: ${urgentReorders}`);
		console.log(`Successfully created: ${createdReorders.length} reorders`);

		// Show some sample data
		console.log("\nSample Reorders:");
		createdReorders.slice(0, 3).forEach((reorder) => {
			console.log(
				`  - ${reorder.item_name}: ${reorder.quantity} units (${reorder.priority} priority, ${reorder.status})`
			);
		});
	} catch (error) {
		console.error("Error seeding inventory reorders:", error);
	} finally {
		// Close connection
		await mongoose.connection.close();
		console.log("MongoDB connection closed");
		process.exit(0);
	}
};

// Run the seeding
seedInventoryReorders();
