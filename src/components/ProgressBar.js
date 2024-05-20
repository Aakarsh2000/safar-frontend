// src/components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-container">
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
