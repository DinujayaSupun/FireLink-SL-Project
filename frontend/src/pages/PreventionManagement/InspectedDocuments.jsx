import React, { useEffect, useState } from "react";
import { getInspectedDocuments, deleteInspectedDocument } from "../../services/preventionCertificateAPI";
import Sidebar from "../UserManagement/Sidebar";

const InspectedDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // For testing purposes, set a mock prevention manager user
      const mockUser = {
        name: "arindu",
        staffId: "PRE61949",
        position: "preventionmanager"
      };
      setUser(mockUser);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getInspectedDocuments();
        console.log("API Result:", result); // Debug log
        if (result && result.success) {
          setDocuments(result.data || []);
        } else {
          // For now, show empty state instead of error
          setDocuments([]);
          console.warn("API returned unsuccessful result:", result);
        }
      } catch (err) {
        console.error("Error fetching inspected documents:", err);
        setDocuments([]);
        setError("Unable to connect to server. Please ensure the backend is running.");
      }
      setLoading(false);
    }
    
    // No sample data - use real data from API
    
    fetchData();
  }, []);

  // Handle view details
  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  // Handle delete document
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this inspected document?')) {
      try {
        const result = await deleteInspectedDocument(documentId);
        if (result.success) {
          // Remove the deleted document from the state
          setDocuments(documents.filter(doc => doc._id !== documentId));
          console.log('Document deleted successfully');
        } else {
          console.error('Failed to delete document:', result.error);
          alert('Failed to delete document. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('An error occurred while deleting the document.');
      }
    }
  };

  // Styling to match Prevention Officer Dashboard tables
  const containerStyle = {
    flex: 1,
    padding: '20px',
    backgroundColor: 'var(--color-gray-700)',
    minHeight: '100vh',
    fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
  };

  const cardStyle = {
    backgroundColor: 'var(--color-gray-300)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: 'var(--color-gray-300)',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-gray-800)',
    margin: 0,
  };

  const searchContainerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: 'var(--color-gray-300)',
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
    border: '1px solid var(--color-gray-300)',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    maxHeight: '600px',
    overflowY: 'auto',
  };

  const tableStyle = {
    width: '100%',
    minWidth: '1200px',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    backgroundColor: 'var(--color-gray-50)',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-gray-700)',
    borderBottom: '1px solid var(--color-gray-200)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const tdStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--color-gray-700)',
    borderBottom: '1px solid var(--color-gray-100)',
    backgroundColor: 'white',
  };

  const noDataStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--color-gray-500)',
    fontSize: '16px',
    fontWeight: '500',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--color-gray-500)',
    fontSize: '16px',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'var(--color-success)',
    color: 'white',
  };

  // Modal styles
  const modalOverlayStyle = {
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
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  };

  const modalHeaderStyle = {
    borderBottom: '1px solid var(--color-gray-200)',
    paddingBottom: '16px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const modalTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-gray-800)',
    margin: 0,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--color-gray-500)',
    padding: '0',
  };

  const modalBodyStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  };

  const fieldStyle = {
    marginBottom: '12px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-gray-700)',
    marginBottom: '4px',
  };

  const valueStyle = {
    fontSize: '14px',
    color: 'var(--color-gray-500)',
    backgroundColor: 'var(--color-gray-50)',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-gray-200)',
  };

  const notesStyle = {
    gridColumn: '1 / -1',
  };

  const deleteButtonStyle = {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid var(--color-fire)',
    backgroundColor: 'var(--color-fire)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {user && <Sidebar user={user} />}
      
      {/* Main Content */}
      <div style={containerStyle}>
        {/* Header Card */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>Inspected Documents</h2>
          </div>
          
          {/* Search Section */}
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Search applications by ID, name, or contact number..."
            style={searchInputStyle}
          />
        </div>

        {/* Table Section */}
        <div style={tableContainerStyle}>
          {loading ? (
            <div style={loadingStyle}>
              <div>Loading inspected documents...</div>
            </div>
          ) : error ? (
            <div style={noDataStyle}>
              <div>Error: {error}</div>
            </div>
          ) : documents.length === 0 ? (
            <div style={noDataStyle}>
              <div>No inspected documents found</div>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#94a3b8' }}>
                Applications marked as inspected will appear here
              </p>
            </div>
          ) : (
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
                {documents.map((doc, index) => (
                  <tr key={doc._id || index}>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>
                      {doc._id ? doc._id.slice(-8).toUpperCase() : 'N/A'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: '500' }}>
                      {doc.fullName || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {doc.contactNumber || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {doc.serviceType || 'Fire Prevention'}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle}>
                        Inspected
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {doc.inspectionDate 
                        ? new Date(doc.inspectionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'
                      }
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleViewDetails(doc)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-gray-300)',
                            backgroundColor: 'var(--color-gray-50)',
                            color: 'var(--color-gray-700)',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          style={deleteButtonStyle}
                          title="Delete document"
                        >
                          <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* End Table Container */}
      </div>
      {/* End Card */}
    </div>
    {/* End Main Content */}

    {/* Application Details Modal */}
    {showModal && selectedDocument && (
      <div style={modalOverlayStyle} onClick={handleCloseModal}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeaderStyle}>
            <h3 style={modalTitleStyle}>Application Details</h3>
            <button style={closeButtonStyle} onClick={handleCloseModal}>
              ×
            </button>
          </div>
          
          <div style={modalBodyStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Application ID</label>
              <div style={valueStyle}>{selectedDocument._id ? selectedDocument._id.slice(-8).toUpperCase() : 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={valueStyle}>{selectedDocument.fullName || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>NIC</label>
              <div style={valueStyle}>{selectedDocument.nic || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Number</label>
              <div style={valueStyle}>{selectedDocument.contactNumber || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <div style={valueStyle}>{selectedDocument.email || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Address</label>
              <div style={valueStyle}>{selectedDocument.address || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Service Type</label>
              <div style={valueStyle}>{selectedDocument.serviceType || 'Fire Prevention'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Construction Type</label>
              <div style={valueStyle}>{selectedDocument.constructionType || 'N/A'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Urgency Level</label>
              <div style={valueStyle}>{selectedDocument.urgencyLevel || 'Normal'}</div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <div style={valueStyle}>
                <span style={statusBadgeStyle}>Inspected</span>
              </div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Applied Date</label>
              <div style={valueStyle}>
                {selectedDocument.appliedDate 
                  ? new Date(selectedDocument.appliedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
                }
              </div>
            </div>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Inspected Date</label>
              <div style={valueStyle}>
                {selectedDocument.inspectionDate 
                  ? new Date(selectedDocument.inspectionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
                }
              </div>
            </div>
            
            <div style={{ ...fieldStyle, ...notesStyle }}>
              <label style={labelStyle}>Inspection Notes</label>
              <div style={{ ...valueStyle, minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                {selectedDocument.inspectionNotes || 'No notes provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default InspectedDocuments;
