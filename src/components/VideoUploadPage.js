// src/components/VideoUploadPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UploadForm from './UploadForm';
import VideoPreview from './VideoPreview';
import '../styles.css';

const VideoUploadPage = () => {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile));
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const taskId = response.data.task_id;
      navigate(`/video/${taskId}`);
    } catch (error) {
      alert(`Upload failed: ${error.response?.data || error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <UploadForm handleFileChange={handleFileChange} handleSubmit={handleSubmit} />
        {previewURL && <VideoPreview previewURL={previewURL} />}
      </div>
    </div>
  );
};

export default VideoUploadPage;
