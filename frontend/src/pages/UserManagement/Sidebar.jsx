// Thin adapter → the unified sidebar. Kept so the ~17 pages importing this path
// keep working unchanged, including the { user, onLogout } props they pass.
import React from "react";
import AppSidebar from "../../components/AppSidebar";

export default function Sidebar({ user, onLogout }) {
	return <AppSidebar user={user} onLogout={onLogout} />;
}
