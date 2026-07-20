import React, { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	PlusIcon,
	EditIcon,
	TrashIcon,
	EyeIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
	deleteBid,
	getMyBids,
	getSupplyRequests,
	getSupplyRequestsById,
} from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
import Loader from "../../components/Loader";
import ConfirmDeletion from "../../components/ConfirmDeletion";
import ModifyBidForm from "./ModifyBidForm";
import extractErrorMessage from "../../utils/errorMessageParser";
const Bids = () => {
	const navigate = useNavigate();
	const { requestId } = useParams();
	const [showForm, setShowForm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentRequest, setCurrentRequest] = useState(null);
	const [supplyRequests, setSupplyRequests] = useState([]);
	const [biddenRequests, setBiddenRequests] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;

	const fetchInitialData = async () => {
		try {
			setLoading(true);
			const biddenRes = await getMyBids();
			setBiddenRequests(biddenRes.data);
			const res = await getSupplyRequests();
			setSupplyRequests(res.data);
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInitialData();
	}, [showForm]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	useEffect(() => {
		if (requestId) {
			setLoading(true);
			const fetchData = async () => {
				try {
					const res = await getSupplyRequestsById(requestId);
					setCurrentRequest(res.data);
					setShowForm(true);
				} catch (error) {
					setError(extractErrorMessage(error));
				} finally {
					setLoading(false);
				}
			};
			fetchData();
		}
	}, [requestId]);

	const filteredRequests = biddenRequests.filter((request) => {
		const matchesSearch =
			request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.id.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
	});

	const handleNewApplication = () => {
		setCurrentRequest(null);
		setShowForm(true);
	};
	const toggleModifyForm = (request) => {
		setCurrentRequest(request);
		setShowForm(true);
	};
	const handleDeleteBid = () => {
		setLoading(true);
		const fetchData = async () => {
			try {
				await deleteBid(currentRequest._id);
				setCurrentRequest(null);
				fetchInitialData();
				toast.success("bid deleted");
			} catch (error) {
				setError(extractErrorMessage(error));
			} finally {
				setShowDeleteConfirm(false);
				setLoading(false);
			}
		};
		fetchData();
	};
	const handleCancel = () => {
		setShowForm(false);
		if (requestId) {
			navigate("/supplier/supply-requests", {
				replace: true,
			});
		}
	};

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

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<SearchBox searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						{!showForm ? (
							<Fragment>
								<div className="flex justify-between items-center">
									<h1 className="text-2xl font-bold text-gray-800">My Bids</h1>
									<button
										className="bg-fire text-white px-5 py-2.5 rounded-lg hover:bg-fire-dark transition-colors flex items-center font-medium"
										onClick={handleNewApplication}
									>
										<PlusIcon size={18} className="mr-2" />
										New Bid
									</button>
								</div>
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Request ID
													</th>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Request Title
													</th>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Quantity
													</th>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Offered Price
													</th>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Delivery Date
													</th>
													<th
														scope="col"
														className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{currentRequests.map((request) => (
													<tr key={request.id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															{request.id}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
															{request.title}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
															{request.quantity} {request.unit}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
															{request.bid.offerPrice}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
															{formatDate(request.bid.deliveryDate)}
														</td>

														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
															<div className="flex space-x-3">
																<button
																	className="text-amber hover:text-amber-dark"
																	onClick={() => toggleModifyForm(request)}
																	title="Edit"
																>
																	<EditIcon size={18} />
																</button>
																<button
																	className="text-fire hover:text-fire-dark"
																	onClick={() => {
																		setShowDeleteConfirm(true);
																		setCurrentRequest(request);
																	}}
																	title="Delete"
																>
																	<TrashIcon size={18} />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{/* Pagination */}
									<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
										<div>
											Showing {indexOfFirstItem + 1} to{" "}
											{Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
											{filteredRequests.length} requests
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
													disabled={indexOfLastItem >= filteredRequests.length}
												>
													<ChevronRightIcon size={18} />
												</button>
											</nav>
										</div>
									</div>
								</div>
							</Fragment>
						) : (
							<ModifyBidForm
								currentRequest={currentRequest}
								supplyRequests={supplyRequests}
								handleCancel={handleCancel}
								setCurrentRequest={setCurrentRequest}
								setShowForm={setShowForm}
							/>
						)}
					</div>
				</main>
			</div>
			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<ConfirmDeletion
					handleDeleteBid={handleDeleteBid}
					setShowDeleteConfirm={setShowDeleteConfirm}
				/>
			)}
		</div>
	);
};

export default Bids;
