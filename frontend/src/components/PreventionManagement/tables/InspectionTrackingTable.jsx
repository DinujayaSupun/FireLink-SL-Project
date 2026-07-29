import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

const InspectionTrackingTable = ({ 
  applications = [], 
  loading = false, 
  onMarkAsInspected = () => {}, 
  onDeleteApplication = () => {},
  onViewDetails = () => {} 
}) => {

  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedAppForInspection, setSelectedAppForInspection] = useState(null);
  const [finalInspectionNotes, setFinalInspectionNotes] = useState('');
  
  // Internal search state management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Load Google Material Icons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        // Ignore if already removed
      }
    };
  }, []);

  // Filter payment assigned applications
  const paymentAssignedApplications = useMemo(() => {
    if (!applications || !Array.isArray(applications)) {
      return [];
    }
    return applications.filter(app => app.status === 'Payment Assigned' && app.payment);
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return paymentAssignedApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.contactNumber?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.serviceType?.toLowerCase().includes(searchLower) ||
        app.inspectionNotes?.toLowerCase().includes(searchLower)
      );
    });
  }, [paymentAssignedApplications, searchTerm]);



  // Handle mark as inspected
  const handleMarkAsInspected = async (id, notes) => {
    const finalNotes = notes || prompt('Enter final inspection notes (optional):') || '';
    await onMarkAsInspected(id, finalNotes);
  };

  // Open inspection completion modal
  const openInspectionModal = (app) => {
    setSelectedAppForInspection(app);
    setFinalInspectionNotes('');
    setShowInspectionModal(true);
  };

  // Handle inspection completion from modal
  const handleMarkAsInspectedFromModal = async () => {
    if (!finalInspectionNotes.trim()) {
      toast.error('Inspection notes are required before marking as inspected');
      return;
    }

    await onMarkAsInspected(selectedAppForInspection._id, finalInspectionNotes);
    setShowInspectionModal(false);
    setSelectedAppForInspection(null);
    setFinalInspectionNotes('');
    toast.success('Application marked as inspected successfully');
  };

  // Get days since payment assigned
  const getDaysSincePayment = (approvedAt) => {
    if (!approvedAt) return 'N/A';
    const days = Math.floor((new Date() - new Date(approvedAt)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get priority color based on urgency and days
  const getPriorityColor = (urgencyLevel, daysSincePayment) => {
    if (urgencyLevel === 'Critical' || daysSincePayment > 14) return 'var(--color-fire)';
    if (urgencyLevel === 'High' || daysSincePayment > 7) return 'var(--color-amber-dark)';
    return 'var(--color-success-dark)';
  };

  // Table styles
  const tableContainerStyle = {
  backgroundColor: 'var(--color-gray-300)',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  marginBottom: '20px',
  width: '100%',
  maxWidth: '1800px',
  marginLeft: 'auto',
  marginRight: 'auto',
  };

  const tableTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-gray-800)',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--color-gray-200)',
    margin: 0,
  };

  const searchContainerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid var(--color-gray-200)',
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
    border: '1px solid var(--color-gray-300)',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: 'var(--color-gray-50)',
    borderBottom: '1px solid var(--color-gray-200)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-gray-700)',
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-gray-100)',
    fontSize: '14px',
    color: 'var(--color-gray-700)',
    verticalAlign: 'middle',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'var(--color-gray-100)',
    color: '#3730a3',
  };

  const buttonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '4px',
  };

  const iconButtonStyle = {
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
  };

  const notesInputStyle = {
    width: '100%',
    minHeight: '60px',
    padding: '8px',
    border: '1px solid var(--color-gray-300)',
    borderRadius: '4px',
    fontSize: '13px',
    resize: 'vertical',
  };

  const notesDisplayStyle = {
    backgroundColor: 'var(--color-gray-50)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: '4px',
    padding: '8px',
    fontSize: '13px',
    maxWidth: '200px',
    maxHeight: '80px',
    overflow: 'auto',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Inspection Tracking - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Inspection Tracking - Payment Assigned Applications ({filteredApplications.length})
      </h3>
      
      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search applications for inspection..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>
                Full Name
              </th>
              <th style={thStyle}>
                Contact Number
              </th>
              <th style={thStyle}>
                Service Type
              </th>
              <th style={thStyle}>
                Payment
              </th>
              <th style={thStyle}>
                Priority
              </th>
              <th style={thStyle}>Days Since Payment</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, minWidth: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-gray-500)', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No applications ready for inspection found.'}
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => {
                const daysSincePayment = getDaysSincePayment(app.approvedAt);
                const priorityColor = getPriorityColor(app.urgencyLevel, daysSincePayment);
                
                return (
                  <tr key={app._id}>
                    <td style={tdStyle}>{app.fullName}</td>
                    <td style={tdStyle}>{app.contactNumber || 'N/A'}</td>
                    <td style={tdStyle}>{app.serviceType || 'Fire Prevention Certificate'}</td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--color-success-dark)', fontWeight: '500' }}>
                        Rs. {app.payment}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: priorityColor, fontWeight: '500' }}>
                        {app.urgencyLevel || 'Normal'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ color: priorityColor, fontWeight: '500' }}>
                        {daysSincePayment} days
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <span style={statusBadgeStyle}>Pending</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        flexWrap: 'nowrap'
                      }}>
                        {/* View Icon Button */}
                        <button
                          onClick={() => onViewDetails && onViewDetails(app)}
                          style={{ ...iconButtonStyle, backgroundColor: 'var(--color-info)', color: 'white' }}
                          title="View Details"
                        >
                          <span className="material-icons" style={{ fontSize: '16px' }}>visibility</span>
                        </button>
                        

                        {/* Delete Icon Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${app.fullName}'s application? This will permanently remove it from the database.`)) {
                              onDeleteApplication(app._id);
                            }
                          }}
                          style={{ ...iconButtonStyle, backgroundColor: 'var(--color-fire)', color: 'white' }}
                          title="Delete"
                        >
                          <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                        
                        {/* Mark Inspected Button */}
                        <button
                          onClick={() => openInspectionModal(app)}
                          style={{ 
                            ...buttonStyle, 
                            backgroundColor: 'var(--color-success)', 
                            color: 'white',
                            marginRight: '0',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Mark Inspected
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Priority Legend */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: 'var(--color-gray-50)', 
        borderTop: '1px solid var(--color-gray-200)',
        fontSize: '13px',
        color: 'var(--color-gray-500)'
      }}>
        <strong>Priority Legend:</strong> 
        <span style={{ color: 'var(--color-fire)', marginLeft: '8px' }}>● Critical/Overdue (14+ days)</span>
        <span style={{ color: 'var(--color-amber-dark)', marginLeft: '12px' }}>● High Priority/Due Soon (7+ days)</span>
        <span style={{ color: 'var(--color-success-dark)', marginLeft: '12px' }}>● Normal Priority</span>
      </div>



      {/* Inspection Completion Modal */}
      {showInspectionModal && selectedAppForInspection && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--color-gray-900)',
                fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
              }}
            >
              Complete Inspection - {selectedAppForInspection.applicantName}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--color-gray-500)', 
                marginBottom: '12px',
                fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
              }}>
                Application ID: {selectedAppForInspection.applicationId}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--color-gray-700)', 
                marginBottom: '16px',
                fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
              }}>
                Please provide final inspection notes before marking this application as inspected. This field is mandatory.
              </p>
            </div>

            <textarea
              value={finalInspectionNotes}
              onChange={(e) => setFinalInspectionNotes(e.target.value)}
              placeholder="Enter final inspection notes... (Required)"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid var(--color-gray-300)',
                fontSize: '14px',
                fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
                resize: 'vertical',
                minHeight: '100px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-success)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => {
                  setShowInspectionModal(false);
                  setSelectedAppForInspection(null);
                  setFinalInspectionNotes('');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-gray-300)',
                  backgroundColor: 'white',
                  color: 'var(--color-gray-700)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsInspectedFromModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: finalInspectionNotes.trim() ? 'var(--color-success)' : 'var(--color-gray-400)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: finalInspectionNotes.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
                }}
                disabled={!finalInspectionNotes.trim()}
              >
                Mark as Inspected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionTrackingTable;