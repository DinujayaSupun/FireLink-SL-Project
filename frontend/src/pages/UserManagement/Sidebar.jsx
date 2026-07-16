import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaCogs,
  FaSignOutAlt,
  FaClipboardList,
  FaTruck,
  FaUsers,
  FaRegClipboard
} from "react-icons/fa";

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  if (!user) return null;

  // Define sidebar links based on position
  const getLinks = () => {
    const links = [
      { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
      { name: "Profile", path: "/profile", icon: <FaUser /> },
      { name: "Settings", path: "/settings", icon: <FaCogs /> },
    ];

    switch (user.position.toLowerCase()) {
      case "chief officer":
        // Full access for Chief Officer
        links.push(
          { name: "Staff Management", path: "/staff-management", icon: <FaUsers /> },
          { name: "Add Staff", path: "/firstaff", icon: <FaUsers /> },
          { name: "Shift Schedule", path: "/shiftschedule", icon: <FaClipboardList /> },
          { name: "Edit Profile", path: `/update-user/${user._id}`, icon: <FaUser /> },
          { name: "Inventory", path: "/inventory", icon: <FaTruck /> },
          { name: "Finance Reports", path: "/finance", icon: <FaClipboardList /> },
          { name: "Records", path: "/records", icon: <FaClipboardList /> },
          { name: "Inspected Documents", path: "/inspected-documents", icon: <FaRegClipboard /> }
        );
        break;

      case "1stclassofficer":
        links.push(
          { name: "Shift Schedule", path: "/shiftschedule", icon: <FaClipboardList /> },
          { name: "Add Staff", path: "/firstaff", icon: <FaUsers /> },
          { name: "Edit Profile", path: `/update-user/${user._id}`, icon: <FaUser /> },
          { name: "Staff Management", path: "/staff-management", icon: <FaUsers /> }
        );
        break;

      case "fighter":
        links.push({ name: "Mission Records", path: "/mission-records", icon: <FaClipboardList /> },
          { name: "View Sessions", path: "/sessions", icon: <FaClipboardList /> }
        );
        break;

      case "financemanager":
        links.push({ name: "Finance Reports", path: "/finance", icon: <FaClipboardList /> });
        break;

      case "inventorymanager":
        links.push(
          { name: "Inventory", path: "/inventory", icon: <FaTruck /> },
          { name: "Reorders", path: "/inventory/reorders", icon: <FaClipboardList /> },
          { name: "My Profile", path: "/inventory-manager/profile", icon: <FaUser /> }
        );
        break;

      case "recordmanager":
        links.push(
          { name: "Records", path: "/records", icon: <FaClipboardList /> },
          { name: "Mission Records", path: "/mission-records", icon: <FaClipboardList /> }
        );
        break;

      case "preventionmanager":
      case "prevention manager":
      case "prevention_manager":
        links.push(
          { name: "Inspected Documents", path: "/inspected-documents", icon: <FaRegClipboard /> }
        );
        break;

      case "trainingsessionmanager":
        links.push(
          { name: "View Sessions", path: "/sessions", icon: <FaClipboardList /> },
          { name: "Add Attendance", path: "/attendance/1", icon: <FaClipboardList /> },
          { name: "Training Sessions", path: "/training-dashboard", icon: <FaClipboardList /> },
        );
        break;

      case "supply_manager":
        links.push({ name: "Suppliers", path: "/suppliers", icon: <FaUsers /> });
        break;

      case "teamcaptain":
        links.push({ name: "Team Management", path: "/team", icon: <FaUsers /> },
          { name: "View Sessions", path: "/sessions", icon: <FaClipboardList /> }
        );
        break;

      default:
        break;
    }

    return links;
  };

  const links = getLinks();

  return (
    <div className="bg-gray-800 text-white flex flex-col justify-between h-screen w-64 p-6">
      <div>
        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-400">ID: {user.staffId}</p>
          <p className="text-sm text-gray-400">{user.position}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          const confirmLogout = window.confirm("Do you want to log out?");
          if (confirmLogout) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            onLogout ? onLogout() : navigate("/staff-login");
          }
        }}
        className="flex items-center gap-3 mt-6 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
