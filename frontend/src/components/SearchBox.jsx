import React from "react";
import { Search, Bell, Menu, User } from "lucide-react";
import { useAuth } from "../context/auth";
import { useSupplierAuth } from "../context/supplierAuth";
import { useNavigate } from "react-router-dom";

const SearchBox = ({ searchQuery, setSearchQuery, hideSearchBar }) => {
	const { user } = useAuth();
	const { user: supplier } = useSupplierAuth();
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/supplier/profile");
	};

	return (
		<header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
			<div className="flex items-center md:hidden">
				<button className="p-1">
					<Menu size={24} />
				</button>
			</div>
			{!hideSearchBar && (
				<div className="flex-1 max-w-xl mx-4">
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Search suppliers, requests"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			)}
			<div className="flex items-center gap-4">
				<button className="relative p-1">
					<Bell size={20} className="text-gray-600" />
					<span className="absolute top-0 right-0 h-2 w-2 bg-fire rounded-full"></span>
				</button>
				<div className="flex items-center gap-3" onClick={() => handleClick()}>
					<div className="hidden md:block text-right">
						<div className="text-sm font-medium">
							{user ? user.name : supplier.name}
						</div>
					</div>
					<div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
						<User size={16} className="text-gray-600" />
					</div>
				</div>
			</div>
		</header>
	);
};

export default SearchBox;
