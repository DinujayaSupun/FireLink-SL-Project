const mongoose = require("mongoose");
const { Schema } = mongoose;

const SupplyRequestSchema = new Schema(
	{
		id: {
			type: String,
			required: [true, "Request id is required"],
			unique: true,
			trim: true,
		},
		title: {
			type: String,
			required: [true, "A title for the request is required"],
			trim: true,
			maxLength: [200, "Title cannot exceed 200 characters"],
		},
		description: {
			type: String,
			required: [true, "A detailed description is required"],
		},
		category: {
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
		},
		quantity: {
			type: Number,
			required: [true, "Please specify the quantity required"],
			min: [1, "Quantity must be at least 1"],
		},
		unit: {
			type: String,
			trim: true,
			maxLength: [15, "Unit cannot exceed 15 characters"],
		},
		status: {
			type: String,
			required: true,
			enum: ["Open", "Assigned", "Rejected", "Closed"],
			default: "Open",
		},
		applicationDeadline: {
			type: Date,
			required: [true, "An application deadline is required"],
		},
		assignedSupplier: {
			type: Schema.Types.ObjectId,
			ref: "Supplier",
			default: null,
		},
		bids: [
			{
				supplier: {
					type: Schema.Types.ObjectId,
					ref: "Supplier",
					required: true,
				},
				offerPrice: {
					type: Number,
					required: true,
				},
				notes: {
					type: String,
					trim: true,
				},
				submittedAt: {
					type: Date,
					default: Date.now,
				},
				deliveryDate: {
					type: Date,
					required: [true, "Please specify a delivery date"],
				},
			},
		],
		deliveredAt: {
			type: Date,
			default: null,
		},
		onTime: {
			type: Boolean,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

SupplyRequestSchema.index({ status: 1 });
SupplyRequestSchema.index({ category: 1 });
SupplyRequestSchema.index({ applicationDeadline: 1 });
SupplyRequestSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("SupplyRequest", SupplyRequestSchema);
