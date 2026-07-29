import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginFireStaff from "./pages/UserManagement/stafflogin";
import CivilianLogin from "./pages/CivilianDashboard/civilianLogin";
import SupplierLogin from "./pages/SupplyManagement/Login/supplierLogin";
import DynamicDashboard from "./pages/Dashboard/Dashboard";
import AddFireStaff from "./pages/UserManagement/AddUsers";
import OfficerProfile from "./pages/UserManagement/1stClassOfficerprofile";
import UserDetails from "./pages/UserManagement/StaffDetails";
import UpdateUser from "./pages/UserManagement/updateStaff";
import TrainingSessionManager from "./pages/TraningSessionManagement/TrainingSessionManager";
import UpdateSession from "./pages/TraningSessionManagement/UpdateSession";
import ViewSessions from "./pages/TraningSessionManagement/AllSessionsDetails";
import AttendanceForm from "./pages/TraningSessionManagement/AttendanceForm";
import ShiftScheduler from "./pages/UserManagement/ShiftScheduler";
import CivilianDashboard from "./pages/CivilianDashboard/CivilianDashboard";
import StaffManagementTable from "./pages/UserManagement/StaffManagementTable";
import Profile from "./pages/UserManagement/profile";
import Settings from "./pages/UserManagement/setting";
import MakeTrainingSession from "./pages/TraningSessionManagement/AddingtarinningSession";
import TrainingSessionDashboard from "./pages/TraningSessionManagement/TrainingSessionDashboard";
import FighterDashboard from "./pages/UserManagement/FighterDashboard";
import MissionRecords from "./pages/MissionRecords/MissionRecords";
import SalaryManagement from "./pages/MissionRecords/SalaryManagement";
import InventoryList from "./pages/Inventory/InventoryList";
import InventoryForm from "./pages/Inventory/InventoryForm";
import InventoryDetail from "./pages/Inventory/InventoryDetail";
import VehicleList from "./pages/Inventory/VehicleList";
import VehicleForm from "./pages/Inventory/VehicleForm";
import VehicleDetail from "./pages/Inventory/VehicleDetail";
import VehicleItemsPage from "./pages/Inventory/VehicleItemsPage";
import ReorderPage from "./pages/Inventory/ReorderPage";
import ReordersList from "./pages/Inventory/ReordersList";
import InventoryLogs from "./pages/Inventory/InventoryLogs";
import InventoryManagerProfile from "./pages/Inventory/InventoryManagerProfile";

import SupplierManagement from "./pages/SupplyManagement/SupplierManagement";
import SupplyRequests from "./pages/SupplyManagement/SupplyRequests";
import SupplyRequestForSupplier from "./pages/SupplyManagement/SupplyRequestForSupplier";
import Bids from "./pages/SupplyManagement/Bids";
import SupplierProfile from "./pages/SupplyManagement/SupplierProfile";
import PreventionCertificateForm from "./pages/PreventionManagement/PreventionCertificateForm";
import PreventionOfficerDashboard from "./pages/PreventionManagement/PreventionOfficerDashboardNew";
import InspectedDocuments from "./pages/PreventionManagement/InspectedDocuments";
import Home from "./pages/Home/Home";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedSupplierRoute from "./components/ProtectedSupplierRoute";
import { Bounce, ToastContainer } from "react-toastify";
import SupplyDashboard from "./pages/SupplyManagement/DashBoard";
import { ProcurementReport } from "./pages/SupplyManagement/ProcurementReport";
import Expenses from "./pages/FinanceManagement/Expenses";
import FinancialDashboard from "./pages/FinanceManagement/FinanceDashboard";
import BudgetAllocation from "./pages/FinanceManagement/BudgetAllocation";
import EmployeePayments from "./pages/FinanceManagement/EmployeePayments";
import { LocationsPage } from "./pages/Home/Location";

// Guarded: a malformed "user" entry in localStorage would otherwise throw here
// and take down the whole app with a blank screen.
const readStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user"));
	} catch {
		return null;
	}
};

const App = () => {
	const user = readStoredUser();

	return (
		<BrowserRouter>
			<Routes>
				{/* Public routes */}
				<Route path="/" element={<Home />} />
				<Route path="/home" element={<Home />} />
				<Route path="/locations" element={<LocationsPage />} />
				<Route path="/staff-login" element={<LoginFireStaff />} />
				<Route path="/civilian-login" element={<CivilianLogin />} />
				<Route path="/supplier-login" element={<SupplierLogin />} />
				<Route path="/firstaff" element={<AddFireStaff />} />
				<Route path="/officer/:id" element={<OfficerProfile />} />
				<Route path="/update-user/:id" element={<UpdateUser />} />
				<Route path="/userdetails/:id" element={<UserDetails />} />
				<Route path="/attendance/:token" element={<AttendanceForm />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/settings" element={<Settings />} />
				<Route
					path="/session-dashboard"
					element={<TrainingSessionDashboard />}
				/>

				<Route path="/fighter-dashboard" element={<FighterDashboard />} />

				<Route
					path="/civilian-dashboard"
					element={
						localStorage.getItem("accessToken") ||
						localStorage.getItem("civilianLoggedIn") ? (
							<CivilianDashboard />
						) : (
							<Navigate to="/civilian-login" replace />
						)
					}
				/>
         <Route path="/apply-permit" element={<PreventionCertificateForm />} />
				<Route path="/prevention-officer-dashboard" element={<PreventionOfficerDashboard />} />
				<Route
					path="/prevention-certificate-form"
					element={<PreventionCertificateForm />}
				/>
				<Route path="/inspected-documents" element={<InspectedDocuments />} />

				<Route
					path="/training-dashboard"
					element={<TrainingSessionManager />}
				/>
				<Route path="/update-session/:id" element={<UpdateSession />} />
				<Route path="/shiftschedule" element={<ShiftScheduler />} />
				<Route path="/sessions" element={<ViewSessions />} />
				<Route path="/salary-management" element={<SalaryManagement />} />

				{/* Protected user routes */}
				<Route path="/dashboard" element={<DynamicDashboard />} />
				<Route
					path="/mission-records"
					element={
						<ProtectedRoute>
							<MissionRecords />
						</ProtectedRoute>
					}
				/>

				{/* Inventory routes */}
				<Route path="/inventory" element={<InventoryList />} />
				<Route path="/inventory/add" element={<InventoryForm />} />
				<Route path="/inventory/vehicles" element={<VehicleList />} />
				<Route path="/inventory/vehicles/add" element={<VehicleForm />} />
				<Route path="/inventory/vehicles/edit/:id" element={<VehicleForm />} />
				<Route path="/inventory/vehicles/:id" element={<VehicleDetail />} />
				<Route path="/inventory/edit/:id" element={<InventoryForm />} />
				<Route path="/inventory/vehicle-items" element={<VehicleItemsPage />} />
				<Route path="/inventory/:id/reorder" element={<ReorderPage />} />
				<Route path="/inventory/reorders" element={<ReordersList />} />
				<Route path="/inventory/reorders/list" element={<ReordersList />} />
				<Route path="/inventory/logs" element={<InventoryLogs />} />
				<Route
					path="/inventory-manager/profile"
					element={<InventoryManagerProfile />}
				/>
				<Route path="/inventory/:id" element={<InventoryDetail />} />

				<Route path="/staff-management" element={<StaffManagementTable />} />

				{/* Finance routes */}
				<Route
					path="/expenses"
					element={
						<ProtectedRoute allowedRoles={["finance_manager"]}>
							<Expenses />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/employee-payments"
					element={
						<ProtectedRoute allowedRoles={["finance_manager"]}>
							<EmployeePayments />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/finance-dashboard"
					element={
						<ProtectedRoute allowedRoles={["finance_manager"]}>
							<FinancialDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/budget"
					element={
						<ProtectedRoute allowedRoles={["finance_manager"]}>
							<BudgetAllocation />
						</ProtectedRoute>
					}
				/>

				{/* Supplier routes  */}
				<Route
					path="/supply-dashboard"
					element={
						<ProtectedRoute allowedRoles={["supply_manager"]}>
							<SupplyDashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/procurement-report"
					element={
						<ProtectedRoute allowedRoles={["supply_manager"]}>
							<ProcurementReport />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/suppliers"
					element={
						<ProtectedRoute allowedRoles={["supply_manager"]}>
							<SupplierManagement />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/supply-requests"
					element={
						<ProtectedRoute allowedRoles={["supply_manager"]}>
							<SupplyRequests />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/supplier/supply-requests"
					element={
						<ProtectedSupplierRoute>
							<SupplyRequestForSupplier />
						</ProtectedSupplierRoute>
					}
				/>
				<Route
					path="/supplier/bids"
					element={
						<ProtectedSupplierRoute>
							<Bids />
						</ProtectedSupplierRoute>
					}
				/>
				<Route
					path="/supplier/bids/new/:requestId?"
					element={
						<ProtectedSupplierRoute>
							<Bids />
						</ProtectedSupplierRoute>
					}
				/>
				<Route
					path="/supplier/profile"
					element={
						<ProtectedSupplierRoute>
							<SupplierProfile />
						</ProtectedSupplierRoute>
					}
				/>

				{/* Catch all route */}
				<Route
					path="*"
					element={
						user ? (
							<Navigate to="/dashboard" replace />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>
			</Routes>
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
				transition={Bounce}
			/>
		</BrowserRouter>
	);
};

export default App;
