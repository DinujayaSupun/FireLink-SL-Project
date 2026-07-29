import React, { useState, useMemo } from 'react';

const DocumentReviewTable = ({ 
  applications, 
  onApprove, 
  onReject, 
  onDelete,
  onViewDetails,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedAppForRejection, setSelectedAppForRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter pending applications
  const pendingApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Pending');
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return pendingApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.address?.toLowerCase().includes(searchLower) ||
        app.serviceType?.toLowerCase().includes(searchLower)
      );
    });
  }, [pendingApplications, searchTerm]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplications(filteredApplications.map(app => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  // Handle individual selection
  const handleSelectApplication = (id) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  // Batch approve
  const handleBatchApprove = async () => {
    if (selectedApplications.length === 0) return;
    
    const promises = selectedApplications.map(id => onApprove(id));
    await Promise.all(promises);
    setSelectedApplications([]);
  };

  // Batch reject
  const handleBatchReject = async () => {
    if (selectedApplications.length === 0) return;
    
    const reason = prompt('Enter rejection reason for selected applications:');
    if (!reason) return;

    const promises = selectedApplications.map(id => onReject(id, reason));
    await Promise.all(promises);
    setSelectedApplications([]);
  };

  // Handle rejection from modal
  const handleRejectFromModal = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    await onReject(selectedAppForRejection._id, rejectionReason);
    setShowRejectionModal(false);
    setSelectedAppForRejection(null);
    setRejectionReason('');
  };

  // Table styles
  const tableContainerStyle = {
    backgroundColor: 'var(--color-gray-300)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
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
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const searchInputStyle = {
    flex: 1,
    minWidth: '250px',
    padding: '8px 12px',
    border: '1px solid var(--color-gray-300)',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const batchActionStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const approveButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--color-success)',
    color: 'white',
  };

  const rejectButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--color-fire)',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--color-gray-500)',
    color: 'white',
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
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-gray-100)',
    fontSize: '14px',
    color: 'var(--color-gray-700)',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#fbbf24',
    color: '#92400e',
  };

  const actionButtonStyle = {
    ...buttonStyle,
    padding: '6px 12px',
    fontSize: '12px',
    marginRight: '4px',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Document Review - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Document Review - Pending Applications ({filteredApplications.length})
      </h3>
      
      {/* Search and Batch Actions */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        
        {selectedApplications.length > 0 && (
          <div style={batchActionStyle}>
            <span style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
              {selectedApplications.length} selected
            </span>
            <button
              onClick={handleBatchApprove}
              style={approveButtonStyle}
            >
              Approve Selected
            </button>
            <button
              onClick={handleBatchReject}
              style={rejectButtonStyle}
            >
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={thStyle}>
                Full Name
              </th>
              <th style={thStyle}>
                NIC
              </th>
              <th style={thStyle}>
                Service Type
              </th>
              <th style={thStyle}>
                Construction Type
              </th>
              <th style={thStyle}>
                Urgency
              </th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-gray-500)', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No pending applications found.'}
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app._id} style={{ backgroundColor: selectedApplications.includes(app._id) ? '#f0f9ff' : 'transparent' }}>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(app._id)}
                      onChange={() => handleSelectApplication(app._id)}
                    />
                  </td>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>{app.serviceType || 'Fire Prevention Certificate'}</td>
                  <td style={tdStyle}>{app.constructionType}</td>
                  <td style={tdStyle}>
                    <span style={{
                      color: app.urgencyLevel === 'Critical' ? 'var(--color-fire)' : 
                             app.urgencyLevel === 'High' ? 'var(--color-amber-dark)' : 'var(--color-success-dark)'
                    }}>
                      {app.urgencyLevel || 'Normal'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle}>{app.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      style={{ ...actionButtonStyle, backgroundColor: 'var(--color-info)', color: 'white' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onApprove(app._id)}
                      style={{ ...actionButtonStyle, backgroundColor: 'var(--color-success)', color: 'white' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppForRejection(app);
                        setRejectionReason('');
                        setShowRejectionModal(true);
                      }}
                      style={{ ...actionButtonStyle, backgroundColor: 'var(--color-fire)', color: 'white' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${app.fullName}'s application? This will permanently remove it from the database.`)) {
                          onDelete(app._id);
                        }
                      }}
                      style={{ ...actionButtonStyle, backgroundColor: 'var(--color-gray-500)', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedAppForRejection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--color-gray-800)',
                margin: 0,
              }}>
                Reject Application - {selectedAppForRejection.fullName}
              </h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedAppForRejection(null);
                  setRejectionReason('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-gray-500)',
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'var(--color-fire-50)',
                borderRadius: '8px',
                border: '1px solid var(--color-fire-100)',
              }}>
                <div>
                  <strong>Service Type:</strong>
                  <div>{selectedAppForRejection.serviceType || 'Fire Prevention Certificate'}</div>
                </div>
                <div>
                  <strong>Construction Type:</strong>
                  <div>{selectedAppForRejection.constructionType || 'Building'}</div>
                </div>
                <div>
                  <strong>NIC:</strong>
                  <div>{selectedAppForRejection.nic}</div>
                </div>
                <div>
                  <strong>Urgency Level:</strong>
                  <div style={{ 
                    color: selectedAppForRejection.urgencyLevel === 'Critical' ? 'var(--color-fire)' : 
                           selectedAppForRejection.urgencyLevel === 'High' ? 'var(--color-amber-dark)' : 'var(--color-success-dark)'
                  }}>
                    {selectedAppForRejection.urgencyLevel || 'Normal'}
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Rejection Reason <span style={{ color: 'var(--color-fire)' }}>*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this application..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-gray-500)',
                  marginTop: '4px',
                }}>
                  This reason will be communicated to the applicant
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
            }}>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedAppForRejection(null);
                  setRejectionReason('');
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
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectFromModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--color-fire)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReviewTable;