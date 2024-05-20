// src/components/VideoPreview.js
import React from 'react';

const VideoPreview = ({ previewURL }) => {
  return (
    <div className="video-preview-container">
      <h3>Video Preview</h3>
      <video src={previewURL} controls />
    </div>
  );
};

export default VideoPreview;
