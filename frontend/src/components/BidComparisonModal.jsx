import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "react-toastify";
import formatDate from "../utils/convertDate";
import { assignSupplierToRequest } from "../services/supply/supplyRequestService";
import extractErrorMessage from "../utils/errorMessageParser";

export function BidComparisonModal({
	setShowComparisonModal,
	request,
	fetchRequests,
	setError,
}) {
	const [selectedBid, setSelectedBid] = useState(null);
	const [selectedSupplierId, setSelectedSupplierId] = useState(null);

	const calculateSuccessRate = (supplier) => {
		if (!supplier) return 0;

		const totalSupplies = supplier.supplyCount;
		const successfulSupplies = totalSupplies - supplier.failedSupplyCount;
		return totalSupplies > 0
			? ((successfulSupplies / totalSupplies) * 100).toFixed(1)
			: 0;
	};

	const handleSelectBid = (bidId, supplierId) => {
		setSelectedBid(bidId);
		setSelectedSupplierId(supplierId);
	};

	const handleAssignSupplier = () => {
		if (!selectedBid) return;
		const sendRequest = async () => {
			try {
				await assignSupplierToRequest(request._id, selectedSupplierId);
				fetchRequests();
				toast.success("Request Assigned successfully");
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setShowComparisonModal(false);
			}
		};

		sendRequest();
	};

	const lowestBid = [...request.bids]
		.filter((bid) => bid.offerPrice != null)
		.sort((a, b) => a.offerPrice - b.offerPrice)[0];

	const earliestDelivery = [...request.bids]
		.filter((bid) => bid.deliveryDate)
		.sort(
			(a, b) =>
				new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
		)[0];

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
					<h2 className="text-lg font-semibold text-gray-800">
						Compare Bids for {request.title}
					</h2>
					<button
						onClick={() => setShowComparisonModal(false)}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<X size={20} />
					</button>
				</div>
				<div className="p-4">
					<div className="mb-6">
						<h3 className="text-md font-medium text-gray-700 mb-2">
							Request Details
						</h3>
						<div className="bg-gray-50 p-3 rounded-md">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm text-gray-500">Category</p>
									<p className="font-medium">{request.category}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Quantity</p>
									<p className="font-medium">
										{request.quantity} {request.unit}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Deadline</p>
									<p className="font-medium">
										{formatDate(request.applicationDeadline)}
									</p>
								</div>
							</div>
							<div className="mt-2">
								<p className="text-sm text-gray-500">Description</p>
								<p className="text-sm">{request.description}</p>
							</div>
						</div>
					</div>
					{/* --- Bid Summary Section --- */}
					<div className="mb-6">
						<h3 className="text-md font-medium text-gray-700 mb-2">
							Bid Summary
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-success-50 p-3 rounded-md border border-success-200">
								<p className="text-sm text-gray-500">Total Bids</p>
								<p className="text-2xl font-bold text-success-dark">
									{request.bids.length}
								</p>
							</div>
							{lowestBid && (
								<div className="bg-info-50 p-3 rounded-md border border-info-200">
									<p className="text-sm text-gray-500">Lowest Bid</p>
									<p className="text-2xl font-bold text-info-dark">
										${lowestBid.offerPrice.toLocaleString()}
									</p>
									<p className="text-xs text-gray-500">
										by {lowestBid?.supplier?.name || "Unknown/Anonymous"}
									</p>
								</div>
							)}
							{earliestDelivery && (
								<div className="bg-info-50 p-3 rounded-md border border-info-200">
									<p className="text-sm text-gray-500">Earliest Delivery</p>
									<p className="text-lg font-bold text-info-dark">
										{formatDate(earliestDelivery.deliveryDate)}
									</p>
									<p className="text-xs text-gray-500">
										by {earliestDelivery?.supplier?.name || "Unknown/Anonymous"}
									</p>
								</div>
							)}
						</div>
					</div>
					{/* --- Success Rate Comparison Section --- */}
					<div className="mb-6">
						<h3 className="text-md font-medium text-gray-700 mb-2">
							Success Rate Comparison
						</h3>
						<div className="bg-white border border-gray-200 rounded-md overflow-hidden">
							{request.bids.map((bid) => {
								const supplier = bid.supplier;
								if (!supplier) return null;

								const successRate = calculateSuccessRate(supplier);
								return (
									<div
										key={bid._id}
										className="border-b border-gray-200 last:border-b-0"
									>
										<div className="p-3">
											<div className="flex justify-between items-center mb-1">
												<p className="font-medium">{supplier.name}</p>
												<p className="text-sm font-bold">
													{successRate}% Success Rate
												</p>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2.5">
												<div
													className="bg-info h-2.5 rounded-full"
													style={{
														width: `${successRate}%`,
													}}
												></div>
											</div>
											<div className="mt-2 flex justify-between text-xs text-gray-500">
												<p>Total Supplies: {supplier.supplyCount}</p>
												<p>Failed: {supplier.failedSupplyCount}</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
					{/* --- Bid Table Section --- */}
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-gray-50">
									<th className="px-4 py-2 border text-left">Select</th>
									<th className="px-4 py-2 border text-left">Supplier</th>
									<th className="px-4 py-2 border text-left">Offer Price</th>
									<th className="px-4 py-2 border text-left">Delivery Date</th>
									<th className="px-4 py-2 border text-left">Notes</th>
									<th className="px-4 py-2 border text-left">Success Rate</th>
								</tr>
							</thead>
							<tbody>
								{request.bids.map((bid) => {
									const supplier = bid.supplier;
									const isSelected = selectedBid === bid._id;
									const successRate = calculateSuccessRate(supplier);

									return (
										<tr
											key={bid._id}
											className={`hover:bg-gray-50 ${
												isSelected ? "bg-info-50" : ""
											}`}
											onClick={() => handleSelectBid(bid._id, bid.supplier._id)}
										>
											<td className="px-4 py-2 border">
												<div className="flex justify-center">
													<div
														className={`w-5 h-5 rounded-full border ${
															isSelected
																? "bg-info border-info"
																: "border-gray-300"
														} flex items-center justify-center`}
													>
														{isSelected && (
															<Check size={12} className="text-white" />
														)}
													</div>
												</div>
											</td>
											<td className="px-4 py-2 border">
												<div className="font-medium">
													{supplier?.name || "Unknown/Anonymous"}
												</div>
												<div className="text-xs text-gray-500">
													{supplier?.supplierType || "N/A"}
												</div>
											</td>
											<td className="px-4 py-2 border font-medium">
												${bid.offerPrice.toLocaleString()}
											</td>
											<td className="px-4 py-2 border">
												{formatDate(bid.deliveryDate)}
											</td>
											<td className="px-4 py-2 border text-sm">
												{bid.notes || "No notes provided"}
											</td>
											<td className="px-4 py-2 border">
												{supplier && (
													<div className="flex items-center">
														<div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
															<div
																className={`h-2 rounded-full ${
																	parseFloat(successRate) > 90
																		? "bg-success"
																		: parseFloat(successRate) > 70
																		? "bg-info"
																		: parseFloat(successRate) > 50
																		? "bg-amber"
																		: "bg-fire"
																}`}
																style={{
																	width: `${successRate}%`,
																}}
															></div>
														</div>
														<span className="text-sm font-medium">
															{successRate}%
														</span>
													</div>
												)}
												{!supplier && (
													<span className="text-sm text-gray-500">N/A</span>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowComparisonModal(false)}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleAssignSupplier}
							disabled={!selectedBid}
							className={`px-4 py-2 rounded-md text-white transition-colors ${
								selectedBid
									? "bg-fire hover:bg-fire-dark"
									: "bg-gray-400 cursor-not-allowed"
							}`}
						>
							Assign Selected Supplier
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
