import React, { useState, Fragment, useEffect } from "react";
import {
	UserIcon,
	CheckIcon,
	XIcon,
	SearchIcon,
	FilterIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	CalendarIcon,
	DollarSignIcon,
	UsersIcon,
	ClockIcon,
	ChevronRightIcon,
	ChevronLeftIcon,
	DownloadIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
import extractErrorMessage from "../../utils/errorMessageParser";
import {
	acceptSalary,
	getSalaries,
	rejectSalary,
} from "../../services/finance/financeService";
import Loader from "../../components/Loader";
import formatDate from "../../utils/convertDate";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SalarySlipPdfDocument from "./SalarySlipPdfDocument";

const EmployeePayments = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("");
	const [sortField, setSortField] = useState("createdAt");
	const [sortDirection, setSortDirection] = useState("desc");
	const [showDetails, setShowDetails] = useState(null);
	const [employeePayments, setEmployeePayments] = useState([]);
	const itemsPerPage = 10;

	const fetchSalaryData = async () => {
		setLoading(true);
		try {
			const res = await getSalaries();
			setEmployeePayments(res.data);
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSalaryData();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredPayments = employeePayments.filter((p) => {
		const matchesStatus = filter === "" || p.status === filter;

		const matchesSearch =
			searchQuery === "" ||
			p.employeeName.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesStatus && matchesSearch;
	});

	const sortedPayments = [...filteredPayments].sort((a, b) => {
		if (sortField === "createdAt") {
			return sortDirection === "asc"
				? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
				: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		} else if (sortField === "finalSalary") {
			return sortDirection === "asc"
				? a.finalSalary - b.finalSalary
				: b.finalSalary - a.finalSalary;
		}
		return 0;
	});

	const toggleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const handleRejection = async (salaryId) => {
		try {
			await rejectSalary(salaryId);
			toast.success("Salary Rejected");
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			fetchSalaryData();
		}
	};
	const handleAccept = async (salaryId) => {
		try {
			await acceptSalary(salaryId);
			toast.success("Salary Rejected");
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			fetchSalaryData();
		}
	};

	// Get status badge color
	const getStatusBadge = (status) => {
		switch (status) {
			case "paid":
				return "bg-success-100 text-success-dark";
			case "rejected":
				return "bg-fire-100 text-fire-dark";
			case "pending":
			default:
				return "bg-amber-100 text-amber-dark";
		}
	};

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPayments = sortedPayments.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const handleNextPage = () => {
		if (indexOfLastItem < filteredTransactions.length) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<h1 className="text-2xl font-bold text-gray-800">
							Employee Payments
						</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-gradient-to-br from-info to-info rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Pending Approvals
										</h3>
										<p className="text-3xl font-bold">
											{
												employeePayments.filter((p) => p.status === "pending")
													.length
											}
										</p>
										<p className="text-info-100 mt-1">payments need review</p>
									</div>
									<div className="bg-info-300/30 p-4 rounded-full">
										<UserIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-success to-success rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Approved Payments
										</h3>
										<p className="text-3xl font-bold">
											Rs.
											{employeePayments
												.filter((p) => p.status === "paid")
												.reduce((sum, p) => sum + p.finalSalary, 0)
												.toLocaleString()}
										</p>
										<p className="text-success-100 mt-1">total approved</p>
									</div>
									<div className="bg-success-300/30 p-4 rounded-full">
										<CheckIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-info to-info rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Payment Schedule
										</h3>
										<p className="text-3xl font-bold">Oct 30</p>
										<p className="text-info-100 mt-1">next payroll date</p>
									</div>
									<div className="bg-info-300/30 p-4 rounded-full">
										<CalendarIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-5">
							<div className="flex items-center justify-between mb-6 border-b border-b-gray-200 pb-4">
								<div className="flex items-center">
									<div className="bg-info-100 p-2 rounded-full mr-3">
										<UsersIcon size={20} className="text-info" />
									</div>
									<h2 className="text-xl font-semibold">Employee Payments</h2>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-500">
										<CalendarIcon size={16} className="inline mr-1" />
										October 2023
									</span>
								</div>
							</div>
							<div className="flex flex-wrap justify-between items-center mb-6">
								<div className="flex items-center space-x-4 mb-4 sm:mb-0">
									<div className="relative">
										<SearchIcon
											size={16}
											className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
										/>
										<input
											type="text"
											placeholder="Search employee..."
											className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<div className="flex items-center space-x-2 ml-4">
										<FilterIcon size={16} className="text-gray-500" />
										<span className="text-sm font-medium">Status:</span>
										<select
											className="border border-gray-200 rounded-md px-3 py-1 text-sm"
											value={filter}
											onChange={(e) => setFilter(e.target.value)}
										>
											<option value="">All Payments</option>
											<option value="pending">Pending</option>
											<option value="paid">Paid</option>
											<option value="rejected">Rejected</option>
										</select>
									</div>
								</div>
							</div>
							<div className="overflow-x-auto rounded-lg border border-gray-200">
								<table className="min-w-full bg-white">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-semibold">
												Employee
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Working Days
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												No-Pay Leaves
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("finalSalary")}
											>
												<div className="flex items-center">
													Final Salary
													{sortField === "finalSalary" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("createdAt")}
											>
												<div className="flex items-center">
													Date
													{sortField === "createdAt" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Status
											</th>
											<th className="py-3 px-4 text-center font-semibold">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentPayments.map((payment) => (
											<Fragment key={payment._id}>
												<tr
													className={`hover:bg-gray-50 ${
														showDetails === payment._id ? "bg-info-50" : ""
													}`}
												>
													<td className="py-3 px-4">
														<div className="flex items-center">
															<div className="bg-gray-200 rounded-full p-2 mr-3">
																<UserIcon size={16} className="text-gray-600" />
															</div>
															<div>
																<p className="font-medium">
																	{payment.employeeName}
																</p>
																<p className="text-xs text-gray-500">
																	{payment.title}
																</p>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 text-sm">
														<div>
															<p>
																{payment.daysPresent} /{" "}
																{payment.totalWorkingDays} days
															</p>
															<p className="text-xs text-gray-500">
																{payment.daysAbsent} absent
															</p>
														</div>
													</td>
													<td className="py-3 px-4 text-sm">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																payment.noPayLeaves > 0
																	? "bg-amber-100 text-amber-dark"
																	: "bg-success-100 text-success-dark"
															}`}
														>
															{payment.noPayLeaves} days
														</span>
													</td>
													<td className="py-3 px-4 text-sm font-medium">
														Rs.{payment.finalSalary.toLocaleString()}
													</td>
													<td className="py-3 px-4 text-sm">
														{formatDate(payment.createdAt)}
													</td>
													<td className="py-3 px-4">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
																payment.status
															)}`}
														>
															{payment.status?.charAt(0).toUpperCase() +
																payment.status?.slice(1) || "Pending"}
														</span>
													</td>
													<td className="py-3 px-4 text-center">
														<div className="flex justify-center space-x-2">
															{payment.status === "pending" && (
																<>
																	<button
																		onClick={() => {
																			handleAccept(payment._id);
																		}}
																		className="p-1.5 bg-success-100 text-success rounded-lg hover:bg-success-200 transition-colors"
																		title="Approve"
																	>
																		<CheckIcon size={16} />
																	</button>
																	<button
																		onClick={() => {
																			handleRejection(payment._id);
																		}}
																		className="p-1.5 bg-fire-100 text-fire rounded-lg hover:bg-fire-200 transition-colors"
																		title="Reject"
																	>
																		<XIcon size={16} />
																	</button>
																</>
															)}
															{payment.status === "paid" && (
																<PDFDownloadLink
																	document={
																		<SalarySlipPdfDocument slipData={payment} />
																	}
																	fileName={`salary_slip_${payment.employeeName.replace(
																		/\s/g,
																		"_"
																	)}_${payment._id}.pdf`}
																>
																	{({ loading }) => (
																		<button
																			className="p-1.5 bg-success-100 text-success rounded-lg hover:bg-success-200 transition-colors"
																			title={
																				loading
																					? "Generating PDF..."
																					: "Download Salary Slip"
																			}
																			disabled={loading}
																		>
																			{loading ? (
																				"..."
																			) : (
																				<DownloadIcon size={16} />
																			)}
																		</button>
																	)}
																</PDFDownloadLink>
															)}
															<button
																onClick={() =>
																	setShowDetails(
																		showDetails === payment._id
																			? null
																			: payment._id
																	)
																}
																className="p-1.5 bg-info-100 text-info rounded-lg hover:bg-info-200 transition-colors"
																title="View Details"
															>
																{showDetails === payment._id ? (
																	<ChevronUpIcon size={16} />
																) : (
																	<ChevronDownIcon size={16} />
																)}
															</button>
														</div>
													</td>
												</tr>
												{showDetails === payment._id && (
													<tr className="bg-info-50">
														<td colSpan={7} className="py-4 px-6">
															<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<DollarSignIcon
																			size={16}
																			className="mr-1 text-info"
																		/>
																		Salary Details
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Basic Salary:
																			</span>
																			<span className="font-medium">
																				Rs.
																				{payment.basicSalary.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Per Day:
																			</span>
																			<span>
																				Rs.{payment.perDaySalary.toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				OT Hours:
																			</span>
																			<span>{payment.otHours} hrs</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				OT Pay:
																			</span>
																			<span>Rs.{payment.otPay.toFixed(2)}</span>
																		</div>
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<ClockIcon
																			size={16}
																			className="mr-1 text-success"
																		/>
																		Allowances
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Meal:
																			</span>
																			<span>
																				Rs.
																				{payment.mealAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Transport:
																			</span>
																			<span>
																				Rs.
																				{payment.transportAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Medical:
																			</span>
																			<span>
																				Rs.
																				{payment.medicalAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between pt-2 mt-1 border-t border-gray-100">
																			<span className="font-medium">
																				Total:
																			</span>
																			<span className="font-medium">
																				Rs.
																				{(
																					payment.mealAllowance +
																					payment.transportAllowance +
																					payment.medicalAllowance
																				).toLocaleString()}
																			</span>
																		</div>
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<UsersIcon
																			size={16}
																			className="mr-1 text-fire"
																		/>
																		Deductions
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				No-Pay Leaves:
																			</span>
																			<span
																				className={
																					payment.noPayLeaves > 0
																						? "text-fire"
																						: ""
																				}
																			>
																				{payment.noPayLeaves} days (Rs.
																				{(
																					payment.noPayLeaves *
																					payment.perDaySalary
																				).toFixed(2)}
																				)
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Tax ({payment.taxRate}%):
																			</span>
																			<span>
																				Rs.
																				{(
																					(payment.finalSalary *
																						payment.taxRate) /
																					100
																				).toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				EPF ({payment.epfRate}%):
																			</span>
																			<span>
																				Rs.
																				{(
																					(payment.finalSalary *
																						payment.epfRate) /
																					100
																				).toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between font-medium pt-2 mt-1 border-t border-gray-100">
																			<span>Final Salary:</span>
																			<span className="text-lg text-info">
																				Rs.
																				{payment.finalSalary.toLocaleString()}
																			</span>
																		</div>
																	</div>
																</div>
															</div>
															{payment.status === "pending" && (
																<div className="mt-4 pt-3 border-t border-t-gray-200 flex justify-end space-x-3">
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "rejected")
																		}
																		className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
																	>
																		Reject Payment
																	</button>
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "approved")
																		}
																		className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info-dark shadow-sm transition-colors"
																	>
																		Approve Payment
																	</button>
																</div>
															)}
														</td>
													</tr>
												)}
											</Fragment>
										))}
									</tbody>
								</table>
							</div>
							{sortedPayments.length === 0 && (
								<div className="text-center py-10">
									<UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
									<p className="text-gray-500">
										No employee payments found matching your criteria.
									</p>
								</div>
							)}
							{/* pagination */}
							<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
								<div>
									Showing {indexOfFirstItem + 1} to{" "}
									{Math.min(indexOfLastItem, filteredPayments.length)} of{" "}
									{filteredPayments.length} requests
								</div>

								<div>
									<nav
										className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
										aria-label="Pagination"
									>
										<button
											className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
											onClick={handlePrevPage}
											disabled={currentPage === 1}
										>
											<ChevronLeftIcon size={18} />
										</button>
										<button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
											{currentPage}
										</button>
										<button
											className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
											onClick={handleNextPage}
											disabled={indexOfLastItem >= filteredPayments.length}
										>
											<ChevronRightIcon size={18} />
										</button>
									</nav>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default EmployeePayments;
