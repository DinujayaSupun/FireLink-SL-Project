const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const errorMiddleware = require("./middlewares/errors");

const userRouter = require("./routes/UserManagement/UserRoute.js");
const sessionRouter = require("./routes/UserManagement/TrainingSessionRoute.js");
const attendanceRouter = require("./routes/UserManagement/AttendanceRoute.js");
const shiftScheduleRoutes = require("./routes/UserManagement/ShiftScheduleRoute.js");
const preventionCertificateRoutes = require("./routes/preventionCertificateRoutes");
const preventionOfficerRoutes = require("./routes/preventionOfficerRoutes");
const shiftChangeRoutes = require("./routes/UserManagement/shiftChangeRoutes.js");

// Register schemas BEFORE routes
require("./models/UserManagement/Attendance.js"); // Attendance schema
require("./models/UserManagement/UserReg.js");
require("./models/UserManagement/TrainingSession.js");
require("./models/UserManagement/ShiftSchedule.js");
require("./models/Mission.js"); // Mission schema
// setting up config file
dotenv.config({ path: "config/config.env" });

// Add FRONTEND_URL to config.env if not set
if (!process.env.FRONTEND_URL) {
	process.env.FRONTEND_URL = "http://localhost:5173";
}

// cors
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// import all routes
const mission = require("./routes/missionRoutes");
const salaryRoutes = require("./routes/salaryRoutes");

// mount routes
app.use("/api/v1/missions", mission);
app.use("/api/v1/salaries", salaryRoutes);

// Mount dashboard stats FIRST to avoid being captured by dynamic :id route in inventoryRoutes
app.use("/api/inventory", require("./routes/inventoryDashboardRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/inventory-reorders", require("./routes/inventoryReorderRoutes"));
app.use(
	"/api/inventory-vehicle-items",
	require("./routes/inventoryVehicleItemsRoutes")
);
app.use("/api/inventory-vehicles", require("./routes/inventoryVehicleRoutes"));
app.use("/api/inventory-logs", require("./routes/inventoryLogRoutes"));
app.use("/api/v1/supplier", require("./routes/supplierRoutes"));
app.use("/api/v1/supply-requests", require("./routes/supplyRequestRoutes"));
app.use("/api/v1/supply-reports", require("./routes/supplyReportRoutes.js"));
app.use("/api/v1/finance", require("./routes/financeRoutes"));

// Prevention certificate route
app.use("/api/prevention/certificates", preventionCertificateRoutes);
app.use("/api/prevention-officer", preventionOfficerRoutes);

// User Registration endpoint
app.use("/users", userRouter);
app.use("/sessions", sessionRouter);
app.use("/attendance", attendanceRouter);
app.use("/shift-schedules", shiftScheduleRoutes);
app.use("/shift-change-requests", shiftChangeRoutes);
app.use("/api/shiftChange", shiftChangeRoutes);
// Same router as /shift-schedules above, kept for the frontend's /api/shifts calls
app.use("/api/shifts", shiftScheduleRoutes);

// Civilian login endpoint
const civilianAuthRoutes = require("./routes/UserManagement/civilianAuthRoutes.js");
app.use("/api/v1/civilian-auth", civilianAuthRoutes);

app.get("/", (req, res) => {
	res.send("Fire Handling System API running");
});

// Error handling must be mounted AFTER every route: Express only looks forward
// through the stack from where next(err) was called, so an error handler mounted
// above a router can never see that router's errors.
app.use(errorMiddleware);

module.exports = app;
