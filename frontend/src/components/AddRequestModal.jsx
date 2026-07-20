import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import extractErrorMessage from "../utils/errorMessageParser";
import { createSupplyRequest } from "../services/supply/supplyRequestService";

export function AddRequestModal({ setShowAddModal, fetchRequests, setError }) {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "",
		quantity: 1,
		unit: "units",
		applicationDeadline: new Date(
			Date.now() + 14 * 24 * 60 * 60 * 1000
		).toLocaleDateString("en-CA"), // Default to 2 weeks from now
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		let processedValue = value;

		if (name === "quantity") {
			const num = parseInt(value, 10);
			// Prevent non-numeric input or values less than 1
			processedValue = isNaN(num) || num < 1 ? 1 : num;
		}
		if (name === "unit") {
			// Use a regular expression to replace any digit [0-9] with an empty string
			processedValue = value.replace(/[0-9]/g, "");
		}

		setFormData((prev) => ({
			...prev,
			[name]: processedValue,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const sendRequest = async () => {
			try {
				await createSupplyRequest(formData);
				fetchRequests();
				toast.success("Request created successfully");
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setFormData({
					title: "",
					description: "",
					category: "",
					quantity: 1,
					unit: "units",
					applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
				});
			}
		};
		sendRequest();

		setShowAddModal(false);
	};
	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-800">
						Create New Request
					</h2>
					<button
						onClick={() => {
							setShowAddModal(false);
						}}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<X size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-4">
					<div className="space-y-4">
						<div>
							<label
								htmlFor="title"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Request Title *
							</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Description *
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div className="flex gap-4">
							<div className="flex-1">
								<label
									htmlFor="category"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Category *
								</label>
								<select
									id="category"
									name="category"
									value={formData.category}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
									required
								>
									<option value="">Select a type</option>
									<option value="Equipment">Equipment</option>
									<option value="Vehicle Maintenance">
										Vehicle Maintenance
									</option>
									<option value="Uniforms">Uniforms</option>
									<option value="Medical Supplies">Medical Supplies</option>
									<option value="Services">Services</option>
									<option value="Other">Other</option>
								</select>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex-1">
								<label
									htmlFor="quantity"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Quantity *
								</label>
								<input
									type="number"
									id="quantity"
									name="quantity"
									value={formData.quantity}
									onChange={handleChange}
									min="1"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
									required
								/>
							</div>
							<div className="flex-1">
								<label
									htmlFor="unit"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Unit *
								</label>
								<input
									type="text"
									id="unit"
									name="unit"
									value={formData.unit}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
									required
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="applicationDeadline"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Application Deadline *
							</label>
							<input
								type="date"
								id="applicationDeadline"
								name="applicationDeadline"
								value={formData.applicationDeadline}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								min={new Date().toLocaleDateString("en-CA")}
								required
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={() => {
								setShowAddModal(false);
							}}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-fire text-white rounded-md hover:bg-fire-dark transition-colors"
						>
							Create Request
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
