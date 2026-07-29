import React from 'react';

const NotificationSystem = ({ notifications, onRemoveNotification }) => {
  if (!notifications || notifications.length === 0) return null;

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1050,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px',
  };

  const getNotificationStyle = (type) => {
    const baseStyle = {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minWidth: '300px',
      animation: 'slideInRight 0.3s ease-out',
    };

    const borderColors = {
      success: 'var(--color-success)',
      error: 'var(--color-fire)',
      warning: 'var(--color-amber)',
      info: 'var(--color-info)',
    };

    return {
      ...baseStyle,
      borderLeft: `4px solid ${borderColors[type] || borderColors.info}`,
    };
  };

  const getIconStyle = (type) => {
    const colors = {
      success: 'var(--color-success)',
      error: 'var(--color-fire)',
      warning: 'var(--color-amber)',
      info: 'var(--color-info)',
    };

    return {
      color: colors[type] || colors.info,
      fontSize: '18px',
      marginRight: '12px',
      marginTop: '2px',
    };
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || icons.info;
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-gray-400)',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '0',
    marginLeft: '12px',
    lineHeight: '1',
  };

  const messageStyle = {
    flex: 1,
    fontSize: '14px',
    color: 'var(--color-gray-700)',
  };

  const timestampStyle = {
    fontSize: '12px',
    color: 'var(--color-gray-500)',
    marginTop: '4px',
  };

  // Add CSS animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={containerStyle}>
      {notifications.map((notification) => (
        <div key={notification.id} style={getNotificationStyle(notification.type)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <span style={getIconStyle(notification.type)}>
              {getIcon(notification.type)}
            </span>
            <div style={messageStyle}>
              <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                {notification.message}
              </div>
              <div style={timestampStyle}>
                {notification.timestamp}
              </div>
            </div>
          </div>
          <button
            onClick={() => onRemoveNotification(notification.id)}
            style={closeButtonStyle}
            onMouseOver={(e) => e.target.style.color = 'var(--color-gray-700)'}
            onMouseOut={(e) => e.target.style.color = 'var(--color-gray-400)'}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;