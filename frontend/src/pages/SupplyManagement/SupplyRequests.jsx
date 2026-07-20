import React, { Fragment, useEffect, useState } from "react";
import { Filter, Edit, Trash2, Plus, BarChart, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
	confirmRequest,
	deleteSupplyRequest,
	getSupplyRequests,
	rejectRequest,
} from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
import StatusBadge from "../../components/StatusBadge";
import extractErrorMessage from "../../utils/errorMessageParser";
import ConfirmDeletion from "../../components/ConfirmDeletion";
import { AddRequestModal } from "../../components/AddRequestModal";
import { EditRequestModal } from "../../components/EditRequestModal";
import { BidComparisonModal } from "../../components/BidComparisonModal";

const SupplyRequests = () => {
	const [filterStatus, setFilterStatus] = useState("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [SupplyRequests, setSupplyRequests] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showComparisonModal, setShowComparisonModal] = useState(false);
	const [currentRequest, setCurrentRequest] = useState(null);
	const itemsPerPage = 20;

	const location = useLocation();

	const fetchSupplyRequests = async () => {
		setLoading(true);
		try {
			const res = await getSupplyRequests();
			setSupplyRequests(res.data);
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (location.state?.showAddModal) {
			setShowAddModal(true);
		}
	}, [location.state]);

	useEffect(() => {
		fetchSupplyRequests();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredRequests = SupplyRequests.filter((request) => {
		const matchesSearch =
			searchQuery === "" ||
			request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.id.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			filterStatus === "all" || request.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentRequests = filteredRequests.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const handleNextPage = () => {
		if (indexOfLastItem < filteredRequests.length) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleDeleteRequest = () => {
		setLoading(true);
		const fetchData = async () => {
			try {
				await deleteSupplyRequest(currentRequest._id);
				fetchSupplyRequests();
				setCurrentRequest(null);
				toast.success("request deleted");
			} catch (error) {
				setError(extractErrorMessage(error));
			} finally {
				setShowDeleteConfirm(false);
				setLoading(false);
			}
		};
		fetchData();
	};

	const handleAcceptRequest = () => {
		setLoading(true);
		const fetchData = async () => {
			try {
				await confirmRequest(currentRequest._id);
				fetchSupplyRequests();
				setCurrentRequest(null);
				toast.success("Confirmed delivery!");
			} catch (error) {
				setError(extractErrorMessage(error));
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	};

	const handleRejectRequest = () => {
		setLoading(true);
		const fetchData = async () => {
			try {
				await rejectRequest(currentRequest._id);
				fetchSupplyRequests();
				setCurrentRequest(null);
				toast.success("Rejected delivery!");
			} catch (error) {
				setError(extractErrorMessage(error));
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	};

	const statusEnum = ["Open", "Assigned", "Rejected", "Closed"];

	if (loading) return <Loader />;
	// TODO: fix 404

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-gray-800">
								Supplier Requests
							</h1>
							<button
								onClick={() => setShowAddModal(true)}
								className="flex items-center gap-2 bg-fire hover:bg-fire-dark text-white py-2 px-4 rounded-md transition-colors"
							>
								<Plus size={18} />
								<span>Create Request</span>
							</button>
						</div>
						<div className="bg-white rounded-lg shadow">
							<div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex items-center gap-2">
									<Filter size={18} className="text-gray-500" />
									<span className="font-medium">Filters:</span>
								</div>
								<div className="flex flex-wrap gap-3">
									<select
										className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fire"
										value={filterStatus}
										onChange={(e) => {
											setFilterStatus(e.target.value);
											setCurrentPage(1);
										}}
									>
										<option value="all">All</option>
										{statusEnum.map((status) => (
											<option key={status} value={status}>
												{status}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-medium">
												Request ID
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Request title
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Category
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Quantity
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Created Date
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Deadline
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Status
											</th>
											<th className="py-3 px-4 text-left font-medium">Bids</th>
											<th className="py-3 px-4 text-center font-medium">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentRequests.map((request) => (
											<tr key={request.id} className="hover:bg-gray-50">
												<td className="py-3 px-4 font-medium">{request.id}</td>
												<td className="py-3 px-4">{request.title}</td>
												<td className="py-3 px-4">{request.category}</td>
												<td className="py-3 px-4">
													{request.quantity} {request.unit}
												</td>
												<td className="py-3 px-4">
													{formatDate(request.createdAt)}
												</td>
												<td className="py-3 px-4">
													{formatDate(request.applicationDeadline)}
												</td>
												<td className="py-3 px-4">
													<StatusBadge status={request.status} />
												</td>
												<td className="py-3 px-4">
													<span className="inline-flex items-center justify-center w-6 h-6 bg-info-100 text-info-dark rounded-full text-xs font-medium">
														{request.bids.length}
													</span>
												</td>
												<td>
													<div className="flex gap-2">
														{request.status === "Assigned" && (
															<Fragment>
																<button
																	className="p-1 bg-success-100 text-success-dark rounded hover:bg-success-200 transition-colors"
																	title="Approve"
																	onClick={() => {
																		setCurrentRequest(request);
																		handleAcceptRequest();
																	}}
																>
																	<Check size={18} />
																</button>
																<button
																	className="p-1 bg-fire-100 text-fire-dark rounded hover:bg-fire-200 transition-colors"
																	title="Reject"
																	onClick={() => {
																		setCurrentRequest(request);
																		handleRejectRequest();
																	}}
																>
																	<X size={18} />
																</button>
															</Fragment>
														)}
														{request.status === "Open" && (
															<button
																className="p-1 bg-info-100 text-info-dark rounded hover:bg-info-200 transition-colors"
																onClick={() => {
																	setCurrentRequest(request);
																	setShowEditModal(true);
																}}
															>
																<Edit size={18} />
															</button>
														)}
														{request.status === "Open" && (
															<button
																className="p-1 bg-fire-100 text-fire-dark rounded hover:bg-fire-200 transition-colors"
																title="Delete"
																onClick={() => {
																	setCurrentRequest(request);
																	setShowDeleteConfirm(true);
																}}
															>
																<Trash2 size={18} />
															</button>
														)}
														{request.bids.length > 0 &&
															request.status === "Open" && (
																<button
																	onClick={() => {
																		setShowComparisonModal(true);
																		setCurrentRequest(request);
																	}}
																	className="p-1 bg-info-100 text-info-dark rounded hover:bg-info-200 transition-colors"
																	title="View Bids"
																>
																	<BarChart size={18} />
																</button>
															)}
													</div>
												</td>
											</tr>
										))}
										{currentRequests.length === 0 && (
											<tr>
												<td
													colSpan={8}
													className="py-4 text-center text-gray-500"
												>
													No requests found matching your criteria
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
								<div>
									Showing {indexOfFirstItem + 1} to{" "}
									{Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
									{filteredRequests.length} requests
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={handlePrevPage}
										disabled={currentPage === 1}
										className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
									>
										Previous
									</button>
									<button
										onClick={handleNextPage}
										disabled={indexOfLastItem >= filteredRequests.length}
										className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
									>
										Next
									</button>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<ConfirmDeletion
					handleDeleteBid={handleDeleteRequest}
					setShowDeleteConfirm={setShowDeleteConfirm}
				/>
			)}
			{showAddModal && (
				<AddRequestModal
					setShowAddModal={setShowAddModal}
					setError={setError}
					fetchRequests={fetchSupplyRequests}
				/>
			)}
			{showEditModal && (
				<EditRequestModal
					setShowEditModal={setShowEditModal}
					request={currentRequest}
					fetchRequests={fetchSupplyRequests}
					setError={setError}
				/>
			)}
			{showComparisonModal && (
				<BidComparisonModal
					setShowComparisonModal={setShowComparisonModal}
					request={currentRequest}
					fetchRequests={fetchSupplyRequests}
					setError={setError}
				/>
			)}
		</div>
	);
};

export default SupplyRequests;
