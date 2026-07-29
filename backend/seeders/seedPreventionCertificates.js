const mongoose = require('mongoose');
const path = require('path');
const PreventionCertificate = require('../models/preventionCertificate');
// Resolved from this file, not the working directory
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const samplePreventionCertificates = [
  // Pending Applications (3)
  {
    fullName: "John Smith",
    nic: "199012345678",
    address: "100 New Street, Colombo 01",
    contactNumber: "0771234560",
    email: "john.smith@email.com",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    status: "Pending",
    appliedDate: new Date("2025-10-12")
  },
  {
    fullName: "Sarah Johnson",
    nic: "199156789012",
    address: "200 Hill Avenue, Kandy",
    contactNumber: "0772345671",
    email: "sarah.johnson@email.com",
    constructionType: "Renovation",
    serviceType: "Safety Audit",
    urgencyLevel: "Urgent",
    status: "Pending",
    appliedDate: new Date("2025-10-11")
  },
  {
    fullName: "Michael Brown",
    nic: "199287654321",
    address: "300 Lake Road, Galle",
    contactNumber: "0773456782",
    email: "michael.brown@email.com",
    constructionType: "Building",
    serviceType: "Inspection",
    urgencyLevel: "Normal",
    status: "Pending",
    appliedDate: new Date("2025-10-10")
  },
  
  // Approved Applications (2)
  {
    fullName: "Lisa Anderson",
    nic: "199398765432",
    address: "400 Park Lane, Negombo",
    contactNumber: "0774567893",
    email: "lisa.anderson@email.com",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    status: "Approved",
    approvedAt: new Date("2025-10-11"),
    appliedDate: new Date("2025-10-09")
  },
  {
    fullName: "David Wilson",
    nic: "199445678901",
    address: "500 Beach Road, Matara",
    contactNumber: "0775678904",
    email: "david.wilson@email.com",
    constructionType: "Renovation",
    serviceType: "Safety Audit",
    urgencyLevel: "Normal",
    status: "Approved",
    approvedAt: new Date("2025-10-10"),
    appliedDate: new Date("2025-10-08")
  },
  
  // Payment Assigned Applications (2)
  {
    fullName: "Emma Davis",
    nic: "199556789012",
    address: "600 Mountain View, Kurunegala",
    contactNumber: "0776789015",
    email: "emma.davis@email.com",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    status: "Payment Assigned",
    payment: 2000,
    paymentAssignedAt: new Date("2025-10-11"),
    appliedDate: new Date("2025-10-08")
  },
  {
    fullName: "James Miller",
    nic: "199667890123",
    address: "700 Valley Road, Anuradhapura",
    contactNumber: "0777890126",
    email: "james.miller@email.com",
    constructionType: "Other",
    serviceType: "Inspection",
    urgencyLevel: "Normal",
    status: "Payment Assigned",
    payment: 1200,
    paymentAssignedAt: new Date("2025-10-10"),
    appliedDate: new Date("2025-10-07")
  },
  
  // Inspected Applications (3)
  {
    fullName: "Amaya Silva",
    nic: "199512345678",
    address: "123 Main Street, Colombo 03",
    contactNumber: "0756784321",
    email: "amaya.silva@email.com",
    constructionType: "Building",
    serviceType: "Other",
    urgencyLevel: "Normal",
    status: "Inspected",
    inspectionNotes: "Building structure is satisfactory. Fire safety measures are adequate.",
    inspectionDate: new Date("2025-10-10"),
    appliedDate: new Date("2025-10-08")
  },
  {
    fullName: "Naduni Dissanayake",
    nic: "199678901234",
    address: "258 School Road, Ratnapura",
    contactNumber: "0774903861",
    email: "naduni.dissanayake@email.com",
    constructionType: "Building",
    serviceType: "Safety Audit",
    urgencyLevel: "Normal",
    status: "Inspected",
    inspectionNotes: "This is fine.",
    inspectionDate: new Date("2025-10-11"),
    appliedDate: new Date("2025-10-09")
  },
  {
    fullName: "Kalum Wikrama",
    nic: "199556781234",
    address: "369 Market Street, Badulla",
    contactNumber: "0776939048",
    email: "kalum.wikrama@email.com",
    constructionType: "Building",
    serviceType: "Safety Audit",
    urgencyLevel: "Normal",
    status: "Inspected",
    inspectionNotes: "It is fully handled.",
    inspectionDate: new Date("2025-10-10"),
    appliedDate: new Date("2025-10-08")
  },
  
  // Rejected Applications (2)
  {
    fullName: "Robert Taylor",
    nic: "199778901234",
    address: "800 River Side, Polonnaruwa",
    contactNumber: "0778901237",
    email: "robert.taylor@email.com",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    status: "Rejected",
    rejectionReason: "Incomplete documentation provided",
    rejectedAt: new Date("2025-10-11"),
    appliedDate: new Date("2025-10-09")
  },
  {
    fullName: "Jennifer Moore",
    nic: "199889012345",
    address: "900 Forest Lane, Hambantota",
    contactNumber: "0779012348",
    email: "jennifer.moore@email.com",
    constructionType: "Renovation",
    serviceType: "Inspection",
    urgencyLevel: "Normal",
    status: "Rejected",
    rejectionReason: "Does not meet safety requirements",
    rejectedAt: new Date("2025-10-10"),
    appliedDate: new Date("2025-10-08")
  }
];

const seedPreventionCertificates = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await PreventionCertificate.deleteMany({});
    console.log('Existing prevention certificates deleted');
    
    // Insert sample data
    const createdCertificates = await PreventionCertificate.insertMany(samplePreventionCertificates);
    console.log(`${createdCertificates.length} prevention certificates created successfully`);
    console.log('Distribution:');
    console.log('- Pending: 3 applications');
    console.log('- Approved: 2 applications');  
    console.log('- Payment Assigned: 2 applications');
    console.log('- Inspected: 3 applications');
    console.log('- Rejected: 2 applications');
    
    console.log('Prevention certificates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding prevention certificates:', error);
    process.exit(1);
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedPreventionCertificates();
}

module.exports = seedPreventionCertificates;