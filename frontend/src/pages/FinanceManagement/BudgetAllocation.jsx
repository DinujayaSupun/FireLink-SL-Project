import React, { useEffect, useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	EditIcon,
	UserIcon,
	UsersIcon,
	DollarSignIcon,
	SaveIcon,
	XIcon,
	BarChartIcon,
	ArrowRightIcon,
	PieChartIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
import {
	assignBudget,
	getAllocationData,
	getUsageData,
	getUtilizationData,
} from "../../services/finance/financeService";
import extractErrorMessage from "../../utils/errorMessageParser";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
const BudgetAllocation = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showFinanceManagerModal, setShowFinanceManagerModal] = useState(false);
	const [allocationData, setAllocationData] = useState({});
	const [utilizationData, setUtilizationData] = useState({});
	const [usageData, setUsageData] = useState({});
	const [isAllocated, setIsAllocated] = useState(false);
	const [sliderValue, setSliderValue] = useState(50000);

	const fetchAllocationData = async () => {
		setLoading(true);
		try {
			const res = await getAllocationData();
			const utilRes = await getUtilizationData();
			const usageRes = await getUsageData();
			setAllocationData(res.data);
			setIsAllocated(!!res.data.supplyManager.totalBudget);
			setUtilizationData(utilRes.data);
			setUsageData(usageRes.data);
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllocationData();
	}, [showFinanceManagerModal]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const handleAssignBudget = async () => {
		try {
			await assignBudget(sliderValue);
			toast.success("Budget assigned to supply manager");
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setShowFinanceManagerModal(false);
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
							Budget Allocation
						</h1>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
							<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Total Budget</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.totalBudget}
										</p>
										<p className="text-blue-100 mt-1">For current month</p>
									</div>
									<div className="bg-blue-400/30 p-4 rounded-full">
										<DollarSignIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Supply Manager Budget
										</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.supplyManager.totalBudget}
										</p>
										<p className="text-purple-100 mt-1">
											{Math.round(
												(allocationData.supplyManager.totalBudget /
													allocationData.financeManager.totalBudget) *
													100
											)}
											% of total budget
										</p>
									</div>
									<div className="bg-purple-400/30 p-4 rounded-full">
										<PieChartIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Spent</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.spendAmount}
										</p>
										<p className="text-green-100 mt-1">
											{Math.round(
												(allocationData.financeManager.spendAmount /
													allocationData.financeManager.totalBudget) *
													100
											)}
											% of total budget
										</p>
									</div>
									<div className="bg-green-400/30 p-4 rounded-full">
										<BarChartIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Remaining</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.remainingAmount}
										</p>
										<p className="text-amber-100 mt-1">
											{Math.round(
												(allocationData.financeManager.remainingAmount /
													allocationData.financeManager.totalBudget) *
													100
											)}
											% of total budget
										</p>
									</div>
									<div className="bg-amber-400/30 p-4 rounded-full">
										<ArrowRightIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						{/* Manager Budget Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Supply Manager Budget Card */}
							<div className="bg-white rounded-xl p-6">
								<div className="flex items-center justify-between mb-5 border-b border-b-gray-200 pb-3">
									<div className="flex items-center">
										<div className="bg-blue-100 p-3 rounded-full mr-3">
											<UserIcon size={22} className="text-blue-600" />
										</div>
										<h2 className="text-xl font-semibold text-gray-800">
											Supply Manager Budget
										</h2>
									</div>
									<span className="text-sm bg-blue-50 text-blue-700 font-medium px-3 py-1 rounded-full">
										Current Month
									</span>
								</div>

								<div className="flex flex-wrap gap-4 mb-6 justify-between">
									<div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Total Budget</p>
										<p className="text-2xl font-bold text-gray-800">
											Rs.{allocationData.supplyManager.totalBudget}
										</p>
									</div>
									<div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Spent</p>
										<p className="text-2xl font-bold text-blue-600">
											Rs.{allocationData.supplyManager.spendAmount}
										</p>
									</div>
									<div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Remaining</p>
										<p className="text-2xl font-bold text-green-600">
											Rs.{allocationData.supplyManager.remainingAmount}
										</p>
									</div>
								</div>

								{/* Category-wise usage */}
								<div className="space-y-3">
									{usageData.supplyManager.map((category, index) => (
										<div
											key={index}
											className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors shadow-sm"
										>
											<div>
												<p className="font-medium text-gray-800">
													{category.name}
												</p>
												<p className="text-xs text-gray-500">
													Spent: Rs.{category.totalSpend.toLocaleString()}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
													{category.percentageUsed}%
												</span>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Finance Manager Budget Card */}
							<div className="bg-white rounded-xl p-6">
								<div className="flex items-center justify-between mb-5 border-b border-b-gray-200 pb-3">
									<div className="flex items-center">
										<div className="bg-purple-100 p-3 rounded-full mr-3">
											<UsersIcon size={22} className="text-purple-600" />
										</div>
										<h2 className="text-xl font-semibold text-gray-800">
											Finance Manager Budget
										</h2>
									</div>
									<span className="text-sm bg-purple-50 text-purple-700 font-medium px-3 py-1 rounded-full">
										Current Month
									</span>
								</div>

								<div className="flex flex-wrap gap-4 mb-6 justify-between">
									<div className="flex-1 bg-purple-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Total Budget</p>
										<p className="text-2xl font-bold text-gray-800">
											Rs.{allocationData.financeManager.totalBudget}
										</p>
									</div>
									<div className="flex-1 bg-purple-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Spent</p>
										<p className="text-2xl font-bold text-purple-600">
											Rs.{allocationData.financeManager.spendAmount}
										</p>
									</div>
									<div className="flex-1 bg-purple-50 rounded-lg p-4 text-center">
										<p className="text-sm text-gray-600">Remaining</p>
										<p className="text-2xl font-bold text-green-600">
											Rs.{allocationData.financeManager.remainingAmount}
										</p>
									</div>
								</div>

								{/* Category-wise usage */}
								<div className="space-y-3">
									{usageData.financeManager.map((category, index) => (
										<div
											key={index}
											className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors shadow-sm"
										>
											<div>
												<p className="font-medium text-gray-800">
													{category.name}
												</p>
												<p className="text-xs text-gray-500">
													Spent: Rs.{category.totalSpend.toLocaleString()}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
													{category.percentageUsed}%
												</span>
											</div>
										</div>
									))}
								</div>
								{!isAllocated && (
									<div className="mt-6 flex justify-end">
										<button
											className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition-colors flex items-center"
											onClick={() => {
												setShowFinanceManagerModal(true);
											}}
										>
											<EditIcon size={16} className="mr-1.5" />
											Assign Budget
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Monthly Utilization Chart */}
						<div className="bg-white rounded-lg shadow-sm p-5 shadow-md">
							<div className="flex items-center justify-between mb-6 border-b border-b-gray-200 pb-4">
								<div className="flex items-center">
									<div className="bg-green-100 p-2 rounded-full mr-3">
										<BarChartIcon size={20} className="text-green-600" />
									</div>
									<h2 className="text-xl font-semibold">
										Monthly Budget Utilization
									</h2>
								</div>
								<div className="flex items-center">
									<span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
										{Math.round(
											(allocationData.financeManager.spendAmount /
												allocationData.financeManager.totalBudget) *
												100
										)}
										% of budget utilized
									</span>
								</div>
							</div>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={utilizationData}
										margin={{
											top: 10,
											right: 30,
											left: 20,
											bottom: 10,
										}}
										barGap={8}
									>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis dataKey="name" axisLine={false} tickLine={false} />
										<YAxis
											label={{
												value: "Budget %",
												angle: -90,
												position: "insideLeft",
												offset: -5,
												style: {
													textAnchor: "middle",
												},
											}}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip
											formatter={(value) => [`${value}%`, ""]}
											labelStyle={{
												fontWeight: "bold",
												color: "#333",
											}}
											contentStyle={{
												backgroundColor: "white",
												border: "1px solid #e2e8f0",
												borderRadius: "8px",
												boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
											}}
										/>
										<Legend
											verticalAlign="top"
											height={36}
											wrapperStyle={{
												paddingTop: "10px",
											}}
										/>
										<Bar
											dataKey="supply"
											name="Supply Manager %"
											fill="var(--color-info)"
											radius={[4, 4, 0, 0]}
											animationDuration={1500}
										/>
										<Bar
											dataKey="finance"
											name="Finance Manager %"
											fill="#8b5cf6"
											radius={[4, 4, 0, 0]}
											animationDuration={1500}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
						{/* Finance Manager Budget Allocation Modal */}
						{showFinanceManagerModal && (
							<div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fadeIn">
									<div className="flex justify-between items-center mb-6">
										<div className="flex items-center">
											<div className="bg-purple-100 p-2 rounded-full mr-3">
												<DollarSignIcon size={20} className="text-purple-600" />
											</div>
											<h3 className="text-lg font-semibold">
												Allocate Budget to Supply Manager
											</h3>
										</div>
										<button
											onClick={() => setShowFinanceManagerModal(false)}
											className="text-gray-400 hover:text-gray-600 transition-colors"
										>
											<XIcon size={20} />
										</button>
									</div>
									<div className="mb-6 bg-purple-50 p-4 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<p className="font-medium">Total Budget:</p>
											<p className="font-bold text-purple-700">
												Rs.{allocationData.financeManager.totalBudget}
											</p>
										</div>
										<div className="flex justify-between items-center mb-2">
											<p className="text-sm text-gray-600">
												Remaining to Allocate:
											</p>
											<p
												className={`text-sm font-medium ${
													1050000 -
														(tempAllocation.salaries +
															tempAllocation.operationalTransactions +
															tempAllocation.emergencyTransactions) ===
													0
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												$
												{(
													allocationData.financeManager.remainingAmount -
													sliderValue
												).toLocaleString()}
											</p>
										</div>
									</div>
									<div className="space-y-6">
										<div>
											<label className="flex justify-between mb-2">
												<span className="text-sm font-medium">
													Supply Manager Budget
												</span>
												<span className="text-sm text-purple-600 font-medium">
													Rs.{sliderValue.toLocaleString()}
												</span>
											</label>
											<div className="flex items-center">
												<input
													type="range"
													min="50000"
													max="500000"
													step="10000"
													value={sliderValue}
													onChange={(e) =>
														setSliderValue(parseInt(e.target.value))
													}
													className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
												/>
											</div>
											<div className="flex justify-between mt-1 text-xs text-gray-500">
												<span>Rs.50,000</span>
												<span>Rs.500,000</span>
											</div>
										</div>
									</div>
									<div className="mt-8 flex justify-end space-x-3">
										<button
											onClick={() => {
												setShowFinanceManagerModal(false);
												setSliderValue(50000);
											}}
											className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
										>
											Cancel
										</button>
										<button
											onClick={handleAssignBudget}
											className={`px-4 py-2 flex items-center rounded-lg text-white ${
												1050000 -
													(tempAllocation.salaries +
														tempAllocation.operationalTransactions +
														tempAllocation.emergencyTransactions) ===
												0
													? "bg-purple-600 hover:bg-purple-700"
													: "bg-gray-400 cursor-not-allowed"
											} transition-colors shadow-md`}
											disabled={
												1050000 -
													(tempAllocation.salaries +
														tempAllocation.operationalTransactions +
														tempAllocation.emergencyTransactions) !==
												0
											}
										>
											<SaveIcon size={18} className="mr-1" />
											Save Allocation
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

export default BudgetAllocation;
