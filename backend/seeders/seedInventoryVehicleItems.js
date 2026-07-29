const mongoose = require('mongoose');
const path = require('path');
const InventoryVehicleItems = require('../models/inventoryVehicleItems');
const Vehicle = require('../models/inventoryVehicle');
const Inventory = require('../models/Inventory');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

// Sample vehicle items data for testing
const sampleVehicleItems = [
  {
    vehicle_ID: null, // Will be populated with actual vehicle ID
    item_ID: null,    // Will be populated with actual item ID
    quantity: 5,
    assignedDate: new Date('2024-01-15')
  },
  {
    vehicle_ID: null, // Will be populated with actual vehicle ID
    item_ID: null,    // Will be populated with actual item ID
    quantity: 3,
    assignedDate: new Date('2024-01-20')
  },
  {
    vehicle_ID: null, // Will be populated with actual vehicle ID
    item_ID: null,    // Will be populated with actual item ID
    quantity: 2,
    assignedDate: new Date('2024-02-01')
  }
];

// Connect to MongoDB and seed data
const seedInventoryVehicleItems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Get existing vehicles and items
    const vehicles = await Vehicle.find().limit(3);
    const items = await Inventory.find().limit(3);

    if (vehicles.length === 0) {
      console.log('No vehicles found. Please run seed:vehicles first.');
      process.exit(1);
    }

    if (items.length === 0) {
      console.log('No inventory items found. Please run seed:inventory first.');
      process.exit(1);
    }

    // Clear existing vehicle items data
    await InventoryVehicleItems.deleteMany({});
    console.log('Cleared existing vehicle items data');

    // Populate sample data with actual IDs
    const populatedVehicleItems = sampleVehicleItems.map((item, index) => ({
      ...item,
      vehicle_ID: vehicles[index % vehicles.length]._id,
      item_ID: items[index % items.length]._id
    }));

    // Insert sample data
    const result = await InventoryVehicleItems.insertMany(populatedVehicleItems);
    console.log(`Successfully seeded ${result.length} vehicle items`);

    // Display some statistics
    const totalVehicleItems = await InventoryVehicleItems.countDocuments();
    const vehicleItemsByVehicle = await InventoryVehicleItems.aggregate([
      {
        $group: {
          _id: '$vehicle_ID',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nVehicle Items Statistics:');
    console.log(`Total Vehicle Items: ${totalVehicleItems}`);
    console.log(`Vehicles with Items: ${vehicleItemsByVehicle.length}`);

    console.log('\nSample Assignments:');
    for (let i = 0; i < result.length; i++) {
      const vehicleItem = result[i];
      const vehicle = vehicles[i % vehicles.length];
      const item = items[i % items.length];
      console.log(`- ${vehicle.vehicle_name} ← ${item.item_name} (Qty: ${vehicleItem.quantity})`);
    }

    console.log('\nVehicle Items seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding vehicle items:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedInventoryVehicleItems();
