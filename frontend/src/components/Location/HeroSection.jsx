import React from "react";
export function HeroSection() {
	return (
		<div className="relative h-80 w-full overflow-hidden">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage:
						"url('https://images.unsplash.com/photo-1486427115014-e1d94e7e6bd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
				}}
			>
				<div className="absolute inset-0 bg-navy bg-opacity-75"></div>
			</div>
			<div className="relative h-full flex flex-col items-center justify-center text-white px-4">
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
					OUR LOCATIONS
				</h1>
				<p className="text-lg md:text-xl max-w-2xl text-center">
					Find your nearest fire station for emergency services and community
					support
				</p>
			</div>
		</div>
	);
}
