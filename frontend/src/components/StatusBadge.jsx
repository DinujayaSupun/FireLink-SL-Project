import React from "react";

const StatusBadge = ({ status }) => {
	const getStatusStyles = () => {
		switch (status) {
			case "Open":
				return "bg-success-100 text-success-dark";
			case "pending":
				return "bg-amber-100 text-amber-dark";
			case "approved":
				return "bg-success-100 text-success-dark";
			case "Closed":
				return "bg-fire-100 text-fire-dark";
			case "under-review":
				return "bg-info-100 text-info-dark";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};
	const getStatusLabel = () => {
		return status
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};
	return (
		<span
			className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
		>
			{getStatusLabel()}
		</span>
	);
};

export default StatusBadge;
