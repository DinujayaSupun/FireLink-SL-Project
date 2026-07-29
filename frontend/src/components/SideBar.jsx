// Thin adapter → the unified sidebar. Kept so the ~11 pages importing this path
// keep working unchanged. All look/logic now lives in AppSidebar.
import React from "react";
import AppSidebar from "./AppSidebar";

export default function Sidebar() {
	return <AppSidebar />;
}
