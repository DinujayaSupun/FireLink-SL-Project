import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard, User as UserIcon, Settings, Users, UserPlus, CalendarClock,
	Boxes, Truck, ClipboardList, FileText, PieChart, CreditCard, Wallet,
	ShoppingCart, BarChart3, ClipboardCheck, ShieldCheck, GraduationCap,
	LogOut, Flame,
} from "lucide-react";
import { useAuth } from "../context/auth";
import { useSupplierAuth } from "../context/supplierAuth";

/**
 * The one sidebar, used by every role.
 *
 * Both legacy sidebars (components/SideBar.jsx and pages/UserManagement/Sidebar.jsx)
 * now delegate here, so the whole app shares this shell without touching page imports.
 *
 * Position matching is normalised (lowercase, non-alphanumerics stripped), which
 * fixes a latent bug where the old switch keyed on "financemanager" and never
 * matched the stored "finance_manager".
 */

const normalize = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const BASE = [
	{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
	{ name: "Profile", path: "/profile", icon: UserIcon },
	{ name: "Settings", path: "/settings", icon: Settings },
];

const ROLE_LINKS = {
	chiefofficer: [
		...BASE,
		{ name: "Staff Management", path: "/staff-management", icon: Users },
		{ name: "Add Staff", path: "/firstaff", icon: UserPlus },
		{ name: "Shift Schedule", path: "/shiftschedule", icon: CalendarClock },
		{ name: "Inventory", path: "/inventory", icon: Boxes },
		{ name: "Mission Records", path: "/mission-records", icon: ClipboardList },
		{ name: "Inspected Documents", path: "/inspected-documents", icon: FileText },
	],
	"1stclassofficer": [
		...BASE,
		{ name: "Staff Management", path: "/staff-management", icon: Users },
		{ name: "Add Staff", path: "/firstaff", icon: UserPlus },
		{ name: "Shift Schedule", path: "/shiftschedule", icon: CalendarClock },
	],
	financemanager: [
		{ name: "Dashboard", path: "/finance-dashboard", icon: PieChart },
		{ name: "Expenses", path: "/expenses", icon: CreditCard },
		{ name: "Budget Allocation", path: "/budget", icon: Wallet },
		{ name: "Employee Payments", path: "/employee-payments", icon: UserIcon },
	],
	supplymanager: [
		{ name: "Dashboard", path: "/supply-dashboard", icon: LayoutDashboard },
		{ name: "Suppliers", path: "/suppliers", icon: Users },
		{ name: "Supply Requests", path: "/supply-requests", icon: ClipboardList },
		{ name: "Procurement Report", path: "/procurement-report", icon: BarChart3 },
	],
	inventorymanager: [
		...BASE,
		{ name: "Inventory", path: "/inventory", icon: Boxes },
		{ name: "Vehicles", path: "/inventory/vehicles", icon: Truck },
		{ name: "Reorders", path: "/inventory/reorders", icon: ClipboardList },
		{ name: "Logs", path: "/inventory/logs", icon: FileText },
	],
	recordmanager: [
		...BASE,
		{ name: "Mission Records", path: "/mission-records", icon: ClipboardList },
	],
	preventionmanager: [
		...BASE,
		{ name: "Inspected Documents", path: "/inspected-documents", icon: FileText },
		{ name: "Apply Permit", path: "/apply-permit", icon: ShieldCheck },
	],
	trainingsessionmanager: [
		...BASE,
		{ name: "Sessions", path: "/sessions", icon: ClipboardList },
		{ name: "Training", path: "/training-dashboard", icon: GraduationCap },
	],
	teamcaptain: [
		...BASE,
		{ name: "Sessions", path: "/sessions", icon: ClipboardList },
	],
	fighter: [
		...BASE,
		{ name: "Mission Records", path: "/mission-records", icon: ClipboardList },
		{ name: "Sessions", path: "/sessions", icon: ClipboardList },
	],
};

const SUPPLIER_LINKS = [
	{ name: "Supply Requests", path: "/supplier/supply-requests", icon: ShoppingCart },
	{ name: "My Bids", path: "/supplier/bids", icon: ClipboardCheck },
	{ name: "Profile", path: "/supplier/profile", icon: UserIcon },
];

const readStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user"));
	} catch {
		return null;
	}
};

export default function AppSidebar({ user: userProp, onLogout }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuth() || {};
	const { user: supplier, logout: supplierLogout } = useSupplierAuth() || {};

	const user = userProp || readStoredUser();

	const isActive = (path) =>
		location.pathname === path || location.pathname.startsWith(path + "/");

	const links = supplier
		? SUPPLIER_LINKS
		: ROLE_LINKS[normalize(user?.position)] || BASE;

	const handleLogout = () => {
		if (supplier) {
			supplierLogout && supplierLogout();
			return;
		}
		if (onLogout) return onLogout();
		localStorage.removeItem("user");
		localStorage.removeItem("token");
		logout && logout();
		navigate("/staff-login");
	};

	const identity = supplier
		? { name: supplier.name || supplier.email || "Supplier", meta: "supplier" }
		: { name: user?.name || "—", meta: [user?.staffId, user?.position].filter(Boolean).join(" · ") };

	return (
		<aside className="flex flex-col h-screen w-64 shrink-0 bg-navy text-white">
			{/* Brand */}
			<div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
				<span className="grid h-8 w-8 place-items-center rounded-lg bg-fire text-white shrink-0">
					<Flame size={17} />
				</span>
				<span className="text-base font-bold tracking-tight">FireLink</span>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto px-3 py-4">
				<p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
					Main
				</p>
				<div className="flex flex-col gap-1">
					{links.map(({ name, path, icon: Icon }) => (
						<Link
							key={name + path}
							to={path}
							className={[
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive(path)
									? "bg-fire text-white font-medium"
									: "text-gray-300 hover:bg-white/10 hover:text-white",
							].join(" ")}
						>
							<Icon size={16} className="shrink-0 opacity-90" />
							<span>{name}</span>
						</Link>
					))}
				</div>
			</nav>

			{/* Identity + logout */}
			<div className="border-t border-white/10 px-3 py-3">
				<div className="px-2 pb-2">
					<p className="text-sm font-semibold text-white truncate">{identity.name}</p>
					<p className="text-[11px] text-gray-400 font-mono truncate">{identity.meta}</p>
				</div>
				<button
					onClick={handleLogout}
					className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-fire hover:text-white"
				>
					<LogOut size={16} />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
