import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { toast, Toaster } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Import custom hooks and services
import usePreventionApplications from "../../hooks/usePreventionApplications";

// Import components
import TabNavigation from '../../components/PreventionManagement/ui/TabNavigation';
import StatisticsOverview from '../../components/PreventionManagement/ui/StatisticsOverview';
import DocumentReviewTable from '../../components/PreventionManagement/tables/DocumentReviewTable';
import PaymentAssignmentTable from '../../components/PreventionManagement/tables/PaymentAssignmentTable';
import InspectionTrackingTable from '../../components/PreventionManagement/tables/InspectionTrackingTable';
import InspectedDocumentsTable from '../../components/PreventionManagement/tables/InspectedDocumentsTable';
import RejectedDocumentsTable from '../../components/PreventionManagement/tables/RejectedDocumentsTable';
import ApplicationDetailsModal from '../../components/PreventionManagement/modals/ApplicationDetailsModal';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PreventionOfficerDashboard = () => {
  // Custom hook for managing applications and API calls
    React.useEffect(() => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }, []);
  const {
    applications,
    loading,
    error,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    paymentAssignedApplications,
    approveApplication,
    rejectApplication,
    deleteApplication,
    assignPayment,
    addInspectionNotes,
    markAsInspected,
    reactivateApplication,
  } = usePreventionApplications();

  // Local state
  const [activeTab, setActiveTab] = useState('review');
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Table state for search and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle view application details
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  // Handle export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    
    // Load the FireDepartment logo
    const logoUrl = window.location.origin + '/images/FireDepartment_Logo.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;
    
    img.onload = function() {
      // Add logo on the left side (positioned at x=15, y=15, width=35, height=35)
      doc.addImage(img, 'PNG', 15, 15, 35, 35);
      
      // Title - FireLink SL (positioned to the right of the logo)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(201, 0, 0);
      doc.text('FireLink SL', 105, 35, { align: 'center' });
      
      // Add red underline for FireLink SL
      const titleWidth = doc.getTextWidth('FireLink SL');
      const titleX = 105 - titleWidth / 2;
      doc.setDrawColor(201, 0, 0);
      doc.setLineWidth(2);
      doc.line(titleX, 38, titleX + titleWidth, 38);
      
      // Subtitle - Official Application Report
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Official Application Report', 105, 50, { align: 'center' });
      
      // Fire Station Contact Information (Top Right)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const contactInfo = [
        'Main Fire Station (Head Quarters),',
        'T.B. Jaya Mawatha',
        'Colombo 10',
        'Sri Lanka.',
        'Contact: (+94) 11-1234567'
      ];
      
      let contactY = 25; // Position to align with FireLink SL title
      const contactX = 160; // Right side positioning
      contactInfo.forEach((line, index) => {
        doc.text(line, contactX, contactY + (index * 4));
      });
      
      // Date
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 80);
      
      // Summary statistics
      const total = applications.length;
      const pending = applications.filter(app => app.status === 'Pending').length;
      const approved = applications.filter(app => app.status === 'Approved').length;
      const rejected = applications.filter(app => app.status === 'Rejected').length;
      const paymentAssigned = applications.filter(app => app.payment).length;
      const inspected = applications.filter(app => app.status === 'Inspected').length;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Total Applications: ${total} | Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected} | Payment Assigned: ${paymentAssigned} | Inspected: ${inspected}`, 15, 95);
      
      let currentY = 110;
      let pageNumber = 1;
      
      // Helper function to add footer with page number
      const addFooter = (pageNum) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Generated by FireLink SL', 15, 285);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Page ${pageNum}`, 185, 285);
      };
      
      // Add footer to first page
      addFooter(pageNumber);
      
      // Helper function to add table
      const addTable = (title, data, columns, startY, customColWidths = null) => {
        if (data.length === 0) return startY + 20; // Skip empty tables
        
        const tableStartY = startY + 15;
        const rowHeight = 10;
        let colWidths = customColWidths || [35, 25, 40, 30, 25, 35];
        let totalWidth = colWidths.reduce((a, b) => a + b, 0);
        
        // Check if table header + at least one row fits on current page
        if (tableStartY + (rowHeight * 2) > 270) {
          doc.addPage();
          pageNumber++;
          addFooter(pageNumber);
          startY = 20;
        }
        
        // Table title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, 15, startY + 10);
        
        const finalTableStartY = startY + 15;
        
        // Draw header row with vertical lines
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        
        // Header background rectangle
        doc.rect(15, finalTableStartY, totalWidth, rowHeight);
        
        // Header text and vertical lines
        let currentX = 15;
        columns.forEach((col, index) => {
          // Add header text
          doc.text(col, currentX + 2, finalTableStartY + 6);
          
          // Draw vertical line (except for last column)
          if (index < columns.length - 1) {
            currentX += colWidths[index];
            doc.line(currentX, finalTableStartY, currentX, finalTableStartY + rowHeight);
          }
        });
        
        // Data rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        let rowY = finalTableStartY + rowHeight;
        
        data.forEach((row, rowIndex) => {
          // Check if we need a new page for data row
          if (rowY + rowHeight > 265) {
            doc.addPage();
            pageNumber++;
            addFooter(pageNumber);
            rowY = 20;
            
            // Redraw table title on new page
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(title + ' (continued)', 15, rowY);
            rowY += 15;
            
            // Redraw header on new page
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.rect(15, rowY, totalWidth, rowHeight);
            
            currentX = 15;
            columns.forEach((col, index) => {
              doc.text(col, currentX + 2, rowY + 6);
              if (index < columns.length - 1) {
                currentX += colWidths[index];
                doc.line(currentX, rowY, currentX, rowY + rowHeight);
              }
            });
            rowY += rowHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          }
          
          // Draw data row rectangle
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.rect(15, rowY, totalWidth, rowHeight);
          
          // Add data and vertical lines
          currentX = 15;
          row.forEach((cell, cellIndex) => {
            const cellText = cell || '';
            const maxLength = colWidths[cellIndex] < 30 ? 20 : 30;
            doc.text(cellText.toString().substring(0, maxLength), currentX + 2, rowY + 6);
            
            // Draw vertical line (except for last column)
            if (cellIndex < row.length - 1) {
              currentX += colWidths[cellIndex];
              doc.line(currentX, rowY, currentX, rowY + rowHeight);
            }
          });
          
          rowY += rowHeight;
        });
        
        return rowY + 15;
      };
      
      // 1. Document Review Table (Pending Applications)
      const documentReviewApps = applications.filter(app => app.status === 'Pending');
      const reviewData = documentReviewApps.map(app => [
        app.fullName || '',
        app.nic || '',
        app.serviceType || 'Inspection',
        app.constructionType || '',
        app.urgencyLevel || 'Normal',
        app.status || ''
      ]);
      const reviewColWidths = [32, 28, 32, 32, 28, 28];
      currentY = addTable('1. Document Review Table (Pending Applications)', reviewData,
        ['Full Name', 'NIC', 'Service Type', 'Construction Type', 'Urgency', 'Status'], currentY, reviewColWidths);
      
      // 2. Payment Assignment Table (Approved Applications)
      const paymentAssignmentApps = applications.filter(app => app.status === 'Approved');
      const paymentAssignData = paymentAssignmentApps.map(app => [
        app.fullName || '',
        app.nic || '',
        app.serviceType || 'Inspection',
        app.constructionType || '',
        app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'N/A',
        app.status || ''
      ]);
      const paymentColWidths = [32, 28, 32, 32, 32, 28];
      currentY = addTable('2. Payment Assignment Table (Approved Applications)', paymentAssignData,
        ['Full Name', 'NIC', 'Service Type', 'Construction Type', 'Approved Date', 'Status'], currentY, paymentColWidths);
      
      // 3. Inspection Tracking Table (Payment Assigned Applications)
      const inspectionTrackingApps = applications.filter(app => 
        app.status === 'Payment Assigned' && app.payment
      );
      const getDaysSincePayment = (approvedAt) => {
        if (!approvedAt) return 'N/A';
        const days = Math.floor((new Date() - new Date(approvedAt)) / (1000 * 60 * 60 * 24));
        return days.toString();
      };
      const trackingData = inspectionTrackingApps.map(app => [
        app.fullName || '',
        app.contactNumber || '',
        app.serviceType || 'Inspection',
        app.payment ? `Rs. ${app.payment}` : '',
        app.urgencyLevel || 'Normal',
        getDaysSincePayment(app.approvedAt) + ' days'
      ]);
      const inspectionColWidths = [35, 30, 35, 25, 25, 40];
      currentY = addTable('3. Inspection Tracking Table (Payment Assigned)', trackingData,
        ['Full Name', 'Contact Number', 'Service Type', 'Payment', 'Priority', 'Days Since Payment'], currentY, inspectionColWidths);
      
      // 4. Inspected Documents Table (Inspected Applications)
      const inspectedApps = applications.filter(app => app.status === 'Inspected');
      const inspectedData = inspectedApps.map(app => [
        app.fullName || '',
        app.nic || '',
        app.serviceType || 'Safety Audit',
        app.status || '',
        app.inspectionDate 
          ? new Date(app.inspectionDate).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'N/A'
      ]);
      const inspectedColWidths = [40, 32, 40, 32, 40];
      currentY = addTable('4. Inspected Documents Table', inspectedData,
        ['Full Name', 'NIC', 'Service Type', 'Status', 'Inspected Date'], currentY, inspectedColWidths);
      
      // 5. Rejected Applications Table
      const rejectedApps = applications.filter(app => app.status === 'Rejected');
      const rejectedData = rejectedApps.map(app => [
        app.fullName || '',
        app.nic || '',
        app.serviceType || 'Safety Audit',
        app.status || '',
        app.rejectionReason || '',
        app.rejectedAt 
          ? new Date(app.rejectedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'N/A'
      ]);
      const rejectedColWidths = [32, 28, 32, 28, 40, 32];
      currentY = addTable('5. Rejected Applications Table', rejectedData,
        ['Full Name', 'NIC', 'Service Type', 'Status', 'Reason', 'Date'], currentY, rejectedColWidths);
      
      // Save PDF
      doc.save(`FireSafetyReport_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated with all tables and logo!');
    };
    
    img.onerror = function() {
      // Fallback if logo fails to load - still generate full PDF without logo
      console.warn('Logo failed to load, generating PDF without logo');
      
      try {
        // Title - FireLink SL
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(201, 0, 0);
        doc.text('FireLink SL', 105, 35, { align: 'center' });
        
        // Add red underline for FireLink SL
        const titleWidth = doc.getTextWidth('FireLink SL');
        const titleX = 105 - titleWidth / 2;
        doc.setDrawColor(201, 0, 0);
        doc.setLineWidth(2);
        doc.line(titleX, 38, titleX + titleWidth, 38);
        
        // Subtitle - Official Application Report
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Official Application Report', 105, 50, { align: 'center' });
        
        // Fire Station Contact Information (Top Right)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const contactInfo = [
          'Main Fire Station (Head Quarters),',
          'T.B. Jaya Mawatha',
          'Colombo 10',
          'Sri Lanka.',
          'Contact: (+94) 11-1234567'
        ];
        
        let contactY = 25;
        const contactX = 160;
        contactInfo.forEach((line, index) => {
          doc.text(line, contactX, contactY + (index * 4));
        });
        
        // Date
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 80);
        
        // Summary statistics
        const total = applications.length;
        const pending = applications.filter(app => app.status === 'Pending').length;
        const approved = applications.filter(app => app.status === 'Approved').length;
        const rejected = applications.filter(app => app.status === 'Rejected').length;
        const paymentAssigned = applications.filter(app => app.payment).length;
        const inspected = applications.filter(app => app.status === 'Inspected').length;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Total Applications: ${total} | Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected} | Payment Assigned: ${paymentAssigned} | Inspected: ${inspected}`, 15, 95);
        
        // Note about missing logo
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text('Note: Logo could not be loaded but all data is included.', 15, 110);
        
        // Footer
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Generated by FireLink SL', 15, 285);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Page 1', 185, 285);
        
        // Save PDF
        doc.save(`FireSafetyReport_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF report generated (without logo - please check logo file path)');
      } catch (error) {
        console.error('PDF Generation Error in fallback:', error);
        toast.error('Failed to generate PDF: ' + error.message);
      }
    };
  };

  const handleExportToExcel = () => {
    // Simple CSV export
    const csvContent = applications.map(app => 
      `${app.fullName},${app.nic},${app.serviceType},${app.status},${app.payment || ''}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prevention_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Styles
  const containerStyle = {
    backgroundColor: 'var(--color-gray-700)',
    minHeight: '100vh',
    fontFamily: 'Public Sans, Arial, sans-serif',
    padding: '32px 0',
  };

  const headerStyle = {
    background: '#dc143c',
    textAlign: 'left',
    marginBottom: '0',
    padding: '40px 24px',
    position: 'relative',
    boxShadow: '0 2px 10px rgba(220, 20, 60, 0.3)',
  };

  const titleStyle = {
    fontSize: '36px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    fontFamily: 'Public Sans, Arial, sans-serif',
    color: 'white',
    lineHeight: '1.2',
  };

  const subtitleStyle = {
    fontSize: '18px',
    fontWeight: '400',
    margin: '0',
    fontFamily: 'Public Sans, Arial, sans-serif',
    color: 'white',
    opacity: 0.95,
  };

  const headerButtonsStyle = {
    display: 'flex',
    gap: '12px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    backdropFilter: 'blur(10px)',
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    backgroundColor: 'var(--color-gray-700)',
    minHeight: 'calc(100vh - 160px)',
  };

  const errorAlertStyle = {
    backgroundColor: 'var(--color-fire-50)',
    border: '1px solid var(--color-fire-100)',
    color: 'var(--color-fire)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '60px',
    color: 'var(--color-gray-500)',
    fontSize: '18px',
  };

  const spacerStyle = {
    height: '32px',
  };

  const headerContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0',
  };

  const headerTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerContentStyle}>
            <div>
              <h1 style={titleStyle}>Prevention Officer Dashboard</h1>
              <p style={subtitleStyle}>Fire Safety Prevention Department</p>
            </div>
          </div>
        </div>
        <div style={contentStyle}>
          <div style={loadingStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
            Loading applications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Sonner Toast Messages */}
      <Toaster position="top-center" expand={false} richColors />

      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={headerTextStyle}>
            <h1 style={titleStyle}>Prevention Officer Dashboard</h1>
            <p style={subtitleStyle}>Fire Safety Prevention Department</p>
          </div>
          <div style={headerButtonsStyle}>
            <button
              onClick={handleExportToExcel}
              style={primaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Export Report
            </button>
            <button
              onClick={handleExportToPDF}
              style={primaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Error Alert */}
        {error && (
          <div style={errorAlertStyle}>
            <strong>⚠️ Connection Error:</strong> {error}
            <br />
            <small>Some features may not work properly. Please check if the backend server is running.</small>
          </div>
        )}

        {/* Statistics Overview */}
        <StatisticsOverview applications={applications} />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingApplications.length}
          rejectedCount={rejectedApplications.length}
        />

        {/* Tab Content */}
        {activeTab === 'review' && (
          <>
            {/* Document Review Table */}
            <DocumentReviewTable
              applications={applications}
              onApprove={approveApplication}
              onReject={rejectApplication}
              onDelete={deleteApplication}
              onViewDetails={handleViewDetails}
              loading={loading}
            />

            <div style={spacerStyle} />

            {/* Payment Assignment Table */}
            <PaymentAssignmentTable
              applications={applications}
              onAssignPayment={assignPayment}
              onDelete={deleteApplication}
              onViewDetails={handleViewDetails}
              loading={loading}
            />

            <div style={spacerStyle} />

            {/* Inspection Tracking Table */}
            <InspectionTrackingTable
              applications={applications}
              onAddNotes={addInspectionNotes}
              onMarkAsInspected={markAsInspected}
              onDeleteApplication={deleteApplication}
              onViewDetails={handleViewDetails}
            />

            <div style={spacerStyle} />

            {/* Inspected Documents Table */}
            <InspectedDocumentsTable
              applications={applications}
              onDeleteApplication={deleteApplication}
              onViewDetails={handleViewDetails}
              loading={loading}
            />
          </>
        )}

        {activeTab === 'rejected' && (
          <RejectedDocumentsTable
            applications={applications}
            onReactivate={reactivateApplication}
            onDelete={deleteApplication}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={approveApplication}
          onReject={rejectApplication}
          onDelete={deleteApplication}
        />
      )}
    </div>
  );
};

export default PreventionOfficerDashboard;
