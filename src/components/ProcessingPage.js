import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import '../styles.css';

const ProcessingPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/progress/${taskId}`);
        setProgress(response.data.progress);
        if (response.data.message === 'Processing completed') {
          setCompleted(true);
        }
      } catch (error) {
        console.error('Error checking progress:', error.message);
      }
    };

    const interval = setInterval(() => {
      checkProgress();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    const fetchDataAndDownload = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/result/${taskId}`, {
          responseType: 'blob' // Set the response type to blob
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'processed_video.mp4');
        document.body.appendChild(link);
        link.click();
        // Redirect to upload video page after download
        setTimeout(() => {
          navigate('/upload-video');
        }, 1000);
      } catch (error) {
        console.error('Error downloading video:', error.message);
      }
    };

    if (completed) {
      fetchDataAndDownload();
    }
  }, [completed, navigate, taskId]);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Processing Video</h2>
        {progress === 100 ? (
          <div className="popup">
            <p>Progress Completed</p>
          </div>
        ) : (
          <>
            <div className="loader"></div>
            {progress > 0 && progress < 100 && <ProgressBar progress={progress} />}
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingPage;
