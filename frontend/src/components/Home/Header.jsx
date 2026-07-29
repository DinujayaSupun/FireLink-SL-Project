import React, { useState } from "react";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const menuItems = [
		{ name: "HOME", href: "#home", active: true },
		{ name: "CMC", href: "#cmc" },
		{ name: "DEPARTMENTS", href: "#departments" },
		{ name: "EVENTS", href: "#events" },
		{ name: "GALLERY", href: "#gallery" },
		{ name: "LOCATIONS", href: "/locations" },
		{ name: "CONTACT", href: "#contact" },
		{ name: "LOGIN", href: "/staff-login", isButton: true },
	];

	return (
		<header
			className="absolute left-0 w-full z-50 bg-transparent"
			style={{ top: "16px", position: "absolute" }}
		>
			<div className="container mx-auto px-4">
				<div
					className="flex items-center justify-between h-20"
					style={{ marginTop: "0px" }}
				>
					{/* Logo */}
					<div className="flex items-center">
						<div className="w-24 h-24 flex items-center justify-center">
							<img
								src="/images/FireDepartment_Logo.png"
								alt="Fire Department Logo"
								className="w-full h-full object-contain"
							/>
						</div>
					</div>

					{/* Desktop Navigation */}
					<nav
						className="hidden lg:flex items-center space-x-8"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						{menuItems.map((item, index) => (
							<a
								key={index}
								href={item.href}
								className={`text-sm font-semibold tracking-wider transition-colors duration-300 hover:text-fire-300 ${
									item.active ? "text-fire-300" : "text-white"
								} ${
									item.isButton
										? "bg-fire hover:bg-fire-dark px-4 py-2 rounded-lg hover:text-white"
										: ""
								}`}
							>
								{item.name}
							</a>
						))}
					</nav>

					{/* Mobile menu button */}
					<button
						className="lg:hidden text-white hover:text-fire-300 transition-colors"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
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

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div
						className="lg:hidden"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						<div className="px-2 pt-2 pb-3 space-y-1 bg-black bg-opacity-90 rounded-lg mt-2">
							{menuItems.map((item, index) => (
								<a
									key={index}
									href={item.href}
									className={`block px-3 py-2 text-sm font-semibold tracking-wider transition-colors duration-300 rounded-md hover:text-fire-300 hover:bg-gray-800 ${
										item.active ? "text-fire-300 bg-gray-800" : "text-white"
									} ${
										item.isButton
											? "bg-fire hover:bg-fire-dark text-center hover:text-white"
											: ""
									}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.name}
								</a>
							))}
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
