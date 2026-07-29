import React from "react";
import { Navigate } from "react-router-dom";

// Mirrors authorizePositions on the backend: positions are written inconsistently
// across the app ("chief officer", "finance_manager"), so compare on a normalised
// key rather than requiring an exact string match.
const normalizePosition = (position) =>
	String(position ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

const readStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user"));
	} catch {
		return null;
	}
};

const ProtectedRoute = ({ children, allowedRoles }) => {
	const currentUser = readStoredUser();

	if (!currentUser) {
		return <Navigate to="/staff-login" replace />;
	}

	if (allowedRoles) {
		const userPosition = normalizePosition(currentUser.position);
		const hasPermission = allowedRoles.some(
			(role) => normalizePosition(role) === userPosition
		);
		if (!hasPermission) {
			return <Navigate to="/staff-login" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
