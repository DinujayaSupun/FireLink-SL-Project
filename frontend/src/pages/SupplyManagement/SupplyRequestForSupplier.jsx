import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSupplyRequests } from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
const SupplyRequestForSupplier = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [supplyRequests, setSupplyRequests] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentRequest, setCurrentRequest] = useState(null);
	const navigate = useNavigate();
	const itemsPerPage = 20;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getSupplyRequests();
				setSupplyRequests(res.data);
			} catch (exception) {
				setError(exception.data.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredRequests = supplyRequests.filter((request) => {
		const matchesSearch =
			request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.id.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
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

	const viewRequestHandler = (requestId) => {
		const request = filteredRequests.find((req) => req._id === requestId);
		setCurrentRequest(request);
	};

	const handleSubmitBid = (requestId) => {
		navigate(`/supplier/bids/new/${requestId}`, { replace: true });
	};

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<SearchBox searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					{currentRequest ? (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-bold text-gray-800">
									Supply Request Details
								</h2>
								<button
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setCurrentRequest(null)}
								>
									Back to Requests
								</button>
							</div>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="text-lg font-semibold mb-4">
											Request Information
										</h3>
										<div className="space-y-3">
											<div>
												<p className="text-sm text-gray-500">Request ID</p>
												<p className="font-medium">{currentRequest.id}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Title</p>
												<p className="font-medium">{currentRequest.title}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Category</p>
												<div className="mt-1">{currentRequest.category}</div>
											</div>
										</div>
									</div>
									<div>
										<h3 className="text-lg font-semibold mb-4">
											Request Details
										</h3>
										<div className="space-y-3">
											<div>
												<p className="text-sm text-gray-500">Description</p>
												<p>{currentRequest.description}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Quantity</p>
												<p className="font-medium">
													{currentRequest.quantity} {currentRequest.unit}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Bid Deadline</p>
												<p className="font-medium">
													{formatDate(currentRequest.applicationDeadline)}
												</p>
											</div>
										</div>
									</div>
								</div>
								{!currentRequest.isBidden && (
									<div className="flex justify-end pt-4 border-t border-gray-200">
										<button
											className="bg-fire text-white px-5 py-2.5 rounded-lg hover:bg-fire-dark transition-colors font-medium"
											onClick={() => handleSubmitBid(currentRequest._id)}
										>
											Submit Bid for this Request
										</button>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h1 className="text-2xl font-bold text-gray-800">
									Supply Requests
								</h1>
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
													<div className="flex items-center">Request ID</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													<div className="flex items-center">Request title</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													<div className="flex items-center">Quantity</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													<div className="flex items-center">Category</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													<div className="flex items-center">Bid Deadline</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													Action
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{currentRequests.map((request) => (
												<tr key={request._id} className="hover:bg-gray-50">
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
														{request.category}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
														{formatDate(request.applicationDeadline)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
														<div className="flex space-x-3">
															<button
																className="text-info hover:text-info-dark"
																title="View"
																onClick={() => viewRequestHandler(request._id)}
															>
																<EyeIcon size={18} />
															</button>
															{!request.isBidden && (
																<button
																	className="text-fire hover:text-fire-dark font-medium"
																	onClick={() => handleSubmitBid(request._id)}
																>
																	Submit Bid
																</button>
															)}
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
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
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default SupplyRequestForSupplier;
