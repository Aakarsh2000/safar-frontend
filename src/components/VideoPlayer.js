// src/components/VideoPlayer.js
import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
  return (
    <div className="video-player-container">
      <video controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
