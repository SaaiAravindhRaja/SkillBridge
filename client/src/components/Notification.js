import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    const styles = {
      success: {
        backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      },
      error: {
        backgroundColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      },
      warning: {
        backgroundColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        borderColor: 'rgba(251, 191, 36, 0.3)'
      },
      info: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: 'rgba(102, 126, 234, 0.3)'
      }
    };
    return styles[type] || styles.info;
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        background: typeStyles.backgroundColor,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        border: `1px solid ${typeStyles.borderColor}`,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>
          {message}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '12px',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.7}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Notification Manager Hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NotificationContainer = () => (
    <div>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 80}px`,
            right: '20px',
            zIndex: 1000
          }}
        >
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );

  return {
    addNotification,
    removeNotification,
    NotificationContainer
  };
};

export default Notification;