import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const OfficerProfile = ({ officerId }) => {
  const { id: paramId } = useParams();
  const id = officerId || paramId;

  const [officer, setOfficer] = useState(null);
  const [shiftRequests, setShiftRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Officer Data
  useEffect(() => {
    if (!id) {
      setError("No officer ID provided");
      setLoading(false);
      return;
    }

    const fetchOfficerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers,
          withCredentials: true,
        });
        setOfficer(response.data.user);
        setLoading(false);
      } catch (err) {
        console.error("Officer fetch error:", err.response || err);
        setError(err.response?.data?.message || "Failed to fetch officer data");
        setLoading(false);
      }
    };

    fetchOfficerData();
  }, [id]);


const [loadingRequests, setLoadingRequests] = useState(true);
useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/shiftChange`);
      setShiftRequests(res.data.requests || []);
      setLoadingRequests(false);
    } catch (err) {
      console.error("Error fetching shift change requests:", err);
      setLoadingRequests(false);
    }
  };
  fetchRequests();
}, []);


// State for ready vehicles
const [readyVehicles, setReadyVehicles] = useState([]);
const [vehiclesLoading, setVehiclesLoading] = useState(true);

useEffect(() => {
  const fetchReadyVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/shifts/ready`); // create this endpoint
      setReadyVehicles(res.data.shifts || []);
      setVehiclesLoading(false);
    } catch (err) {
      console.error("Error fetching ready vehicles:", err);
      setVehiclesLoading(false);
    }
  };
  fetchReadyVehicles();
}, []);

  // Fetch Shift Change Requests


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-blue-400">Loading officer data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-red-400">Officer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e2a38] py-8 px-4">
      {/* Officer Profile Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative">
          <div className="absolute top-4 right-4">
            <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
              {officer.status || "Active"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              {/* Profile Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17
                     20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7
                     20H2v-2a3 3 0 015.356-1.857M7
                     20v-2c0-.656.126-1.283.356-1.857m0
                     0a5.002 5.002 0 019.288
                     0M15 7a3 3 0 11-6 0 3 3
                     0 016 0zm6 3a2 2 0 11-4 0
                     2 2 0 014 0zM7 10a2 2 0
                     11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">First Class Officer Profile</h1>
              <p className="mt-1 text-red-100">Fire Department Staff Details</p>
            </div>
          </div>
        </div>
<div className="mt-8 flex flex-wrap gap-4 justify-center">
         
        </div>
        {/* Profile Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff ID */}
            <div className="col-span-2">
             
              <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700 mr-3">Staff ID:</span>
                <span className="text-blue-800 font-mono bg-blue-100 px-3 py-1 rounded">
                  {officer.staffId || officer._id}
                </span>
              </div>
            </div>

            {/* Personal Info */}
            <div>
             
              <p><b>Full Name:</b> {officer.name || "N/A"}</p>
              <p><b>Phone:</b> {officer.phone || "N/A"}</p>
            </div>

            {/* Professional Info */}
            <div>
             
              <p><b>Email:</b> {officer.gmail || "N/A"}</p>
              <p><b>Position:</b> {officer.position || "N/A"}</p>

            </div>

            {/* Address */}
              
          </div>
          <div className="flex flex-wrap gap-4 justify-center">  
 
 {/*<Link to="/stafflogin" className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition">
            Back to Login
          </Link>*/}
          <Link to="/shiftschedule" className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition">
            Make Shift
          </Link>
          <Link to={`/update-user/${officer._id}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Edit Profile
          </Link>
          <Link to="/firstaff" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Add Staff Members
          </Link>

          </div>
        </div>
      </div>
<div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
 
      {/* Shift Change Requests Table */}
      {/* Shift Change Requests Table */}
      <div className="mt-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-4">
          <h2 className="text-2xl font-semibold">Shift Change Requests</h2>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading shift change requests...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Fighter Name</th>
                  <th className="px-4 py-2 border">Shift Type</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Note</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftRequests.length > 0 ? (
                  shiftRequests.map((req) => (
                    <tr key={req._id} className="text-center hover:bg-gray-50">
                      <td className="px-4 py-2 border">{req.fighterId?.name || "Unknown"}</td>
                      <td className="px-4 py-2 border">{req.shiftId?.shiftType || "N/A"}</td>
                      <td className="px-4 py-2 border">
                        {req.shiftId?.date
                          ? new Date(req.shiftId.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 border">{req.note}</td>
                      <td
                        className={`px-4 py-2 border font-semibold ${req.status === "Approved"
                            ? "text-green-600"
                            : req.status === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                      >
                        {req.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2 border text-center" colSpan="5">
                      No shift change requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

{/* Ready Vehicles Table */}
<div className="mt-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
    <h2 className="text-2xl font-semibold">Ready Vehicles & Shift Schedules</h2>
  </div>

  <div className="overflow-x-auto p-4">
    {vehiclesLoading ? (
      <div className="text-center text-gray-500">Loading ready vehicle data...</div>
    ) : readyVehicles.length > 0 ? (
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Vehicle ID</th>
            <th className="px-4 py-2 border">Vehicle Name</th>
            <th className="px-4 py-2 border">Shift Date</th>
            <th className="px-4 py-2 border">Shift Type</th>
          </tr>
        </thead>
        <tbody>
          {readyVehicles.map((vehicle) => (
            <tr key={vehicle._id} className="text-center hover:bg-gray-50">
              <td className="px-4 py-2 border">{vehicle.vehicleId || "N/A"}</td>
              <td className="px-4 py-2 border">{vehicle.vehicleName || "N/A"}</td>
              <td className="px-4 py-2 border">
                {vehicle.date ? new Date(vehicle.date).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-4 py-2 border">{vehicle.shiftType || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="text-center text-gray-500">
        No ready vehicle or shift schedule data available.
      </div>
    )}
  </div>
</div>
</div>

    </div>
  );
};

export default OfficerProfile;
