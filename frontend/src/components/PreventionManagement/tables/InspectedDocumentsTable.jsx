import React, { useState, useMemo, useEffect } from 'react';

const InspectedDocumentsTable = ({ 
  applications = [], 
  loading = false, 
  onDeleteApplication = () => {},
  onViewDetails = () => {} 
}) => {

  // Internal search state management
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter inspected applications
  const inspectedApplications = useMemo(() => {
    if (!applications || !Array.isArray(applications)) {
      return [];
    }
    return applications.filter(app => app.status === 'Inspected');
  }, [applications]);

  // Filter applications based on search
  const filteredApplications = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return inspectedApplications;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return inspectedApplications.filter(app => {
      return (
        (app._id?.toLowerCase() || '').includes(searchLower) ||
        (app.fullName?.toLowerCase() || '').includes(searchLower) ||
        (app.contactNumber?.toLowerCase() || '').includes(searchLower) ||
        (app.email?.toLowerCase() || '').includes(searchLower) ||
        (app.serviceType?.toLowerCase() || '').includes(searchLower)
      );
    });
  }, [inspectedApplications, searchTerm]);

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
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid var(--color-gray-300)',
    borderRadius: '8px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  };

  const thStyle = {
    backgroundColor: 'var(--color-gray-50)',
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-gray-700)',
    borderBottom: '2px solid var(--color-gray-200)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const tdStyle = {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--color-gray-700)',
    borderBottom: '1px solid var(--color-gray-100)',
    verticalAlign: 'middle',
  };

  const statusBadgeStyle = {
    backgroundColor: 'var(--color-success)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const actionButtonStyle = {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: 'var(--color-info)',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: 'var(--color-fire)',
    color: 'white',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '48px 24px',
    color: 'var(--color-gray-500)',
    fontSize: '16px',
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Inspected Documents ({inspectedApplications.length})
      </h3>
      
      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search applications by ID, name, or contact number..."
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
              <th style={thStyle}>Application ID</th>
              <th style={thStyle}>Applicant Name</th>
              <th style={thStyle}>Contact Number</th>
              <th style={thStyle}>Service Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Inspected Date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '48px' }}>
                  <div style={{ color: 'var(--color-gray-500)' }}>Loading inspected applications...</div>
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyStateStyle}>
                  {searchTerm ? 'No applications match your search.' : 'No inspected applications found.'}
                </td>
              </tr>
            ) : (
              filteredApplications.map((app, index) => (
                <tr key={app._id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--color-gray-50)' }}>
                  <td style={tdStyle}>
                    <strong>{app._id?.substring(0, 8).toUpperCase() || 'N/A'}</strong>
                  </td>
                  <td style={tdStyle}>
                    <strong>{app.fullName || 'N/A'}</strong>
                  </td>
                  <td style={tdStyle}>{app.contactNumber || 'N/A'}</td>
                  <td style={tdStyle}>{app.serviceType || 'N/A'}</td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle}>Inspected</span>
                  </td>
                  <td style={tdStyle}>{formatDate(app.inspectionDate)}</td>
                  <td style={tdStyle}>
                    <button
                      style={viewButtonStyle}
                      onClick={() => onViewDetails(app)}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-info-dark)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-info)'}
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>visibility</span>
                      View Details
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this application?')) {
                          onDeleteApplication(app._id);
                        }
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-fire)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-fire)'}
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                      delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InspectedDocumentsTable;