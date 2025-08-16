import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeStyles = {
    small: { width: '20px', height: '20px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '200px'
    }}>
      <div
        style={{
          ...sizeStyles[size],
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}
      />
      <p style={{ 
        color: 'rgba(45, 55, 72, 0.7)', 
        fontSize: '14px',
        margin: 0 
      }}>
        {message}
      </p>
      

    </div>
  );
};

export default LoadingSpinner;