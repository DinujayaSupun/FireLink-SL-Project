import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { missionService } from "../../services/missionService";
import { inventoryService } from "../../services/inventoryService";
import firelinkLogo from "../../assets/images/firelink-logo.png";

const MissionRecords = () => {
	const navigate = useNavigate();
	const [missions, setMissions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [editingMissionId, setEditingMissionId] = useState(null);
	const [formData, setFormData] = useState({
		missionType: "",
		missionDate: "",
		missionTime: "",
		description: "",
		inventoryItems: [],
		status: "Active",
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filters, setFilters] = useState({
		missionType: "",
	});

	// Inventory autocomplete state
	const [inventoryItems, setInventoryItems] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState({});
	const [filteredSuggestions, setFilteredSuggestions] = useState({});
	const [selectedCategory, setSelectedCategory] = useState({});

	// Report generation state
	const [showReportModal, setShowReportModal] = useState(false);
	const [allMissionsData, setAllMissionsData] = useState([]);
	const [loadingReport, setLoadingReport] = useState(false);
	const [reportStats, setReportStats] = useState({});
	const [dateRange, setDateRange] = useState({
		startDate: "",
		endDate: ""
	});

	
	const missionTypes = [
		"Fire Emergency",
		"Rescue Operation",
		"Medical Emergency",
		"Training Exercise",
		"Maintenance",
		"Other",
	];

	useEffect(() => {
		loadMissions();
	}, [currentPage, filters]);

	// Load inventory items for autocomplete
	useEffect(() => {
		fetchInventoryItems();
	}, []);

	const fetchInventoryItems = async () => {
		try {
			const data = await inventoryService.getItemsForMissions();
			setInventoryItems(data.items || []);
		} catch (error) {
			// Silently fail to not disrupt existing functionality
			console.error("Error fetching inventory items:", error);
		}
	};

	const loadMissions = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				missionType: filters.missionType,
			};

			const response = await missionService.getMissions(params);
			setMissions(response.docs || []);
			setTotalPages(response.totalPages || 1);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load missions");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleInventoryItemChange = (index, field, value) => {
		const updatedItems = [...formData.inventoryItems];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};

		// If itemCode is being changed, show suggestions
		if (field === "itemCode") {
			const filtered = inventoryItems.filter((item) => {
				const itemId = String(item.item_ID).toLowerCase();
				const itemName = item.itemName.toLowerCase();
				const searchValue = value.toLowerCase().replace(/^id/, "");
				return itemId.includes(searchValue) || itemName.includes(searchValue);
			});
			setFilteredSuggestions((prev) => ({ ...prev, [index]: filtered }));
			setShowSuggestions((prev) => ({ ...prev, [index]: value.length > 0 && filtered.length > 0 }));
		}

		setFormData((prev) => ({
			...prev,
			inventoryItems: updatedItems,
		}));
	};

	const selectInventoryItem = (index, item) => {
		const updatedItems = [...formData.inventoryItems];
		updatedItems[index] = {
			...updatedItems[index],
			inventoryItemId: item._id,
			itemCode: `ID${String(item.item_ID).padStart(3, "0")}`,
			itemName: item.itemName,
			quantity: item.quantity,
			isDamaged: false,
			damagedQuantity: 0,
		};
		setFormData((prev) => ({
			...prev,
			inventoryItems: updatedItems,
		}));
		setShowSuggestions((prev) => ({ ...prev, [index]: false }));
	};

	const addInventoryItem = () => {
		setFormData((prev) => ({
			...prev,
			inventoryItems: [
				...prev.inventoryItems,
				{ itemCode: "", itemName: "", quantity: 0, usedQuantity: 0, isDamaged: false, damagedQuantity: 0 },
			],
		}));
	};

	const removeInventoryItem = (index) => {
		setFormData((prev) => ({
			...prev,
			inventoryItems: prev.inventoryItems.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError("");

			// Validate 
			const validItems = formData.inventoryItems.filter(
				(item) => item.itemCode && item.usedQuantity > 0
			);

			// Validate damaged quantities
			for (const item of validItems) {
				if (item.isDamaged && (!item.damagedQuantity || item.damagedQuantity <= 0)) {
					setError("Please enter damaged quantity for damaged items");
					setLoading(false);
					return;
				}
				if (item.damagedQuantity > item.usedQuantity) {
					setError("Damaged quantity cannot exceed used quantity");
					setLoading(false);
					return;
				}
			}

			const missionData = {
				...formData,
				inventoryItems: validItems,
			};

			if (editingMissionId) {
				await missionService.updateMission(editingMissionId, missionData);
			} else {
				await missionService.createMission(missionData);
			}

			
			setFormData({
				missionType: "",
				missionDate: "",
				missionTime: "",
				description: "",
				inventoryItems: [],
				status: "Active",
			});
			setShowForm(false);
			setEditingMissionId(null);
			loadMissions();

			alert(editingMissionId ? "Mission record updated successfully!" : "Mission record created successfully!");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to create mission");
		} finally {
			setLoading(false);
		}
	};

	const startEditMission = (mission) => {
		setEditingMissionId(mission._id);
		setFormData({
			missionType: mission.missionType || "",
			missionDate: mission.missionDate ? new Date(mission.missionDate).toISOString().slice(0, 10) : "",
			missionTime: mission.missionTime || "",
			description: mission.description || "",
			inventoryItems: (mission.inventoryItems || []).map((it) => ({
				inventoryItemId: it.inventoryItemId || null,
				itemCode: it.itemCode || "",
				itemName: it.itemName || "",
				quantity: Number(it.quantity) || Number(it.availableQuantity) || 0,
				usedQuantity: Number(it.usedQuantity) || 0,
				isDamaged: Boolean(it.isDamaged) || false,
				damagedQuantity: Number(it.damagedQuantity) || 0,
			})),
			status: mission.status || "Active",
		});
		setShowForm(true);
	};

	const deleteMission = async (id) => {
		if (!window.confirm("Are you sure you want to delete this mission?")) return;
		try {
			setLoading(true);
			setError("");
			await missionService.deleteMission(id);
			await loadMissions();
			alert("Mission deleted successfully");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete mission");
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
		setCurrentPage(1); 
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatTime = (timeString) => {
		return timeString;
	};

	
	const loadAllMissionsForReport = async () => {
		try {
			setLoadingReport(true);
			setError("");
			
			
			const params = {
				page: 1,
				limit: 10000, 
				missionType: filters.missionType, 
			};

			
			if (dateRange.startDate) {
				params.startDate = dateRange.startDate;
			}
			if (dateRange.endDate) {
				params.endDate = dateRange.endDate;
			}

			const response = await missionService.getMissions(params);
			const allMissions = response.docs || [];
			
			setAllMissionsData(allMissions);
			
			// Calculate 
			const stats = calculateStatistics(allMissions);
			setReportStats(stats);
			
			setShowReportModal(true);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load report data");
			console.error("Report loading error:", err);
		} finally {
			setLoadingReport(false);
		}
	};

	
	const calculateStatistics = (missionsData) => {
		const stats = {
			totalMissions: missionsData.length,
			byStatus: {
				Active: 0,
				Completed: 0,
				Cancelled: 0
			},
			byType: {
				"Fire Emergency": 0,
				"Rescue Operation": 0,
				"Medical Emergency": 0,
				"Training Exercise": 0,
				"Maintenance": 0,
				"Other": 0
			},
			totalItemsUsed: 0,
			uniqueItemCodes: new Set()
		};

		missionsData.forEach(mission => {
			// Count 
			if (stats.byStatus[mission.status] !== undefined) {
				stats.byStatus[mission.status]++;
			}

			
			if (stats.byType[mission.missionType] !== undefined) {
				stats.byType[mission.missionType]++;
			}

			if (mission.inventoryItems && mission.inventoryItems.length > 0) {
				mission.inventoryItems.forEach(item => {
					stats.totalItemsUsed += item.usedQuantity || 0;
					stats.uniqueItemCodes.add(item.itemCode);
				});
			}
		});

		stats.uniqueItemCodesCount = stats.uniqueItemCodes.size;
		delete stats.uniqueItemCodes; 

		return stats;
	};

	// Generate and print report
	const handlePrintReport = () => {
		try {
			console.log('Generating Mission Records Report...');
			
			const user = JSON.parse(localStorage.getItem("user"));
			const userName = user?.name || "System User";
			
			// Create a new window for printing
			const printWindow = window.open('', '', 'width=800,height=600');
			
			
			const reportHTML = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Mission Records Report - FireLink-SL</title>
					<style>
						@media print {
							@page {
								size: A4;
								margin: 15mm;
							}
							body {
								print-color-adjust: exact;
								-webkit-print-color-adjust: exact;
							}
						}
						
					body {
						font-family: Arial, sans-serif;
						margin: 20px;
						color: #000;
						background: white;
					}
					
					.header {
						margin-bottom: 30px;
						border-bottom: 2px solid #000;
						padding-bottom: 20px;
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
					}
					
					.header-left {
						display: flex;
						align-items: flex-start;
						gap: 15px;
					}
					
					.logo {
						width: 80px;
						height: auto;
						flex-shrink: 0;
					}
					
					.company-info {
						text-align: left;
					}
					
					.company-name {
						font-size: 22px;
						font-weight: bold;
						color: #000;
						margin: 0 0 8px 0;
					}
					
					.company-address {
						font-size: 11px;
						color: #000;
						line-height: 1.5;
						margin: 0;
					}
					
					.header-right {
						text-align: right;
					}
					
					.report-title {
						font-size: 20px;
						font-weight: bold;
						margin: 0 0 8px 0;
						color: #000;
					}
					
					.report-meta {
						font-size: 11px;
						color: #000;
						margin-top: 5px;
					}						.statistics {
							background: #F5F5F5;
							border: 1px solid #000;
							border-radius: 4px;
							padding: 15px;
							margin: 20px 0;
							page-break-inside: avoid;
						}
						
						.stat-row {
							display: flex;
							justify-content: space-between;
							margin: 8px 0;
							padding: 5px 0;
						}
						
						.stat-label {
							font-weight: 600;
							color: #000;
						}
						
						.stat-value {
							color: #000;
							font-weight: bold;
						}
						
						.section-title {
							font-size: 18px;
							font-weight: bold;
							margin: 25px 0 15px 0;
							color: #000;
							border-bottom: 2px solid #000;
							padding-bottom: 5px;
						}
						
						table {
							width: 100%;
							border-collapse: collapse;
							margin: 15px 0;
							page-break-inside: auto;
						}
						
						th, td {
							border: 1px solid #000;
							padding: 8px;
							text-align: left;
							font-size: 11px;
						}
						
						th {
							background: #E5E5E5;
							font-weight: bold;
							color: #000;
						}
						
						tr {
							page-break-inside: avoid;
							page-break-after: auto;
						}
						
						tbody tr:nth-child(even) {
							background: #F5F5F5;
						}
						
						tbody tr:hover {
							background: #E5E5E5;
						}
						
						.status-badge {
							font-size: 11px;
							font-weight: 600;
							color: #000;
						}
						
						.status-active {
							color: #000;
						}
						
						.status-completed {
							color: #000;
						}
						
						.status-cancelled {
							color: #000;
						}
						
						.type-badge {
							color: #000;
							font-size: 11px;
							font-weight: 600;
						}
						
						.items-list {
							margin: 0;
							padding: 0;
							list-style: none;
						}
						
						.items-list li {
							font-size: 10px;
							margin: 2px 0;
						}
						
						.signature-section {
							display: grid;
							grid-template-columns: 1fr 1fr;
							gap: 60px;
							margin-top: 50px;
							page-break-inside: avoid;
						}
						
						.signature-box {
							text-align: center;
						}
						
						.signature-line {
							border-top: 1px solid #000;
							padding-top: 8px;
							margin-top: 60px;
						}
						
						.signature-title {
							font-weight: bold;
							font-size: 12px;
							color: #000;
							margin-bottom: 3px;
						}
						
						.signature-subtitle {
							font-size: 11px;
							color: #000;
						}
						
						.footer {
							margin-top: 30px;
							padding-top: 15px;
							border-top: 1px solid #000;
							text-align: center;
							font-size: 11px;
							color: #000;
						}
						
						.no-print {
							display: none;
						}
					</style>
				</head>
				<body>
					<!-- Header -->
					<div class="header">
						<div class="header-left">
							<img src="${firelinkLogo}" alt="FireLink-SL Logo" class="logo" />
							<div class="company-info">
								<div class="company-name">FireLink-SL Fire Department</div>
								<div class="company-address">
									Main Fire Station (Head Quarters)<br/>
									T.B. Jaya Mawatha<br/>
									Colombo 10<br/>
									Sri Lanka<br/>
									Contact: (+94) 11-123456
								</div>
							</div>
						</div>
						<div class="header-right">
							<div class="report-title">Mission Records Report</div>
							<div class="report-meta">
								Generated: ${new Date().toLocaleString()}<br/>
								By: ${userName}
								${dateRange.startDate || dateRange.endDate ? `<br/>Date Range: ${dateRange.startDate || 'Start'} to ${dateRange.endDate || 'End'}` : '<br/>Period: All Time'}
							</div>
						</div>
					</div>

					<!-- Statistics Summary -->
					<div class="statistics">
						<h3 style="margin-top: 0;">Summary Statistics</h3>
						<div class="stat-row">
							<span class="stat-label">Total Missions:</span>
							<span class="stat-value">${reportStats.totalMissions || 0}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">Active Missions:</span>
							<span class="stat-value">${reportStats.byStatus?.Active || 0}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">Completed Missions:</span>
							<span class="stat-value">${reportStats.byStatus?.Completed || 0}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">Cancelled Missions:</span>
							<span class="stat-value">${reportStats.byStatus?.Cancelled || 0}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">Total Items Used:</span>
							<span class="stat-value">${reportStats.totalItemsUsed || 0}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">Unique Items:</span>
							<span class="stat-value">${reportStats.uniqueItemCodesCount || 0}</span>
						</div>
					</div>

					<!-- Mission Types Breakdown -->
					<div class="section-title">Missions by Type</div>
					<table>
						<thead>
							<tr>
								<th>Mission Type</th>
								<th style="text-align: right;">Count</th>
								<th style="text-align: right;">Percentage</th>
							</tr>
						</thead>
						<tbody>
							${Object.entries(reportStats.byType || {}).map(([type, count]) => `
								<tr>
									<td>${type}</td>
									<td style="text-align: right;">${count}</td>
									<td style="text-align: right;">${reportStats.totalMissions > 0 ? ((count / reportStats.totalMissions) * 100).toFixed(1) : 0}%</td>
								</tr>
							`).join('')}
						</tbody>
					</table>

					<!-- Detailed Mission Records -->
					<div class="section-title">Detailed Mission Records</div>
					<table>
						<thead>
							<tr>
								<th>Type</th>
								<th>Date</th>
								<th>Time</th>
								<th>Description</th>
								<th>Items Used</th>
								<th>Status</th>
								<th>Created By</th>
							</tr>
						</thead>
						<tbody>
							${allMissionsData.map(mission => `
								<tr>
									<td><span class="type-badge">${mission.missionType}</span></td>
									<td>${formatDate(mission.missionDate)}</td>
									<td>${formatTime(mission.missionTime)}</td>
									<td>${mission.description || 'N/A'}</td>
									<td>
										${mission.inventoryItems && mission.inventoryItems.length > 0 ? `
											<ul class="items-list">
												${mission.inventoryItems.map(item => `
													<li><strong>${item.itemCode}</strong> (Avail: ${item.quantity}, Used: ${item.usedQuantity})</li>
												`).join('')}
											</ul>
										` : '<span style="color: var(--color-gray-400);">No items</span>'}
									</td>
									<td>
										<span class="status-badge status-${mission.status.toLowerCase()}">
											${mission.status}
										</span>
									</td>
									<td>${mission.createdBy?.name || 'Unknown'}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>

					<!-- Signature Section -->
					<div class="signature-section">
						<div class="signature-box">
							<div class="signature-line">
								<p class="signature-title">Record Manager</p>
								<p class="signature-subtitle">Mission Records Department</p>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="footer">
						<p><strong>CONFIDENTIAL DOCUMENT</strong> - This mission records report contains sensitive operational data of the Fire and Rescue Service of Sri Lanka.</p>
						<p>Distribution is restricted to authorized personnel only. Any unauthorized disclosure, copying, or distribution is strictly prohibited.</p>
						<p>For questions regarding this report, contact the Mission Records Department at records@firelink.lk</p>
					</div>
				</body>
				</html>
			`;
			
			printWindow.document.write(reportHTML);
			printWindow.document.close();
			
			
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
			}, 500);
			
		} catch (error) {
			console.error('Print report error:', error);
			alert('Error generating report. Please try again.');
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Mission Records Management
				</h1>
				<p className="text-gray-600">
					Manage and track all fire department missions and operations.
				</p>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Mission Type
						</label>
						<select
							name="missionType"
							value={filters.missionType}
							onChange={handleFilterChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
						>
							<option value="">All Types</option>
							{missionTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Add Mission Button */}
		<div className="mb-6 flex items-center gap-3">
			<button
				onClick={() => {
					if (showForm) {
						
						setShowForm(false);
						setEditingMissionId(null);
						setFormData({
							missionType: "",
							missionDate: "",
							missionTime: "",
							description: "",
							inventoryItems: [],
						});
					} else {
						
						setEditingMissionId(null);
						setFormData({
							missionType: "",
							missionDate: "",
							missionTime: "",
							description: "",
							inventoryItems: [],
						});
						setShowForm(true);
					}
				}}
				className="bg-info hover:bg-info-dark text-white font-medium py-2 px-4 rounded-md transition duration-200"
			>
				{showForm ? "Cancel" : "Add New Mission"}
			</button>
			<button
				onClick={() => loadAllMissionsForReport()}
				disabled={loadingReport}
				className="bg-info hover:bg-info-dark disabled:bg-info-300 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center gap-2"
			>
				{loadingReport ? (
					<>
						Loading...
					</>
				) : (
					<>
						Generate Report
					</>
				)}
			</button>
			<button
				onClick={() => navigate("/salary-management")}
				className="bg-success hover:bg-success-dark text-white font-medium py-2 px-4 rounded-md transition duration-200"
			>
				Go to Salary Management
			</button>
		</div>

			{/* Mission Form */}
			{showForm && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">
						{editingMissionId ? "Edit Mission Record" : "Add New Mission Record"}
					</h2>
					{error && (
						<div className="bg-fire-100 border border-fire-300 text-fire-dark px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Type *
								</label>
								<select
									name="missionType"
									value={formData.missionType}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
								>
									<option value="">Select Mission Type</option>
									{missionTypes.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Date *
								</label>
								<input
									type="date"
									name="missionDate"
									value={formData.missionDate}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Time *
								</label>
								<input
									type="time"
									name="missionTime"
									value={formData.missionTime}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
								/>
							</div>
						</div>
						<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Status *
	</label>
	<select
		name="status"
		value={formData.status}
		onChange={handleInputChange}
		required
		className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
	>
		<option value="Active">Active</option>
		<option value="Completed">Completed</option>
		<option value="Cancelled">Cancelled</option>
	</select>
</div>


						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Description *
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								required
								rows="4"
								maxLength={25}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
								placeholder="Provide a detailed description of the mission..."
							/>
						</div>

						{/* Inventory Items */}
						<div>
							<div className="flex justify-between items-center mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Inventory Items Used
								</label>
								<button
									type="button"
									onClick={addInventoryItem}
									className="bg-success hover:bg-success-dark text-white text-sm px-3 py-1 rounded"
								>
									Add Item
								</button>
							</div>

							{formData.inventoryItems.map((item, index) => (
								<div
									key={index}
									className="mb-6 p-4 border border-gray-200 rounded bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
										{/* Item Code with Autocomplete + Dropdown */}
										<div className="relative">
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Item Code *
											</label>
											<div className="flex gap-2">
												<input
													type="text"
													value={item.itemCode}
													onChange={(e) => {
														let value = e.target.value.toUpperCase();
														if (!value.startsWith("ID") && value.length > 0) {
															value = "ID" + value.replace(/^ID/, "");
														}
														if (value.length > 5) {
															value = value.slice(0, 5);
														}
														handleInventoryItemChange(index, "itemCode", value);
													}}
													onFocus={() => {
														if (item.itemCode && filteredSuggestions[index]) {
															setShowSuggestions((prev) => ({ ...prev, [index]: true }));
														}
													}}
													onBlur={() => {
														// Delay to allow click on suggestion
														setTimeout(() => {
															setShowSuggestions((prev) => ({ ...prev, [index]: false }));
														}, 200);
													}}
													className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
													placeholder="Type ID or name..."
													required
												/>
												{/* Dropdown Button */}
												<button
													type="button"
													onClick={() => {
														// Show all items when clicking dropdown button
														setFilteredSuggestions((prev) => ({ ...prev, [index]: inventoryItems }));
														setShowSuggestions((prev) => ({ ...prev, [index]: !showSuggestions[index] }));
													}}
													className="px-3 py-2 bg-info hover:bg-info-dark text-white rounded-md"
													title="Browse all items"
												>
													▼
												</button>
											</div>
											{/* Autocomplete/Dropdown Suggestions */}
											{showSuggestions[index] && filteredSuggestions[index] && filteredSuggestions[index].length > 0 && (
												<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
													{/* Category Filter */}
													<div className="sticky top-0 bg-gray-100 p-2 border-b border-gray-300">
														<select
															value={selectedCategory[index] || ""}
															onChange={(e) => {
																const category = e.target.value;
																setSelectedCategory((prev) => ({ ...prev, [index]: category }));
																const filtered = category
																	? inventoryItems.filter((item) => item.category === category)
																	: inventoryItems;
																setFilteredSuggestions((prev) => ({ ...prev, [index]: filtered }));
															}}
															className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
															onClick={(e) => e.stopPropagation()}
														>
															<option value="">All Categories</option>
															{[...new Set(inventoryItems.map((item) => item.category))].sort().map((cat) => (
																<option key={cat} value={cat}>
																	{cat}
																</option>
															))}
														</select>
													</div>
													{/* Items List */}
													<div className="overflow-y-auto max-h-60">
														{filteredSuggestions[index].length === 0 ? (
															<div className="px-3 py-4 text-center text-gray-500 text-sm">
																No items found
															</div>
														) : (
															filteredSuggestions[index].slice(0, 20).map((suggestion) => (
																<div
																	key={suggestion._id}
																	onClick={() => {
																		selectInventoryItem(index, suggestion);
																		setSelectedCategory((prev) => ({ ...prev, [index]: "" }));
																	}}
																	className="px-3 py-2 hover:bg-info-50 cursor-pointer border-b border-gray-100"
																>
																	<div className="font-medium text-sm text-gray-900">
																		ID{String(suggestion.item_ID).padStart(3, "0")} - {suggestion.itemName}
																	</div>
																	<div className="text-xs text-gray-500">
																		Available: {suggestion.quantity} | Category: {suggestion.category}
																	</div>
																</div>
															))
														)}
													</div>
												</div>
											)}
										</div>

										{/* Item Name (Read-only, auto-filled) */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Item Name
											</label>
											<input
												type="text"
												value={item.itemName || ""}
												readOnly
												className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
												placeholder="Auto-filled"
											/>
										</div>

										{/* Available Quantity (Read-only, auto-filled) */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Available Quantity
											</label>
											<input
												type="number"
												value={item.quantity || 0}
												readOnly
												className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{/* Used Quantity */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Used Quantity *
											</label>
											<input
												type="number"
												value={item.usedQuantity}
												onChange={(e) =>
													handleInventoryItemChange(
														index,
														"usedQuantity",
														parseInt(e.target.value) || 0
													)
												}
												min="0"
												max={item.quantity}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
												required
											/>
										</div>

										{/* Is Damaged */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Item Damaged?
											</label>
											<div className="flex items-center space-x-4 pt-2">
												<label className="flex items-center">
													<input
														type="radio"
														name={`isDamaged-${index}`}
														checked={item.isDamaged === false}
														onChange={() =>
															handleInventoryItemChange(index, "isDamaged", false)
														}
														className="mr-2"
													/>
													No
												</label>
												<label className="flex items-center">
													<input
														type="radio"
														name={`isDamaged-${index}`}
														checked={item.isDamaged === true}
														onChange={() =>
															handleInventoryItemChange(index, "isDamaged", true)
														}
														className="mr-2"
													/>
													Yes
												</label>
											</div>
										</div>

										{/* Damaged Quantity (only if damaged) */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Damaged Quantity
											</label>
											<input
												type="number"
												value={item.damagedQuantity || 0}
												onChange={(e) =>
													handleInventoryItemChange(
														index,
														"damagedQuantity",
														parseInt(e.target.value) || 0
													)
												}
												min="0"
												max={item.usedQuantity}
												disabled={!item.isDamaged}
												className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info ${
													!item.isDamaged ? "bg-gray-100 text-gray-400" : ""
												}`}
											/>
										</div>
									</div>

									{/* Remove Button */}
									<div className="mt-4 flex justify-end">
										<button
											type="button"
											onClick={() => removeInventoryItem(index)}
											className="bg-fire hover:bg-fire-dark text-white px-4 py-2 rounded"
										>
											Remove Item
										</button>
									</div>
								</div>
							))}
						</div>

						<div className="flex justify-end space-x-4">
							<button
								type="button"
								onClick={() => {
									setShowForm(false);
									setEditingMissionId(null);
									setFormData({
										missionType: "",
										missionDate: "",
										missionTime: "",
										description: "",
										inventoryItems: [],
									});
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="px-4 py-2 bg-info text-white rounded-md hover:bg-info-dark disabled:opacity-50"
							>
								{loading 
									? (editingMissionId ? "Updating..." : "Creating...") 
									: (editingMissionId ? "Update Mission" : "Create Mission")
								}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Missions List */}
			<div className="bg-white rounded-lg shadow-md">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Mission Records</h2>
				</div>

				{loading ? (
					<div className="p-6 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info mx-auto"></div>
						<p className="mt-2 text-gray-600">Loading missions...</p>
					</div>
				) : missions.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						No missions found.{" "}
						{filters.missionType
							? "Try adjusting your filters."
							: "Create your first mission record."}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Type
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Time
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Description
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Items Used
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created By
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{missions.map((mission) => (
									<tr key={mission._id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-info-100 text-info-dark">
												{mission.missionType}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(mission.missionDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatTime(mission.missionTime)}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											<div
												className="max-w-xs truncate"
												title={mission.description}
											>
												{mission.description}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
											{mission.inventoryItems && mission.inventoryItems.length > 0 ? (
												<div className="space-y-1">
													{mission.inventoryItems.map((it, idx) => (
														<div key={idx} className="text-xs">
															<span className="font-medium">{it.itemCode}</span>
															{` (Available: ${it.quantity}, Used: ${it.usedQuantity})`}
														</div>
													))}
												</div>
											) : (
												<span className="text-gray-500">No items</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													mission.status === "Active"
														? "bg-amber-100 text-amber-dark"
														: mission.status === "Completed"
														? "bg-success-100 text-success-dark"
														: "bg-fire-100 text-fire-dark"
												}`}
											>
												{mission.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{mission.createdBy?.name || "Unknown"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												<button
													onClick={() => startEditMission(mission)}
													className="px-3 py-1 bg-info hover:bg-info-dark text-white rounded"
												>
													Edit
												</button>
												<button
													onClick={() => deleteMission(mission._id)}
													className="px-3 py-1 bg-fire hover:bg-fire-dark text-white rounded"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-200">
						<div className="flex justify-between items-center">
							<div className="text-sm text-gray-700">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
									disabled={currentPage === 1}
									className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
								>
									Previous
								</button>
								<button
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={currentPage === totalPages}
									className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Report Modal */}
			{showReportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-bold text-gray-800">Mission Records Report</h2>
								<p className="text-sm text-gray-600 mt-1">
									Preview and print comprehensive mission records
								</p>
							</div>
							<button
								onClick={() => setShowReportModal(false)}
								className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
							>
								×
							</button>
						</div>

						{/* Date Range Filter */}
						<div className="p-6 bg-gray-50 border-b">
							<h3 className="text-lg font-semibold mb-3">Date Range Filter (Optional)</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Start Date
									</label>
									<input
										type="date"
										value={dateRange.startDate}
										onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										End Date
									</label>
									<input
										type="date"
										value={dateRange.endDate}
										onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
									/>
								</div>
								<div className="flex items-end">
									<button
										onClick={() => {
											loadAllMissionsForReport();
										}}
										disabled={loadingReport}
										className="w-full bg-info hover:bg-info-dark disabled:bg-info-300 text-white px-4 py-2 rounded-md transition-colors"
									>
										{loadingReport ? 'Applying...' : 'Apply Filter'}
									</button>
								</div>
							</div>
							{(dateRange.startDate || dateRange.endDate) && (
								<button
									onClick={() => {
										setDateRange({ startDate: '', endDate: '' });
										loadAllMissionsForReport();
									}}
									className="mt-2 text-sm text-info hover:text-info-dark"
								>
									Clear Date Filter
								</button>
							)}
						</div>

						{/* Report Preview Content */}
						<div className="p-6">
							{/* Statistics Summary */}
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
								<h3 className="text-lg font-bold mb-4">Summary Statistics</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Total Missions</div>
										<div className="text-2xl font-bold text-fire">{reportStats.totalMissions || 0}</div>
									</div>
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Active</div>
										<div className="text-2xl font-bold text-amber">{reportStats.byStatus?.Active || 0}</div>
									</div>
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Completed</div>
										<div className="text-2xl font-bold text-success">{reportStats.byStatus?.Completed || 0}</div>
									</div>
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Cancelled</div>
										<div className="text-2xl font-bold text-fire">{reportStats.byStatus?.Cancelled || 0}</div>
									</div>
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Items Used</div>
										<div className="text-2xl font-bold text-info">{reportStats.totalItemsUsed || 0}</div>
									</div>
									<div className="bg-white p-3 rounded border">
										<div className="text-sm text-gray-600">Unique Items</div>
										<div className="text-2xl font-bold text-info">{reportStats.uniqueItemCodesCount || 0}</div>
									</div>
								</div>
							</div>

							{/* Mission Types Breakdown */}
							<div className="mb-6">
								<h3 className="text-lg font-bold mb-3">Missions by Type</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full border border-gray-300">
										<thead className="bg-gray-100">
											<tr>
												<th className="border border-gray-300 px-4 py-2 text-left">Mission Type</th>
												<th className="border border-gray-300 px-4 py-2 text-right">Count</th>
												<th className="border border-gray-300 px-4 py-2 text-right">Percentage</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(reportStats.byType || {}).map(([type, count]) => (
												<tr key={type} className="hover:bg-gray-50">
													<td className="border border-gray-300 px-4 py-2">{type}</td>
													<td className="border border-gray-300 px-4 py-2 text-right font-semibold">{count}</td>
													<td className="border border-gray-300 px-4 py-2 text-right">
														{reportStats.totalMissions > 0 ? ((count / reportStats.totalMissions) * 100).toFixed(1) : 0}%
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Mission Records Preview */}
							<div>
								<h3 className="text-lg font-bold mb-3">Mission Records ({allMissionsData.length} missions)</h3>
								<div className="text-sm text-gray-600 mb-2">
									Showing preview of first 10 missions. Full report will include all missions.
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full border border-gray-300 text-sm">
										<thead className="bg-gray-100">
											<tr>
												<th className="border border-gray-300 px-3 py-2 text-left">Type</th>
												<th className="border border-gray-300 px-3 py-2 text-left">Date</th>
												<th className="border border-gray-300 px-3 py-2 text-left">Time</th>
												<th className="border border-gray-300 px-3 py-2 text-left">Description</th>
												<th className="border border-gray-300 px-3 py-2 text-left">Items Used</th>
												<th className="border border-gray-300 px-3 py-2 text-left">Status</th>
											</tr>
										</thead>
										<tbody>
											{allMissionsData.slice(0, 10).map((mission, idx) => (
												<tr key={idx} className="hover:bg-gray-50">
													<td className="border border-gray-300 px-3 py-2">
														<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-info-100 text-info-dark">
															{mission.missionType}
														</span>
													</td>
													<td className="border border-gray-300 px-3 py-2">{formatDate(mission.missionDate)}</td>
													<td className="border border-gray-300 px-3 py-2">{formatTime(mission.missionTime)}</td>
													<td className="border border-gray-300 px-3 py-2">{mission.description}</td>
													<td className="border border-gray-300 px-3 py-2">
														{mission.inventoryItems && mission.inventoryItems.length > 0 ? (
															<div className="space-y-1">
																{mission.inventoryItems.map((item, i) => (
																	<div key={i} className="text-xs">
																		<strong>{item.itemCode}</strong> (Used: {item.usedQuantity})
																	</div>
																))}
															</div>
														) : (
															<span className="text-gray-400">No items</span>
														)}
													</td>
													<td className="border border-gray-300 px-3 py-2">
														<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															mission.status === 'Active' ? 'bg-amber-100 text-amber-dark' :
															mission.status === 'Completed' ? 'bg-success-100 text-success-dark' :
															'bg-fire-100 text-fire-dark'
														}`}>
															{mission.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{allMissionsData.length > 10 && (
									<div className="text-sm text-gray-500 mt-2 text-center">
										... and {allMissionsData.length - 10} more missions in full report
									</div>
								)}
							</div>
						</div>

						{/* Modal Footer */}
						<div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
							<button
								onClick={() => setShowReportModal(false)}
								className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
							>
								Close
							</button>
							<button
								onClick={handlePrintReport}
								className="px-6 py-2 bg-info hover:bg-info-dark text-white rounded-md transition-colors flex items-center gap-2"
							>
								Print Report
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MissionRecords;
