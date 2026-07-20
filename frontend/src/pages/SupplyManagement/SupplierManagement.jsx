import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Edit, Filter, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
	deleteSupplier,
	getSuppliers,
} from "../../services/supply/supplyService";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
import ConfirmDeletion from "../../components/ConfirmDeletion";
import { AddSupplierModal } from "../../components/AddSupplierModal";
import { EditSupplierModal } from "../../components/EditSupplierModal";
import extractErrorMessage from "../../utils/errorMessageParser";

const SupplierManagement = () => {
	const [filterCategory, setFilterCategory] = useState("all");
	const [loading, setLoading] = useState(true);
	const [suppliers, setSuppliers] = useState([]);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [currentSupplier, setCurrentSupplier] = useState(null);
	const itemsPerPage = 20;

	const location = useLocation();

	const fetchSuppliers = async () => {
		try {
			setLoading(true);
			const res = await getSuppliers();
			setSuppliers(res.data);
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
		fetchSuppliers();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredSuppliers = suppliers.filter((supplier) => {
		const matchesSearch =
			searchQuery === "" ||
			supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			filterCategory === "all" || supplier.supplierType === filterCategory;
		return matchesSearch && matchesCategory;
	});
	const categories = [
		"Equipment",
		"Vehicle Maintenance",
		"Uniforms",
		"Medical Supplies",
		"Services",
		"Other",
	];

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentSuppliers = filteredSuppliers.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const handleNextPage = () => {
		if (indexOfLastItem < filteredSuppliers.length) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const calculateSuccessRate = (supplierData) => {
		const total = supplierData.supplyCount + supplierData.failedSupplyCount;
		return total > 0 ? Math.round((supplierData.supplyCount / total) * 100) : 0;
	};

	const handleDeleteRequest = () => {
		setLoading(true);
		const fetchData = async () => {
			try {
				await deleteSupplier(currentSupplier._id);
				fetchSuppliers();
				setCurrentSupplier(null);
				toast.success("supplier deleted");
			} catch (error) {
				setError(extractErrorMessage(error));
			} finally {
				setShowDeleteConfirm(false);
				setLoading(false);
			}
		};
		fetchData();
	};

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-gray-800">
								Supplier Management
							</h1>
							<button
								onClick={() => setShowAddModal(true)}
								className="flex items-center gap-2 bg-fire hover:bg-fire-dark text-white py-2 px-4 rounded-md"
							>
								<Plus size={18} />
								<span>Add Supplier</span>
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
										value={filterCategory}
										onChange={(e) => {
											setFilterCategory(e.target.value);
											setCurrentPage(1);
										}}
									>
										<option value="all">All Categories</option>
										{categories.map((category) => (
											<option key={category} value={category}>
												{category}
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
												Supplier Name
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Contact Info
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Category
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Success Rate
											</th>
											<th className="py-3 px-4 text-center font-medium">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentSuppliers.map((supplier) => (
											<tr key={supplier.id} className="hover:bg-gray-50">
												<td className="py-3 px-4">
													<div className="font-medium text-gray-900">
														{supplier.name}
													</div>
												</td>
												<td className="py-3 px-4">
													<div>{supplier.contact}</div>
													<div className="text-gray-500 text-sm">
														{supplier.email}
													</div>
												</td>
												<td className="py-3 px-4">{supplier.supplierType}</td>
												<td className="py-3 px-4">
													<div className="flex items-center">
														<div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
															<div
																className="bg-info h-2.5 rounded-full"
																style={{
																	width: supplier.supplyCount
																		? `${
																				((supplier.supplyCount -
																					(supplier.failedSupplyCount || 0)) /
																					supplier.supplyCount) *
																				100
																		  }%`
																		: "0%",
																}}
															></div>
														</div>
														<span className="text-sm">
															{calculateSuccessRate(supplier)}%
														</span>
													</div>
												</td>
												<td className="py-3 px-4">
													<div className="flex items-center justify-center gap-2">
														<button
															className="p-1 hover:bg-gray-100 rounded"
															onClick={() => {
																setShowEditModal(true);
																setCurrentSupplier(supplier);
															}}
														>
															<Edit size={18} className="text-info" />
														</button>
														<button
															className="p-1 hover:bg-fire-100 rounded"
															title="Delete"
															onClick={() => {
																setShowDeleteConfirm(true);
																setCurrentSupplier(supplier);
															}}
														>
															<Trash2 size={18} className="text-fire" />
														</button>
													</div>
												</td>
											</tr>
										))}
										{currentSuppliers.length === 0 && (
											<tr>
												<td
													colSpan={6}
													className="py-4 text-center text-gray-500"
												>
													No suppliers found matching your criteria
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
								<div>
									Showing {indexOfFirstItem + 1} to{" "}
									{Math.min(indexOfLastItem, filteredSuppliers.length)} of{" "}
									{filteredSuppliers.length} requests
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
										disabled={indexOfLastItem >= filteredSuppliers.length}
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
			{/* Add supplier modal */}
			{showAddModal && (
				<AddSupplierModal
					setShowAddModal={setShowAddModal}
					setError={setError}
					fetchSuppliers={fetchSuppliers}
				/>
			)}
			{showEditModal && (
				<EditSupplierModal
					fetchSuppliers={fetchSuppliers}
					setShowEditModal={setShowEditModal}
					supplier={currentSupplier}
					setError={setError}
				/>
			)}
		</div>
	);
};

export default SupplierManagement;
