import React, { useRef, useState } from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import firelinkLogo from '../../assets/images/firelink-logo.png';

const SessionsTab = ({ sessions, handleDeleteSession, handlePrint }) => {
  const navigate = useNavigate();
  const printRef = useRef();
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div>
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No sessions created yet.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setShowReportModal(true)} 
              className="px-4 py-2 bg-fire text-white rounded-md shadow hover:bg-fire-dark transition text-sm"
            >
              Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={printRef}>
            {sessions.map(session => (
              <div key={session._id} className="border border-gray-700 rounded-xl p-5 hover:shadow-md transition bg-gray-800 text-white group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg text-white group-hover:text-fire transition">{session.title}</h4>
                  <span className="bg-info-dark text-white text-xs font-medium px-2 py-1 rounded">{session.teamMembers.length} participants</span>
                </div>
                <p className="text-gray-300 mb-2">{session.description}</p>
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <FiCalendar className="mr-2" />{new Date(session.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <FiClock className="mr-2" />{new Date(session.date).toLocaleTimeString()}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <FiMapPin className="mr-2" />{session.venue}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-400">Created by: {session.createdBy}</span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-info transition" onClick={() => navigate(`/update-session/${session._id}`)}><FiEdit2 /></button>
                    <button onClick={() => handleDeleteSession(session._id)} className="p-2 text-gray-400 hover:text-fire transition"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:relative print:inset-auto print:flex-none print:items-start print:justify-start">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto print:w-full print:max-w-none print:max-h-none print:overflow-visible print:rounded-none print:p-4">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h2 className="text-xl font-bold text-gray-800">Training Sessions Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Ultra Compact Report Header */}
            <div className="border border-fire p-2 print:p-1 mb-1 print:mb-0">
              <div className="flex items-center justify-between mb-1 print:mb-0">
                {/* Logo & Title Section */}
                <div className="flex items-center">
                  <div className="w-10 h-10 print:w-8 print:h-8 mr-2 flex-shrink-0">
                    <img 
                      src={firelinkLogo} 
                      alt="FireLink-SL Logo" 
                      className="w-full h-full object-contain rounded print:rounded-none"
                      onError={(e) => {
                        console.log('Logo failed to load, showing fallback');
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-fire rounded-full flex items-center justify-center text-white font-bold text-sm print:text-xs hidden">
                      FL
                    </div>
                  </div>
                  <div className="text-left">
                    <h1 className="text-lg font-bold text-fire print:text-base">FIRELINK-SL</h1>
                    <p className="text-xs font-semibold print:text-[10px] text-gray-700">Fire and Rescue Service</p>
                    <p className="text-[10px] print:text-[8px] text-gray-600 mt-0.5 leading-tight">
                      Main Fire Station (Head Quarters)<br />
                      T.B. Jaya Mawatha, Colombo 10<br />
                      Sri Lanka<br />
                      Contact: (+94) 11-1234567
                    </p>
                  </div>
                </div>
                
                {/* Report Title & Quick Stats */}
                <div className="text-right">
                  <h2 className="text-base font-bold text-gray-800 print:text-sm">TRAINING SESSIONS REPORT</h2>
                  <p className="text-[10px] text-gray-600 print:text-[8px]">
                    {new Date().toLocaleDateString()} | Sessions: {sessions.length} | Participants: {sessions.reduce((sum, s) => sum + s.teamMembers.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Summary Statistics */}
            <div className="border border-gray-300 p-2 print:p-1 mb-1 print:mb-0">
              <div className="grid grid-cols-5 gap-2 print:gap-1 text-center text-xs print:text-[10px]">
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Total Sessions</p>
                  <p className="text-sm print:text-[10px] font-bold">{sessions.length}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Total Participants</p>
                  <p className="text-sm print:text-[10px] font-bold text-info">
                    {sessions.reduce((sum, s) => sum + s.teamMembers.length, 0)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Upcoming Sessions</p>
                  <p className="text-sm print:text-[10px] font-bold text-success">
                    {sessions.filter(s => new Date(s.date) > new Date()).length}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Past Sessions</p>
                  <p className="text-sm print:text-[10px] font-bold text-gray-600">
                    {sessions.filter(s => new Date(s.date) <= new Date()).length}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Avg. Participants</p>
                  <p className="text-sm print:text-[10px] font-bold text-fire">
                    {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.teamMembers.length, 0) / sessions.length) : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Sessions Table */}
            <div className="border border-gray-300 mt-0 print:mt-0">
              <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-fire print:bg-white print:border-b print:border-fire print:text-sm">DETAILED TRAINING SESSIONS</h3>
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm print:text-xs">
                  <thead className="bg-fire text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">No.</th>
                      <th className="px-3 py-2 text-left">Session Title</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-center">Date</th>
                      <th className="px-3 py-2 text-center">Time</th>
                      <th className="px-3 py-2 text-center">Venue</th>
                      <th className="px-3 py-2 text-center">Participants</th>
                      <th className="px-3 py-2 text-left">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, index) => {
                      const sessionDate = new Date(session.date);
                      const isUpcoming = sessionDate > new Date();
                      
                      return (
                        <tr key={session._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-3 py-2 border-b">{index + 1}</td>
                          <td className="px-3 py-2 border-b">{session.title || 'N/A'}</td>
                          <td className="px-3 py-2 border-b">{session.description || 'N/A'}</td>
                          <td className="px-3 py-2 border-b text-center">{sessionDate.toLocaleDateString()}</td>
                          <td className="px-3 py-2 border-b text-center">{sessionDate.toLocaleTimeString()}</td>
                          <td className="px-3 py-2 border-b text-center">{session.venue || 'N/A'}</td>
                          <td className="px-3 py-2 border-b text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${isUpcoming ? 'bg-success-100 text-success-dark' : 'bg-gray-100 text-gray-800'}`}>
                              {session.teamMembers.length}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b">{session.createdBy || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Sessions Highlight */}
            {sessions.filter(s => new Date(s.date) > new Date()).length > 0 && (
              <div className="border border-fire-300 p-4 mt-4 bg-fire-50">
                <h3 className="text-lg font-semibold mb-3 text-fire">
                  UPCOMING TRAINING SESSIONS
                </h3>
                <div className="grid gap-2">
                  {sessions
                    .filter(s => new Date(s.date) > new Date())
                    .map(session => (
                      <div key={session._id} className="flex justify-between items-center bg-white p-2 rounded border border-fire-200">
                        <div>
                          <span className="font-semibold">{session.title}</span>
                          <span className="text-gray-600 ml-2">({session.venue})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-fire font-bold">{new Date(session.date).toLocaleDateString()}</span>
                          <span className="text-gray-500 ml-2">Participants: {session.teamMembers.length}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Report Footer */}
            <div className="border-t-2 border-fire mt-6 pt-4 print:mt-4 print:pt-2">
              <div className="grid grid-cols-3 gap-4 text-sm print:text-xs">
                <div>
                  <h4 className="font-semibold text-fire mb-2 print:mb-1">SYSTEM INFORMATION</h4>
                  <p><strong>Generated By:</strong> FireLink-SL TMS</p>
                </div>
                <div>
                  <h4 className="font-semibold text-fire mb-2 print:mb-1">CONTACT INFORMATION</h4>
                  <p><strong>Emergency Hotline:</strong> 110</p>
                  <p><strong>Admin Office:</strong> +94-11-55544466</p>
                  <p><strong>Email:</strong> training@firelink.lk</p>
                </div>
                <div>
                  <h4 className="font-semibold text-fire mb-2 print:mb-1">DOCUMENT CONTROL</h4>
                  <p><strong>Valid Until:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p><strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Official Disclaimer */}
              <div className="bg-fire-50 print:bg-gray-100 p-3 print:p-2 rounded print:rounded-none mt-4 print:mt-2 border border-fire-200 print:border-gray-300">
                <p className="text-xs print:text-[10px] text-gray-700 text-center">
                  <strong>CONFIDENTIAL DOCUMENT</strong> - This training sessions report contains sensitive operational data of the Fire and Rescue Service of Sri Lanka. 
                  Distribution is restricted to authorized personnel only. Any unauthorized disclosure, copying, or distribution is strictly prohibited. 
                  For questions regarding this report, contact the Training Management Department at training@firelink.lk
                </p>
              </div>
              
              {/* Report Signature Section */}
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
                  const customFilename = `FireLink-SL_Training_Sessions_Report_${currentDate}`;
                  
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>${customFilename}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        @page { size: A4; margin: 15mm; }
                        body { 
                          font-size: 12px; 
                          line-height: 1.3; 
                          color: black !important;
                          background: white !important;
                          margin: 0;
                          padding: 20px;
                        }
                        * {
                          color: black !important;
                          background: white !important;
                          border-color: black !important;
                        }
                        table { 
                          page-break-inside: auto; 
                          width: 100%; 
                          border-collapse: collapse;
                        }
                        th, td {
                          border: 1px solid black !important;
                          background: white !important;
                          color: black !important;
                          padding: 8px;
                        }
                        th {
                          background: #f5f5f5 !important;
                          font-weight: bold;
                        }
                        tr { 
                          page-break-inside: avoid; 
                          page-break-after: auto; 
                        }
                        .bg-fire, .bg-success-100, .bg-amber-100, .bg-fire-100,
                        .bg-gray-50, .bg-fire-50, .bg-info, .bg-success, .bg-gray-600,
                        .bg-gray-100, .bg-gray-800 {
                          background: white !important;
                          color: black !important;
                        }
                        .text-fire, .text-success, .text-amber, .text-info,
                        .text-fire-dark, .text-success-dark, .text-amber-dark, .text-gray-800 {
                          color: black !important;
                        }
                        .border-fire, .border-fire-300, .border-fire-200,
                        .border-gray-300, .border-gray-200 {
                          border-color: black !important;
                        }
                        .rounded-full, .rounded, .rounded-lg, .rounded-md {
                          border-radius: 0 !important;
                        }
                        button, input, select {
                          display: none !important;
                        }
                        .print\\:hidden {
                          display: none !important;
                        }
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
                className="px-4 py-2 bg-info text-white rounded-md hover:bg-info-dark transition-colors"
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
                  const customFilenamePDF = `FireLink-SL_Training_Sessions_Report_${currentDatePDF}`;
                  
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>${customFilenamePDF}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        @page { size: A4; margin: 15mm; }
                        body { 
                          font-size: 12px; 
                          line-height: 1.3; 
                          color: black !important;
                          background: white !important;
                        }
                        * {
                          color: black !important;
                          background: white !important;
                          border-color: black !important;
                        }
                        input, select, button, .search, .filter, .dropdown,
                        .form-control, input[type="text"], input[type="search"] {
                          display: none !important;
                        }
                        table { 
                          page-break-inside: auto; 
                          width: 100%; 
                          border-collapse: collapse;
                        }
                        th, td {
                          border: 1px solid black !important;
                          background: white !important;
                          color: black !important;
                          padding: 8px;
                        }
                        th {
                          background: #f5f5f5 !important;
                          font-weight: bold;
                        }
                        tr { 
                          page-break-inside: avoid; 
                          page-break-after: auto; 
                        }
                        .print\\:hidden { display: none !important; }
                        .print\\:text-xs { font-size: 10px; }
                        .print\\:bg-white { background-color: white !important; }
                        .print\\:border-b { border-bottom: 1px solid black; }
                        .print\\:border-fire { border-color: black; }
                        .print\\:break-inside-avoid { page-break-inside: avoid; }
                        .bg-fire, .bg-success-100, .bg-amber-100, .bg-fire-100,
                        .bg-gray-50, .bg-fire-50, .bg-info, .bg-success, .bg-gray-600,
                        .bg-gray-100, .bg-gray-800 {
                          background: white !important;
                          color: black !important;
                        }
                        .text-fire, .text-success, .text-amber, .text-info,
                        .text-fire-dark, .text-success-dark, .text-amber-dark, .text-gray-800 {
                          color: black !important;
                        }
                        .border-fire, .border-fire-300, .border-fire-200,
                        .border-gray-300, .border-gray-200 {
                          border-color: black !important;
                        }
                        .rounded-full, .rounded, .rounded-lg, .rounded-md {
                          border-radius: 0 !important;
                        }
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
                className="px-4 py-2 bg-success text-white rounded-md hover:bg-success-dark transition-colors"
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
  );
};

export default SessionsTab;
