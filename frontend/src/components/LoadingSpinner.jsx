import React from 'react';

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="loading-spinner-spin"></div>
    <span style={{ marginLeft: '1rem', color: '#1e40af' }}>Loading...</span>
  </div>
);

export default LoadingSpinner;