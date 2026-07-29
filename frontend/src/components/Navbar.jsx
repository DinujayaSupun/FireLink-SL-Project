import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

const Navbar = () => {
	const { user, logout, hasRole } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const getHighestRole = () => {
		if (!user?.roles || user.roles.length === 0) return "User";

		const roleLevels = {
			admin: 10,
			cfo: 9,
			"1st_class_officer": 8,
			captain: 7,
			lieutenant: 6,
			finance_manager: 6,
			record_manager: 5,
			inventory_manager: 5,
			training_session_manager: 5,
			prevention_manager: 5,
			driver_engineer: 4,
			fighter: 3,
		};

		let highestRole = user.roles[0];
		let highestLevel = roleLevels[user.roles[0]?.name] || 1;

		user.roles.forEach((role) => {
			const level = roleLevels[role.name] || 1;
			if (level > highestLevel) {
				highestLevel = level;
				highestRole = role;
			}
		});

		return highestRole?.displayName || "User";
	};

	const isActiveLink = (path) => {
		return location.pathname === path;
	};

	return (
		<nav className="bg-fire text-white shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<Link to="/dashboard" className="text-xl font-bold hover:text-fire-200 transition-colors">
								 Fire Handling System
							</Link>
						</div>

						{/* Desktop Navigation Links */}
						<div className="hidden md:flex items-center ml-10 space-x-8">
							<Link
								to="/dashboard"
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActiveLink('/dashboard') 
										? 'bg-fire-dark text-white' 
										: 'text-fire-200 hover:text-white hover:bg-fire-dark'
								}`}
							>
								Dashboard
							</Link>
							
							<Link
								to="/profile"
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActiveLink('/profile') 
										? 'bg-fire-dark text-white' 
										: 'text-fire-200 hover:text-white hover:bg-fire-dark'
								}`}
							>
								Profile
							</Link>


                            {(hasRole('admin') || hasRole('1st_class_officer') || hasRole('record_manager')) && (
								
							<Link
								to="/mission-records"
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActiveLink('/mission-records') 
										? 'bg-fire-dark text-white' 
										: 'text-fire-200 hover:text-white hover:bg-fire-dark'
								}`}
							>
								Mission Records
							</Link>
							)}
							{(hasRole('admin') || hasRole('1st_class_officer')) && (
								<Link
									to="/user-management"
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										isActiveLink('/user-management') 
											? 'bg-fire-dark text-white' 
											: 'text-fire-200 hover:text-white hover:bg-fire-dark'
									}`}
								>
									User Management
								</Link>
							)}
							
							{/* Shift Management - Available to all authenticated users */}
							<Link
								to="/shifts"
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActiveLink('/shifts') || location.pathname.startsWith('/shifts/')
										? 'bg-fire-dark text-white' 
										: 'text-fire-200 hover:text-white hover:bg-fire-dark'
								}`}
							>
								Shift Management
							</Link>
						</div>
					</div>

					<div className="flex items-center">
						{/* User Info */}
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-sm text-right">
								<p className="font-medium">{user?.name}</p>
								<p className="text-fire-200">{getHighestRole()}</p>
							</div>

							
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="text-white hover:text-fire-200 focus:outline-none focus:text-fire-200"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-fire">
														
							
							<button
								onClick={handleLogout}
								className="w-full text-left px-3 py-2 text-fire-200 hover:text-white hover:bg-fire-dark rounded-md"
							>
								Logout
							</button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
