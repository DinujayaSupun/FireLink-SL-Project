import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import Sidebar from "../UserManagement/Sidebar"; // ✅ add sidebar

const StaffManagementTable = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const componentRef = useRef();
  const printRef = useRef();
  const [showReportModal, setShowReportModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); // logged-in user
  const token = localStorage.getItem("token");

  // Fetch staff data
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter out 1st class officers
        const filtered = response.data.users.filter(
          (user) => user.position.toLowerCase() !== "1stclass officer"
        );

        setStaff(filtered);
        setFilteredStaff(filtered);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch staff data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchStaffData();
  }, [token]);

  // Filter staff by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter((member) =>
        member.staffId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  // Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedStaff = staff.filter((member) => member._id !== id);
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
      alert("Staff member deleted successfully");
    } catch (err) {
      console.error(
        "Error deleting staff member:",
        err.response ? err.response.data : err.message
      );
      alert("Failed to delete staff member");
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredStaff(staff);
  };

  // Print table
  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const newWindow = window.open("", "_blank", "width=900,height=650");
    newWindow.document.write(`
      <html>
        <head>
          <title>Staff Management Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/staff-login");
  };

  if (loading) return <div className="text-center py-8 text-blue-600">Loading staff data...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 py-8 px-4 max-w-6xl mx-auto">
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <style>{`@media print { .no-print { display: none !important; } }`}</style>

          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>

              <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by Staff ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              {searchTerm && (
                <button onClick={handleClearSearch} className="px-3 py-2 bg-gray-300 rounded-md text-sm">
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition text-sm"
              >
                Generate Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" ref={componentRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Edit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Delete</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.staffId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : member.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {member.status || "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                      <Link to={`/userdetails/${member._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="px-3 py-1 bg-red-700 text-white rounded-md shadow hover:bg-red-800 transition flex items-center text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-8 text-gray-500">No staff members found</div>
          )}
          
          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:relative print:inset-auto print:flex-none print:items-start print:justify-start">
              <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto print:w-full print:max-w-none print:max-h-none print:overflow-visible print:rounded-none print:p-4">
                <div className="flex justify-between items-center mb-4 print:hidden">
                  <h2 className="text-xl font-bold text-gray-800">Staff Management Report</h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Report Header */}
                <div className="border border-red-600 p-2 print:p-1 mb-1 print:mb-0">
                  <div className="flex items-center justify-between mb-1 print:mb-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 print:w-8 print:h-8 mr-2 flex-shrink-0">
                        <img src="/firelink-logo.png" alt="FireLink-SL Logo" className="w-full h-full object-contain rounded print:rounded-none" />
                      </div>
                      <div className="text-left">
                        <h1 className="text-lg font-bold text-red-600 print:text-base">FIRELINK-SL</h1>
                        <p className="text-xs font-semibold print:text-[10px] text-gray-700">Fire and Rescue Service</p>
                        <p className="text-[10px] print:text-[8px] text-gray-600 mt-0.5 leading-tight">
                          Main Fire Station (Head Quarters)<br />
                          T.B. Jaya Mawatha, Colombo 10<br />
                          Sri Lanka
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className="text-base font-bold text-gray-800 print:text-sm">STAFF MANAGEMENT REPORT</h2>
                      <p className="text-[10px] text-gray-600 print:text-[8px]">
                        {new Date().toLocaleDateString()} | Total: {staff.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="border border-gray-300 p-2 print:p-1 mb-1 print:mb-0">
                  <div className="grid grid-cols-4 gap-2 print:gap-1 text-center text-xs print:text-[10px]">
                    <div>
                      <p className="font-semibold text-gray-700 print:text-[8px]">Total Staff</p>
                      <p className="text-sm print:text-[10px] font-bold">{staff.length}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 print:text-[8px]">Active</p>
                      <p className="text-sm print:text-[10px] font-bold text-green-600">{staff.filter(s => s.status === 'Active').length}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 print:text-[8px]">Inactive</p>
                      <p className="text-sm print:text-[10px] font-bold text-red-600">{staff.filter(s => s.status === 'Inactive').length}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 print:text-[8px]">Positions</p>
                      <p className="text-sm print:text-[10px] font-bold text-gray-600">{[...new Set(staff.map(s => s.position))].length}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Staff Table */}
                <div className="border border-gray-300 mt-0 print:mt-0" ref={printRef}>
                  <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-red-600 print:bg-white print:border-b print:border-red-600 print:text-sm">DETAILED STAFF LIST</h3>
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-sm print:text-xs">
                      <thead className="bg-red-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left">No.</th>
                          <th className="px-3 py-2 text-left">Staff ID</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Position</th>
                          <th className="px-3 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaff.map((member, index) => (
                          <tr key={member._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-3 py-2 border-b">{index + 1}</td>
                            <td className="px-3 py-2 border-b">{member.staffId}</td>
                            <td className="px-3 py-2 border-b">{member.name}</td>
                            <td className="px-3 py-2 border-b">{member.position}</td>
                            <td className="px-3 py-2 border-b text-center">{member.status || 'Active'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-red-600 mt-6 pt-4 print:mt-4 print:pt-2">
                  <div className="grid grid-cols-3 gap-4 text-sm print:text-xs">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 print:mb-1">SYSTEM INFORMATION</h4>
                      <p><strong>Generated By:</strong> FireLink-SL TMS</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 print:mb-1">CONTACT INFORMATION</h4>
                      <p><strong>Emergency Hotline:</strong> 110</p>
                      <p><strong>Admin Office:</strong> +94-11-55544466</p>
                      <p><strong>Email:</strong> training@firelink.lk</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 print:mb-1">DOCUMENT CONTROL</h4>
                      <p><strong>Valid Until:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      <p><strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 print:bg-gray-100 p-3 print:p-2 rounded print:rounded-none mt-4 print:mt-2 border border-red-200 print:border-gray-300">
                    <p className="text-xs print:text-[10px] text-gray-700 text-center">
                      <strong>CONFIDENTIAL DOCUMENT</strong> - This staff report contains sensitive operational data of the Fire and Rescue Service of Sri Lanka. Distribution is restricted to authorized personnel only.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-6 print:mt-4 text-sm print:text-xs">
                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                        <p><strong>Training Manager</strong></p>
                        <p className="text-gray-600">Fire and Rescue Service</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                        <p><strong>Department Head</strong></p>
                        <p className="text-gray-600">Emergency Services Division</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '', 'width=800,height=600');
                      let reportContent = document.querySelector('.fixed.inset-0 .bg-white').innerHTML;
                      reportContent = reportContent.replace(/<div class="flex justify-between items-center mb-4 print:hidden">.*?<\/div>/s, '');
                      reportContent = reportContent.replace(/<div class="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">.*?<\/div>/s, '');
                      const currentDate = new Date().toISOString().split('T')[0];
                      const customFilename = `FireLink-SL_Staff_Report_${currentDate}`;

                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${customFilename}</title>
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            @page { size: A4; margin: 15mm; }
                            body { font-size: 12px; line-height: 1.3; color: black !important; background: white !important; margin: 0; padding: 20px; }
                            * { color: black !important; background: white !important; border-color: black !important; }
                            table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid black !important; background: white !important; color: black !important; padding: 8px; }
                            th { background: #f5f5f5 !important; font-weight: bold; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            .print\\:hidden { display: none !important; }
                          </style>
                        </head>
                        <body>
                          ${reportContent}
                        </body>
                        </html>
                      `);

                      printWindow.document.close();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 500);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '', 'width=800,height=600');
                      let reportContent = document.querySelector('.fixed.inset-0 .bg-white').innerHTML;
                      reportContent = reportContent.replace(/<div class="flex justify-between items-center mb-4 print:hidden">.*?<\/div>/s, '');
                      reportContent = reportContent.replace(/<div class="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">.*?<\/div>/s, '');
                      const currentDatePDF = new Date().toISOString().split('T')[0];
                      const customFilenamePDF = `FireLink-SL_Staff_Report_${currentDatePDF}`;

                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${customFilenamePDF}</title>
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            @page { size: A4; margin: 15mm; }
                            body { font-size: 12px; line-height: 1.3; color: black !important; background: white !important; }
                            * { color: black !important; background: white !important; border-color: black !important; }
                            table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid black !important; background: white !important; color: black !important; padding: 8px; }
                            th { background: #f5f5f5 !important; font-weight: bold; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            .print\\:hidden { display: none !important; }
                          </style>
                        </head>
                        <body class="bg-white p-4">
                          ${reportContent}
                        </body>
                        </html>
                      `);

                      printWindow.document.close();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 500);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagementTable;
