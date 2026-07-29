const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const supplierSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: [true, "User id is required"],
			unique: true,
		},
		email: {
			type: String,
			required: [true, "A login email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please provide a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		lastLogin: {
			type: Date,
		},
		name: {
			type: String,
			required: [true, "Supplier name is required"],
			trim: true,
			maxLength: [150, "Supplier name cannot exceed 150 characters"],
		},
		nic: {
			type: String,
			required: [true, "Supplier NIC is required"],
			maxLength: [12, "Supplier NIC cannot exceed 12 characters"],
			unique: true,
		},
		supplierType: {
			type: String,
			required: true,
			enum: [
				"Equipment",
				"Vehicle Maintenance",
				"Uniforms",
				"Medical Supplies",
				"Services",
				"Other",
			],
			default: "Other",
		},
		phone: {
			type: String,
			required: [true, "A contact phone number is required"],
			trim: true,
		},
		supplyCount: {
			type: Number,
			required: true,
			default: 0,
		},
		failedSupplyCount: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

supplierSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	const salt = await bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

supplierSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

supplierSchema.methods.getJwt = function () {
	// `type` distinguishes this from staff/civilian tokens, which share JWT_SECRET.
	return jwt.sign({ id: this._id, type: "supplier" }, process.env.JWT_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXP,
	});
};

supplierSchema.index({ email: 1 });
supplierSchema.index({ name: "text" });
supplierSchema.index({ supplierType: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);
