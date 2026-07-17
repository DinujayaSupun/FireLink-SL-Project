import React from 'react';

const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0, 
  rejectedCount = 0 
}) => {
  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--color-gray-200)',
    marginBottom: '24px',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  };

  const getTabStyle = (tabName) => {
    const baseStyle = {
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative',
      minWidth: '180px',
      justifyContent: 'flex-start',
      borderRadius: '8px 8px 0 0',
      marginBottom: '-1px',
    };

    const isActive = activeTab === tabName;

    return {
      ...baseStyle,
      backgroundColor: isActive ? 'var(--color-gray-50)' : 'transparent',
      color: isActive ? 'var(--color-gray-800)' : 'var(--color-gray-500)',
      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      fontWeight: isActive ? '600' : '500',
    };
  };

  const badgeStyle = {
    backgroundColor: 'var(--color-info)',
    color: 'white',
    borderRadius: '50%',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inactiveBadgeStyle = {
    backgroundColor: 'var(--color-gray-200)',
    color: 'var(--color-gray-500)',
    borderRadius: '50%',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={tabContainerStyle}>
      <button
        style={getTabStyle('review')}
        onClick={() => onTabChange('review')}
        onMouseOver={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = 'var(--color-gray-100)';
            e.target.style.color = 'var(--color-gray-700)';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--color-gray-500)';
          }
        }}
      >
        Document Review
        {pendingCount > 0 && (
          <span style={activeTab === 'review' ? badgeStyle : inactiveBadgeStyle}>
            {pendingCount}
          </span>
        )}
      </button>

      <button
        style={getTabStyle('rejected')}
        onClick={() => onTabChange('rejected')}
        onMouseOver={(e) => {
          if (activeTab !== 'rejected') {
            e.target.style.backgroundColor = 'var(--color-gray-100)';
            e.target.style.color = 'var(--color-gray-700)';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'rejected') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--color-gray-500)';
          }
        }}
      >
        Rejected Documents
        {rejectedCount > 0 && (
          <span style={activeTab === 'rejected' ? badgeStyle : inactiveBadgeStyle}>
            {rejectedCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default TabNavigation;