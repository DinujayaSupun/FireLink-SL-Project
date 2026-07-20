import React, { useState } from "react";
import {
	XIcon,
	FilterIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	PlusIcon,
	DollarSignIcon,
	EyeIcon,
	SearchIcon,
	ArrowRightIcon,
	CalendarIcon,
	ClipboardIcon,
	TagIcon,
	CreditCardIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
import {
	createExpense,
	getExpenses,
} from "../../services/finance/financeService";
import { toast } from "react-toastify";
import extractErrorMessage from "../../utils/errorMessageParser";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import formatDate from "../../utils/convertDate";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ExpensePdfDocument } from "./ExpensePdfDocument";

const Expenses = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [filterType, setFilterType] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState("date");
	const [sortDirection, setSortDirection] = useState("desc");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(null);
	const [newTransaction, setNewTransaction] = useState({
		type: "",
		amount: 0,
		description: "",
	});
	const [expenses, setExpenses] = useState([]);
	const currentDate = new Date();
	const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
	const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const itemsPerPage = 10;

	const fetchExpenses = async () => {
		setLoading(true);
		try {
			const transactionData = await getExpenses(
				selectedYear,
				selectedMonth + 1
			);
			setExpenses(transactionData.data);
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExpenses();
	}, [selectedMonth, selectedYear]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredTransactions = expenses.filter((t) => {
		const matchesType = filterType === "" || t.type === filterType;

		const matchesSearch =
			searchQuery === "" ||
			t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.description.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesType && matchesSearch;
	});

	const sortedTransactions = [...filteredTransactions].sort((a, b) => {
		if (sortField === "date") {
			return sortDirection === "asc"
				? new Date(a.date).getTime() - new Date(b.date).getTime()
				: new Date(b.date).getTime() - new Date(a.date).getTime();
		} else if (sortField === "amount") {
			return sortDirection === "asc"
				? a.amount - b.amount
				: b.amount - a.amount;
		}
		return 0;
	});

	const getMonthName = (month) => {
		return new Date(2000, month, 1).toLocaleString("default", {
			month: "long",
		});
	};

	const handlePrevMonth = () => {
		if (selectedMonth === 0) {
			setSelectedMonth(11);
			setSelectedYear(selectedYear - 1);
		} else {
			setSelectedMonth(selectedMonth - 1);
		}
		setShowDatePicker(false);
	};

	const handleNextMonth = () => {
		if (selectedMonth === 11) {
			setSelectedMonth(0);
			setSelectedYear(selectedYear + 1);
		} else {
			setSelectedMonth(selectedMonth + 1);
		}
		setShowDatePicker(false);
	};

	const toggleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Get type badge color
	const getTypeBadge = (type) => {
		switch (type) {
			case "emergency":
				return "bg-fire-100 text-fire-dark";
			case "other":
				return "bg-info-100 text-info-dark";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const submitHandler = (e) => {
		e.preventDefault();

		const submitTransaction = async () => {
			try {
				await createExpense(newTransaction);
				fetchExpenses();
				toast.success("Transaction created successfully!");
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setNewTransaction({ amount: 0, description: "", type: "" });
				setShowAddModal(false);
			}
		};

		submitTransaction();
	};

	const typeEnum = [
		"emergency",
		"maintenance",
		"transport",
		"utilities",
		"infrastructure",
		"training",
		"other",
	];

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentTransactions = sortedTransactions.slice(
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
						<h1 className="text-2xl font-bold text-gray-800">Expense</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
							<div className="bg-gradient-to-br from-info to-info rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Total Expenses
										</h3>
										<p className="text-3xl font-bold">{expenses.length}</p>
										<p className="text-info-100 mt-1">Last 30 days</p>
									</div>
									<div className="bg-info-300/30 p-4 rounded-full">
										<ClipboardIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-fire to-fire rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Emergency Expenses
										</h3>
										<p className="text-3xl font-bold">
											Rs.
											{expenses
												.filter((t) => t.type === "emergency")
												.reduce((sum, t) => sum + t.amount, 0)
												.toLocaleString()}
										</p>
										<p className="text-fire-100 mt-1">Critical Expenses</p>
									</div>
									<div className="bg-fire-300/30 p-4 rounded-full">
										<TagIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-success to-success rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Regular Expenses
										</h3>
										<p className="text-3xl font-bold">
											Rs.
											{expenses
												.filter((t) => t.type !== "emergency")
												.reduce((sum, t) => sum + t.amount, 0)
												.toLocaleString()}
										</p>
										<p className="text-success-100 mt-1">Operational Expenses</p>
									</div>
									<div className="bg-success-300/30 p-4 rounded-full">
										<DollarSignIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						<div className={"bg-white rounded-lg shadow-sm p-5 "}>
							<div className="flex items-center justify-between mb-6 border-b border-gray-200-b border-gray-200 pb-4">
								<div className="flex items-center">
									<div className="bg-info-100 p-2 rounded-full mr-3">
										<CreditCardIcon size={20} className="text-info" />
									</div>
									<h2 className="text-xl font-semibold">Expense Management</h2>
								</div>
								<div className="relative">
									<button
										onClick={() => setShowDatePicker(!showDatePicker)}
										className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
									>
										<CalendarIcon size={16} className="text-info" />
										<span>
											{getMonthName(selectedMonth)} {selectedYear}
										</span>
										<ChevronDownIcon size={16} className="text-gray-500" />
									</button>
									{showDatePicker && (
										<div className="absolute right-0 mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
											<div className="flex justify-between items-center mb-4">
												<button
													onClick={handlePrevMonth}
													className="p-1 hover:bg-gray-100 rounded"
												>
													<ChevronLeftIcon size={16} />
												</button>
												<div className="font-medium">
													{getMonthName(selectedMonth)} {selectedYear}
												</div>
												<button
													onClick={handleNextMonth}
													className="p-1 hover:bg-gray-100 rounded"
												>
													<ChevronRightIcon size={16} />
												</button>
											</div>
											<div className="grid grid-cols-3 gap-2">
												{Array.from({ length: 12 }, (_, i) => {
													const isFutureMonth =
														selectedYear === currentDate.getFullYear() &&
														i > currentDate.getMonth();

													return (
														<button
															key={i}
															onClick={() => {
																if (!isFutureMonth) {
																	setSelectedMonth(i);
																	setShowDatePicker(false);
																}
															}}
															disabled={isFutureMonth}
															className={`py-2 px-1 text-sm rounded-md ${
																selectedMonth === i
																	? "bg-info-100 text-info-dark font-medium"
																	: isFutureMonth
																	? "text-gray-300 cursor-not-allowed"
																	: "hover:bg-gray-100"
															}`}
														>
															{new Date(2000, i, 1).toLocaleString("default", {
																month: "short",
															})}
														</button>
													);
												})}
											</div>
											<div className="mt-4 grid grid-cols-2 gap-2">
												<select
													value={selectedYear}
													onChange={(e) =>
														setSelectedYear(parseInt(e.target.value))
													}
													className="p-2 border border-gray-200 rounded text-sm"
												>
													{Array.from(
														{
															length: 10,
														},
														(_, i) => (
															<option
																key={i}
																value={currentDate.getFullYear() - 5 + i}
															>
																{currentDate.getFullYear() - 5 + i}
															</option>
														)
													)}
												</select>
												<button
													onClick={() => {
														setSelectedMonth(currentDate.getMonth());
														setSelectedYear(currentDate.getFullYear());
														setShowDatePicker(false);
													}}
													className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
												>
													Current Month
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="flex flex-wrap justify-between items-center mb-6">
								<div className="flex items-center space-x-2 mb-4 sm:mb-0">
									<div className="relative">
										<SearchIcon
											size={16}
											className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
										/>
										<input
											type="text"
											placeholder="Search transactions..."
											className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-info focus:border-info"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<div className="flex items-center space-x-2 ml-4">
										<FilterIcon size={16} className="text-gray-500" />
										<span className="text-sm font-medium">Filter by:</span>
										<select
											className="border border-gray-200 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-info focus:border-info"
											value={filterType}
											onChange={(e) => setFilterType(e.target.value)}
										>
											<option value="">All Transactions</option>
											{typeEnum.map((category) => (
												<option key={category} value={category}>
													{category}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => setShowAddModal(true)}
										className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info-dark text-sm flex items-center shadow-sm transition-colors"
									>
										<PlusIcon size={16} className="mr-1" />
										Add Expense
									</button>
									<PDFDownloadLink
										document={
											<ExpensePdfDocument expenses={currentTransactions} />
										}
										fileName="expense_report.pdf"
										className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark text-sm flex items-center shadow-sm transition-colors"
									>
										<DownloadIcon size={16} className="mr-2" />
										Download Expense Report
									</PDFDownloadLink>
								</div>
							</div>
							{/* Table */}
							<div className="overflow-x-auto rounded-lg border border-gray-200">
								<table className="min-w-full bg-white">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-semibold">ID</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("date")}
											>
												<div className="flex items-center">
													Date
													{sortField === "date" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("amount")}
											>
												<div className="flex items-center">
													Amount
													{sortField === "amount" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Type
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Description
											</th>
											<th className="py-3 px-4 text-center font-semibold">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentTransactions.map((transaction) => (
											<tr key={transaction.id} className="hover:bg-gray-50">
												<td className="py-3 px-4 text-sm font-medium">
													{transaction.id}
												</td>
												<td className="py-3 px-4 text-sm">
													{formatDate(transaction.date)}
												</td>
												<td className="py-3 px-4 text-sm font-medium">
													Rs.{transaction.amount.toLocaleString()}
												</td>
												<td className="py-3 px-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(
															transaction.type
														)}`}
													>
														{transaction.type}
													</span>
												</td>
												<td className="py-3 px-4 text-sm">
													{transaction.description}
												</td>
												<td className="py-3 px-4 text-center">
													<div className="flex justify-center">
														<button
															className="p-1.5 bg-info-100 text-info rounded-lg hover:bg-info-200 transition-colors"
															onClick={() => setShowViewModal(transaction)}
														>
															<EyeIcon size={16} />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							{/* 404 fallback */}
							{currentTransactions.length === 0 && (
								<div className="text-center py-10">
									<ClipboardIcon
										size={48}
										className="mx-auto text-gray-300 mb-4"
									/>
									<p className="text-gray-500">
										No transactions found for {getMonthName(selectedMonth)}{" "}
										{selectedYear}.
									</p>
									<button
										onClick={() => setShowAddModal(true)}
										className="mt-4 px-4 py-2 bg-info text-white rounded-lg hover:bg-info-dark text-sm shadow-sm transition-colors"
									>
										<PlusIcon size={16} className="inline-block mr-1" />
										Add Transaction
									</button>
								</div>
							)}
							{/* pagination */}
							<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
								<div>
									Showing {indexOfFirstItem + 1} to{" "}
									{Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
									{filteredTransactions.length} requests
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
											disabled={indexOfLastItem >= filteredTransactions.length}
										>
											<ChevronRightIcon size={18} />
										</button>
									</nav>
								</div>
							</div>
						</div>
						{/* Add Transaction Modal */}
						{showAddModal && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-medium">Add New Transaction</h3>
										<button
											onClick={() => setShowAddModal(false)}
											className="text-gray-400 hover:text-gray-600"
										>
											<XIcon size={20} />
										</button>
									</div>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Amount
											</label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<DollarSignIcon size={16} className="text-gray-400" />
												</div>
												<input
													type="number"
													value={newTransaction.amount}
													onChange={(e) =>
														setNewTransaction({
															...newTransaction,
															amount: parseFloat(e.target.value),
														})
													}
													className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-info focus:border-info sm:text-sm border border-gray-200 p-2"
													placeholder="0.00"
													required
													min={1}
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Type
											</label>
											<select
												value={newTransaction.type}
												onChange={(e) =>
													setNewTransaction({
														...newTransaction,
														type: e.target.value,
													})
												}
												className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-info focus:border-info sm:text-sm border border-gray-200 p-2"
												required
											>
												<option value="">Transactions Type</option>
												{typeEnum.map((category) => (
													<option key={category} value={category}>
														{category}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Description
											</label>
											<textarea
												value={newTransaction.description}
												onChange={(e) =>
													setNewTransaction({
														...newTransaction,
														description: e.target.value,
													})
												}
												className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-info focus:border-info sm:text-sm border border-gray-200 p-2"
												rows={3}
												placeholder="Transaction description..."
											></textarea>
										</div>
									</div>
									<div className="mt-6 flex justify-end space-x-3">
										<button
											onClick={() => setShowAddModal(false)}
											className="px-4 py-2 border border-gray-200 border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
										>
											Cancel
										</button>
										<button
											onClick={submitHandler}
											className="px-4 py-2 border border-gray-200 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
										>
											Save Transaction
										</button>
									</div>
								</div>
							</div>
						)}
						{/* View Transaction Modal */}
						{showViewModal && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
									<div className="flex justify-between items-center mb-6">
										<div className="flex items-center">
											<div
												className={`p-2 rounded-full mr-3 ${
													showViewModal.type === "emergency"
														? "bg-fire-100"
														: "bg-info-100"
												}`}
											>
												<TagIcon
													size={20}
													className={
														showViewModal.type === "emergency"
															? "text-fire"
															: "text-info"
													}
												/>
											</div>
											<h3 className="text-lg font-semibold">
												Transaction Details
											</h3>
										</div>
										<button
											onClick={() => setShowViewModal(null)}
											className="text-gray-400 hover:text-gray-600"
										>
											<XIcon size={20} />
										</button>
									</div>
									<div className="space-y-4">
										<div className="flex justify-between py-3 border-b border-gray-200">
											<span className="text-gray-600">Transaction ID</span>
											<span className="font-medium">{showViewModal.id}</span>
										</div>
										<div className="flex justify-between py-3 border-b border-gray-200">
											<span className="text-gray-600">Date</span>
											<span className="font-medium">
												{formatDate(showViewModal.date)}
											</span>
										</div>
										<div className="flex justify-between py-3 border-b border-gray-200">
											<span className="text-gray-600">Amount</span>
											<span className="font-medium text-lg">
												Rs.{showViewModal.amount.toLocaleString()}
											</span>
										</div>
										<div className="flex justify-between py-3 border-b border-gray-200">
											<span className="text-gray-600">Type</span>
											<span
												className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(
													showViewModal.type
												)}`}
											>
												{showViewModal.type.charAt(0).toUpperCase() +
													showViewModal.type.slice(1)}
											</span>
										</div>
										<div className="py-3">
											<span className="text-gray-600 block mb-2">
												Description
											</span>
											<p className="bg-gray-50 p-3 rounded-lg">
												{showViewModal.description}
											</p>
										</div>
									</div>
									<div className="mt-6 flex justify-end">
										<button
											onClick={() => setShowViewModal(null)}
											className="px-4 py-2 bg-info text-white rounded-md shadow-sm text-sm font-medium hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info flex items-center"
										>
											<ArrowRightIcon size={16} className="mr-1" />
											Close
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default Expenses;
