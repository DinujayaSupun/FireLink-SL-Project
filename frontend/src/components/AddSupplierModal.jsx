import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { createSupplier } from "../services/supply/supplyService";
import extractErrorMessage from "../utils/errorMessageParser";
import { toast } from "react-toastify";

export function AddSupplierModal({
	setShowAddModal,
	setError,
	fetchSuppliers,
}) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		nic: "",
		supplierType: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordError, setPasswordError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;

		let processedValue = value;

		if (name === "phone") {
			const numericValue = value.replace(/\D/g, "");

			if (numericValue.length > 0 && numericValue.charAt(0) !== "0") {
				processedValue = "";
			} else {
				processedValue = numericValue.substring(0, 10);
			}
		}

		if (name === "nic") {
			const upperValue = value.toUpperCase();
			let formattedNic = "";

			// Rule 1: First 9 characters must be digits
			const firstPart = upperValue.substring(0, 9).replace(/\D/g, "");
			formattedNic += firstPart;

			if (upperValue.length > 9) {
				const tenthChar = upperValue.charAt(9);

				// Rule 2: 10th char can be a digit, 'V', or 'X'
				if (/[0-9VX]/.test(tenthChar)) {
					formattedNic += tenthChar;

					// Rule 3: If 10th char is 'V' or 'X', stop here
					if (/[VX]/.test(tenthChar)) {
						formattedNic = formattedNic.substring(0, 10);
					}
					// Rule 4: If 10th char is a number, allow up to 2 more digits
					else if (/\d/.test(tenthChar) && upperValue.length > 10) {
						const lastPart = upperValue.substring(10, 12).replace(/\D/g, "");
						formattedNic += lastPart;
					}
				}
			}
			processedValue = formattedNic;
		}

		setFormData((prev) => ({
			...prev,
			[name]: processedValue,
		}));

		if (name === "password" || name === "confirmPassword") {
			setPasswordError("");
		}
	};

	const validatePasswords = () => {
		if (formData.password !== formData.confirmPassword) {
			setPasswordError("Passwords do not match");
			return false;
		}
		if (formData.password.length < 8) {
			setPasswordError("Password must be at least 8 characters long");
			return false;
		}
		return true;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validatePasswords()) {
			return;
		}
		const fetchData = async () => {
			try {
				await createSupplier(formData);
				fetchSuppliers();
				toast.success("Supplier Added successfully! ");
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setFormData({
					name: "",
					email: "",
					phone: "",
					nic: "",
					supplierType: "",
					password: "",
					confirmPassword: "",
				});
				setShowAddModal(false);
			}
		};

		fetchData();
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-800">
						Add New Supplier
					</h2>
					<button
						onClick={() => setShowAddModal(false)}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<X size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-4">
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Supplier Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email Address *
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Phone Number *
							</label>
							<input
								type="text"
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="nic"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								NIC / Registration Number *
							</label>
							<input
								type="text"
								id="nic"
								name="nic"
								value={formData.nic}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="supplierType"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Supplier Type *
							</label>
							<select
								id="supplierType"
								name="supplierType"
								value={formData.supplierType}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
								required
							>
								<option value="">Select a type</option>
								<option value="Equipment">Equipment</option>
								<option value="Vehicle Maintenance">Vehicle Maintenance</option>
								<option value="Uniforms">Uniforms</option>
								<option value="Medical Supplies">Medical Supplies</option>
								<option value="Services">Services</option>
								<option value="Other">Other</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password *
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
									required
									minLength={8}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Password must be at least 8 characters long
							</p>
						</div>
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Confirm Password *
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									id="confirmPassword"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
									required
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
							{passwordError && (
								<p className="text-xs text-fire mt-1">{passwordError}</p>
							)}
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowAddModal(false)}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-fire text-white rounded-md hover:bg-fire-dark transition-colors"
						>
							Add Supplier
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
