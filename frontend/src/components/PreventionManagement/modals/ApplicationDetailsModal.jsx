import React, { useState } from 'react';

const ApplicationDetailsModal = ({ application, onClose, onApprove, onReject, onDelete }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!application) return null;

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    await onReject(application._id, rejectionReason);
    onClose();
  };

  const handleApprove = async () => {
    await onApprove(application._id);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${application.fullName}'s application? This action cannot be undone.`)) {
      await onDelete(application._id);
      onClose();
    }
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
  };

  const headerStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-gray-800)',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  };

  const fieldStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '500',
    color: 'var(--color-gray-700)',
    fontSize: '14px',
  };

  const valueStyle = {
    padding: '8px 12px',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    color: 'var(--color-gray-800)',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '80px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
  };

  const statusColors = {
    'Pending': { bg: '#fef3c7', color: '#92400e' },
    'Approved': { bg: '#d1fae5', color: '#065f46' },
    'Rejected': { bg: 'var(--color-fire-100)', color: 'var(--color-fire-dark)' },
    'Payment Assigned': { bg: 'var(--color-gray-100)', color: '#3730a3' },
    'Inspected': { bg: '#ecfdf5', color: '#14532d' },
  };

  const statusStyle = statusColors[application.status] || { bg: 'var(--color-gray-100)', color: 'var(--color-gray-700)' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          Application Details - {application.fullName}
        </div>

        {/* Application Details */}
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name</label>
            <div style={valueStyle}>{application.fullName}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>NIC Number</label>
            <div style={valueStyle}>{application.nic}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Contact Number</label>
            <div style={valueStyle}>{application.contactNumber || 'Not provided'}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <div style={valueStyle}>{application.email || 'Not provided'}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Service Type</label>
            <div style={valueStyle}>{application.serviceType || 'Fire Prevention Certificate'}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Construction Type</label>
            <div style={valueStyle}>{application.constructionType}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Urgency Level</label>
            <div style={valueStyle}>{application.urgencyLevel || 'Normal'}</div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <div style={{
              ...valueStyle,
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: '500',
            }}>
              {application.status}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Application Date</label>
            <div style={valueStyle}>
              {application.appliedDate || application.createdAt 
                ? new Date(application.appliedDate || application.createdAt).toLocaleDateString()
                : 'Not available'}
            </div>
          </div>

          {application.payment && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Payment Amount</label>
              <div style={valueStyle}>Rs. {application.payment}</div>
            </div>
          )}

          {application.approvedAt && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Approved Date</label>
              <div style={valueStyle}>{new Date(application.approvedAt).toLocaleDateString()}</div>
            </div>
          )}

          {application.rejectedAt && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Rejected Date</label>
              <div style={valueStyle}>{new Date(application.rejectedAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Full-width fields */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Address</label>
          <div style={valueStyle}>{application.address || 'Not provided'}</div>
        </div>

        {application.additionalNotes && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Additional Notes</label>
            <div style={valueStyle}>{application.additionalNotes}</div>
          </div>
        )}

        {application.rejectionReason && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Rejection Reason</label>
            <div style={{
              ...valueStyle,
              backgroundColor: 'var(--color-fire-100)',
              color: 'var(--color-fire-dark)',
              border: '1px solid #fecaca',
            }}>
              {application.rejectionReason}
            </div>
          </div>
        )}

        {application.inspectionNotes && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Inspection Notes</label>
            <div style={valueStyle}>{application.inspectionNotes}</div>
          </div>
        )}

        {/* Rejection Form */}
        {showRejectForm && (
          <div style={{ ...fieldStyle, marginTop: '20px', padding: '16px', backgroundColor: 'var(--color-fire-50)', borderRadius: '8px' }}>
            <label style={labelStyle}>Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejection..."
              style={textareaStyle}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={buttonGroupStyle}>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: 'var(--color-gray-100)',
              color: 'var(--color-gray-700)',
            }}
          >
            Close
          </button>

          {application.status === 'Pending' && (
            <>
              {showRejectForm ? (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'var(--color-gray-500)',
                      color: 'white',
                    }}
                  >
                    Cancel Reject
                  </button>
                  <button
                    onClick={handleReject}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'var(--color-fire)',
                      color: 'white',
                    }}
                  >
                    Confirm Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'var(--color-fire)',
                      color: 'white',
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'var(--color-success)',
                      color: 'white',
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
            </>
          )}

          <button
            onClick={handleDelete}
            style={{
              ...buttonStyle,
              backgroundColor: 'var(--color-fire)',
              color: 'white',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;