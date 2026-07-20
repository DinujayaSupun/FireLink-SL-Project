import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Users,
	ClipboardList,
	LogOut,
	Flame,
	UserIcon,
	ClipboardCheckIcon,
	ShoppingCartIcon,
	LayoutDashboard,
	BarChart3,
	CreditCardIcon,
	PieChartIcon,
} from "lucide-react";
import { useAuth } from "../context/auth";
import { useSupplierAuth } from "../context/supplierAuth";

const Sidebar = () => {
	const { checkRole, logout } = useAuth();
	const { user: supplier, logout: supplierLogout } = useSupplierAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const [isSupplier, setIsSupplier] = useState(false);

	let menuItems = [];
	let bottomMenuItems = [];

	useEffect(() => {
		if (supplier) {
			setIsSupplier(true);
		}
	}, [supplier]);

	const supplierLogoutHandler = (e) => {
		e.preventDefault();
		supplierLogout();
	};

	const logoutHandler = (e) => {
		e.preventDefault();
		logout();
		navigate("/staff-login");
	};

	if (checkRole("supply_manager")) {
		menuItems = [
			{
				id: "supply-dashboard",
				label: "Dashboard",
				icon: <LayoutDashboard size={20} />,
			},
			{
				id: "suppliers",
				label: "Suppliers",
				icon: <Users size={20} />,
			},
			{
				id: "supply-requests",
				label: "Supply Requests",
				icon: <ClipboardList size={20} />,
			},
			{
				id: "procurement-report",
				label: "Procurement Report",
				icon: <BarChart3 size={20} />,
			},
		];
	}

	if (checkRole("finance_manager")) {
		menuItems = [
			{
				id: "finance-dashboard",
				label: "Dashboard",
				icon: <PieChartIcon size={20} />,
			},
			{
				id: "expenses",
				label: "Expenses",
				icon: <CreditCardIcon size={20} />,
			},
			{
				id: "budget",
				label: "Budget Allocation",
				icon: <PieChartIcon size={20} />,
			},
			{
				id: "employee-payments",
				label: "Employee Payments",
				icon: <UserIcon size={20} />,
			},
		];
	}

	if (supplier) {
		menuItems = [
			{
				id: "supplier/supply-requests",
				label: "Supply Requests",
				icon: <ShoppingCartIcon size={20} />,
			},
			{
				id: "supplier/bids",
				label: "My Bids",
				icon: <ClipboardCheckIcon size={20} />,
			},
			{
				id: "supplier/profile",
				label: "Profile",
				icon: <UserIcon size={20} />,
			},
		];
	}
	bottomMenuItems = [
		{
			id: "logout",
			label: "Logout",
			icon: <LogOut size={20} />,
		},
	];

	return (
		<div className="w-64 bg-gray-900 text-white flex flex-col h-full hidden md:block">
			<div className="p-4 flex items-center gap-3">
				<Flame className="h-8 w-8 text-fire" />
				<span className="text-xl font-bold">FireDept MS</span>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold">
					Main
				</div>
				<nav className="mt-2">
					{menuItems.map((item) => (
						<Link
							key={item.id}
							to={`/${item.id}`}
							className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
								location.pathname.startsWith(`/${item.id}`)
									? "bg-fire-dark text-white"
									: "text-gray-300 hover:bg-gray-800"
							}`}
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					))}
				</nav>
			</div>
			<div className="border-t border-gray-700 py-2 mt-[100%]">
				{bottomMenuItems.map((item) => (
					<button
						key={item.id}
						className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
						onClick={
							item.id === "logout" && !isSupplier
								? logoutHandler
								: isSupplier
								? supplierLogoutHandler
								: null
						}
					>
						{item.icon}
						<span>{item.label}</span>
					</button>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
