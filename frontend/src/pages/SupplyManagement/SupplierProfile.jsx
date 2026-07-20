import React, { useEffect, useState } from "react";
import {
	MailIcon,
	PhoneIcon,
	BuildingIcon,
	MapPinIcon,
	BadgeCheckIcon,
	IdCardIcon,
	PackageIcon,
	CalendarIcon,
	TagIcon,
	AlertTriangleIcon,
	ClockIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
import { getSupplierProfile } from "../../services/supply/supplyService";
import extractErrorMessage from "../../utils/errorMessageParser";
import Loader from "../../components/Loader";
import formatDate from "../../utils/convertDate";

const SupplierProfile = () => {
	const [supplierData, setSupplierData] = useState({});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getSupplierProfile();
				setSupplierData(res.data);
			} catch (exception) {
				setError(extractErrorMessage(exception));
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

	const calculateSuccessRate = () => {
		const total = supplierData.supplyCount + supplierData.failedSupplyCount;
		return total > 0 ? Math.round((supplierData.supplyCount / total) * 100) : 0;
	};

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6 max-w-5xl mx-auto">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-gray-800">
								Supplier Profile
							</h1>
							<div className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
								{supplierData.supplierType} Supplier
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
							<div className="bg-gray-50 border-b border-gray-200 p-5">
								<div className="flex items-center">
									<IdCardIcon size={24} className="text-fire mr-3" />
									<div>
										<p className="text-sm text-gray-500">Supplier ID</p>
										<p className="font-medium">{supplierData.id}</p>
									</div>
								</div>
							</div>
							<div className="p-6">
								<div className="mb-8">
									<div className="flex items-center mb-6">
										<BuildingIcon size={20} className="text-fire mr-2" />
										<h2 className="text-xl font-bold text-gray-800">
											Company Information
										</h2>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Company Name
											</label>
											<div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
												{supplierData.name}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Supplier Type
											</label>
											<div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
												<TagIcon size={16} className="text-gray-400 mr-2" />
												{supplierData.supplierType}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Email Address
											</label>
											<div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
												<MailIcon size={16} className="text-gray-400 mr-2" />
												{supplierData.email}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Phone Number
											</label>
											<div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
												<PhoneIcon size={16} className="text-gray-400 mr-2" />
												{supplierData.phone}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												NIC Number
											</label>
											<div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
												{supplierData.nic}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Account Created
											</label>
											<div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
												<CalendarIcon
													size={16}
													className="text-gray-400 mr-2"
												/>
												{formatDate(supplierData.createdAt)}
											</div>
										</div>
									</div>
								</div>
								<div className="mb-6">
									<div className="flex items-center mb-6">
										<PackageIcon size={20} className="text-fire mr-2" />
										<h2 className="text-xl font-bold text-gray-800">
											Supply Performance
										</h2>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="bg-success-50 border border-success-100 rounded-lg p-4">
											<div className="flex items-center mb-2">
												<PackageIcon
													size={20}
													className="text-success mr-2"
												/>
												<h3 className="font-semibold text-success-dark">
													Successful Supplies
												</h3>
											</div>
											<p className="text-2xl font-bold text-success-dark">
												{supplierData.supplyCount}
											</p>
										</div>
										<div className="bg-fire-50 border border-fire-100 rounded-lg p-4">
											<div className="flex items-center mb-2">
												<AlertTriangleIcon
													size={20}
													className="text-fire mr-2"
												/>
												<h3 className="font-semibold text-fire-dark">
													Failed Supplies
												</h3>
											</div>
											<p className="text-2xl font-bold text-fire-dark">
												{supplierData.failedSupplyCount}
											</p>
										</div>
										<div className="bg-info-50 border border-info-100 rounded-lg p-4">
											<div className="flex items-center mb-2">
												<BadgeCheckIcon
													size={20}
													className="text-info mr-2"
												/>
												<h3 className="font-semibold text-info-dark">
													Success Rate
												</h3>
											</div>
											<p className="text-2xl font-bold text-info-dark">
												{calculateSuccessRate()}%
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 border-t border-gray-200 p-4">
								<div className="flex items-center text-sm text-gray-600">
									<ClockIcon size={16} className="mr-2 text-gray-500" />
									<span>Last login: {formatDate(supplierData.lastLogin)}</span>
								</div>
							</div>
						</div>
						<div className="bg-info-50 border border-info-200 rounded-lg p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-info-300"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-info-dark">
										This is a read-only profile view. To update any information,
										please contact system administration.
									</p>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default SupplierProfile;
