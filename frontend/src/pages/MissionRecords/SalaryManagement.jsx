import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SalaryManagement.css";
import { salaryService } from "../../services/salaryService";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const initialForm = {
	employeeName: "",
	email: "",
	role: "",
	totalWorkingDays: 30,
	daysPresent: 0,
	daysAbsent: 0,
	basicSalary: 0,
	perDaySalary: 0,
	otHours: 0,
	otPay: 0,
	mealAllowance: 0,
	transportAllowance: 0,
	medicalAllowance: 0,
	noPayLeaves: 0,
	taxRate: 6,
	epfRate: 8,
	epfAmount: 0,
	finalSalary: 0,
};

const SalaryManagement = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState(initialForm);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [userId, setUserId] = useState("");
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);

	// Per hour rate 
	const perHourRate = useMemo(() => {
		const perDay = Number(form.perDaySalary) || 0;
		return perDay / 8;
	}, [form.perDaySalary]);

	// Main calculat
	useEffect(() => {
		const totalDays = 30; 
		const present = Math.max(1, Math.min(Number(form.daysPresent) || 1, totalDays)); // avoid divide by 0
		const absent = totalDays - present;
		const basic = Math.max(0, Number(form.basicSalary) || 0);

		//  Per day salary = basicSalary / daysPresent
		const perDay = basic / present;

		//  Normal hourly rate
		const normalRate = perDay / 8;

		//  OT rate = 2 × normal hourly rate
		const otRate = normalRate * 2;

		// OT pay = otRate × otHours
		const otHours = Math.max(0, Number(form.otHours) || 0);
		const otPay = otRate * otHours;

		// Allowances
		const meal = Math.max(0, Number(form.mealAllowance) || 0);
		const transport = Math.max(0, Number(form.transportAllowance) || 0);
		const medical = Math.max(0, Number(form.medicalAllowance) || 0);

		// Deductions
		const noPayDays = Math.max(0, Number(form.noPayLeaves) || 0);
		const noPay = noPayDays * perDay;

		const taxRate = Math.max(0, Number(form.taxRate) || 0);
		const epfRate = Math.max(0, Number(form.epfRate) || 0);

		// Gross salary
		const gross = basic + otPay + meal + transport + medical;

		// EPF & Tax
		const epfAmount = (basic * epfRate) / 100;
		const taxAmount = (gross * taxRate) / 100;

		// Final salary
		const finalSal = gross - (noPay + taxAmount + epfAmount);

		setForm((prev) => ({
			...prev,
			totalWorkingDays: totalDays,
			daysAbsent: absent,
			perDaySalary: Number(perDay.toFixed(2)),
			otPay: Number(otPay.toFixed(2)),
			epfAmount: Number(epfAmount.toFixed(2)),
			finalSalary: Number(finalSal.toFixed(2)),
		}));
	}, [
		form.daysPresent,
		form.basicSalary,
		form.otHours,
		form.mealAllowance,
		form.transportAllowance,
		form.medicalAllowance,
		form.noPayLeaves,
		form.taxRate,
		form.epfRate,
	]);

	// Fetch users
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setError("");
				const token = localStorage.getItem("token");
				const res = await axios.get(`${API_BASE_URL}/users`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
					withCredentials: true,
				});
				const data = res.data?.users || res.data?.data || [];
				setUsers(Array.isArray(data) ? data : []);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to load users");
			}
		};
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (
			[
				"totalWorkingDays",
				"daysPresent",
				"basicSalary",
				"otHours",
				"mealAllowance",
				"transportAllowance",
				"medicalAllowance",
				"noPayLeaves",
				"taxRate",
				"epfRate",
			].includes(name)
		) {
			const num = Number(value);
			if (num < 0) return;
		}

		if (name === "daysPresent" && Number(value) > 30) {
			alert("Days Present cannot exceed 30");
			return;
		}

		setForm((prev) => ({
			...prev,
			[name]: ["employeeName", "email", "role"].includes(name)
				? value
				: value === ""
				? ""
				: Number(value),
		}));
	};

	const onSelectUser = (e) => {
		const id = e.target.value;
		setUserId(id);
		const user = users.find((u) => (u._id || u.id) === id) || null;
		setSelectedUser(user);
		setForm((prev) => ({
			...prev,
			employeeName: user?.name || "",
			email: user?.gmail || user?.email || "",
			role: user?.role || "",
		}));
	};

	const resetForm = () => {
		setError("");
		setForm(initialForm);
		setSelectedUser(null);
		setUserId("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			setError("");

			if (!form.employeeName.trim()) throw new Error("Employee name is required");
			if (!form.email.trim()) throw new Error("Email is required");
			if (!form.role.trim()) throw new Error("Role is required");

			const payload = { ...form, title: "salary" };
			await salaryService.create(payload);
			alert("Salary saved successfully!");
			resetForm();
		} catch (err) {
			setError(err.message || "Failed to save salary");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="salary-container">
			<div className="salary-header">
				<h1 className="title">Salary Management</h1>
				<p className="subtitle">
					Calculate and manage monthly salaries with allowances & deductions.
				</p>
			</div>

			<div className="actions">
				<button className="btn btn-secondary" onClick={() => navigate("/mission-records")}>
					Go to Mission Records
				</button>
			</div>

			<div className="card">
				<div className="card-header">Salary Details</div>
				<div className="card-body">
					{error && <div className="alert alert-error">{error}</div>}

					<form onSubmit={handleSubmit} className="form-grid">
						{/* User Selection */}
						<div className="form-group" style={{ gridColumn: "span 2 / span 2" }}>
							<label>Select User</label>
							<select value={userId} onChange={onSelectUser}>
								<option value="">-- Select User --</option>
								{users.map((u) => (
									<option key={u._id || u.id} value={u._id || u.id}>
										{u.name || u.gmail || (u.staffId ? `Staff ${u.staffId}` : "Unnamed")}
									</option>
								))}
							</select>
						</div>

						{/* Employee Info */}
						<div className="form-group">
							<label>Employee Name</label>
							<input
								name="employeeName"
								value={form.employeeName}
								onChange={handleChange}
								placeholder="Enter name"
							/>
						</div>

						<div className="form-group">
							<label>Email</label>
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="Enter email"
							/>
						</div>

						<div className="form-group">
							<label>Role</label>
							<input
								name="role"
								value={form.role}
								onChange={handleChange}
								placeholder="Enter role"
							/>
						</div>

						<div className="form-group">
							<label>Total Working Days</label>
							<input type="number" name="totalWorkingDays" value={30} readOnly />
						</div>

						<div className="form-group">
							<label>Days Present</label>
							<input
								type="number"
								name="daysPresent"
								value={form.daysPresent}
								onChange={handleChange}
								min="0"
								max="30"
							/>
						</div>

						<div className="form-group">
							<label>Days Absent (Auto)</label>
							<input type="number" name="daysAbsent" value={form.daysAbsent} readOnly />
						</div>

						{/* Salary Section */}
						<div className="section-title">Salary Calculation</div>
						<div className="form-group">
							<label>Basic Salary</label>
							<input
								type="number"
								name="basicSalary"
								value={form.basicSalary}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>Per Day Salary (Auto)</label>
							<input type="number" name="perDaySalary" value={form.perDaySalary} readOnly />
						</div>

						<div className="form-group">
							<label>OT Hours</label>
							<input
								type="number"
								name="otHours"
								value={form.otHours}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>OT Pay (Auto)</label>
							<input type="number" name="otPay" value={form.otPay} readOnly />
						</div>

						{/* Allowances */}
						<div className="section-title">Allowances</div>
						<div className="form-group">
							<label>Meal Allowance</label>
							<input
								type="number"
								name="mealAllowance"
								value={form.mealAllowance}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>Transport Allowance</label>
							<input
								type="number"
								name="transportAllowance"
								value={form.transportAllowance}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>Medical Allowance</label>
							<input
								type="number"
								name="medicalAllowance"
								value={form.medicalAllowance}
								onChange={handleChange}
								min="0"
							/>
						</div>

						{/* Deductions */}
						<div className="section-title">Deductions</div>
						<div className="form-group">
							<label>No Pay Leaves</label>
							<input
								type="number"
								name="noPayLeaves"
								value={form.noPayLeaves}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>Tax Rate (%)</label>
							<input
								type="number"
								name="taxRate"
								value={form.taxRate}
								onChange={handleChange}
								min="0"
							/>
						</div>

						<div className="form-group">
							<label>EPF (Auto)</label>
							<input type="number" name="epfAmount" value={form.epfAmount} readOnly />
						</div>

						{/* Final Salary */}
						<div className="section-title">Final Salary</div>
						<div className="form-group">
							<label>Final Salary (Auto)</label>
							<input type="number" name="finalSalary" value={form.finalSalary} readOnly />
						</div>

						<div className="form-actions">
							<button type="button" className="btn btn-outline" onClick={resetForm}>
								Cancel
							</button>
							<button type="submit" className="btn btn-primary" disabled={submitting}>
								{submitting ? "Submitting..." : "Submit"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default SalaryManagement;
