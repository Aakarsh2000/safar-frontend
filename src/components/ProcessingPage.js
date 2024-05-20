import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import '../styles.css';

const ProcessingPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/progress/${taskId}`);
        setMessage(response.data.message);
        setProgress(response.data.progress);
        if (response.data.message === 'Processing completed') {
          alert('Processing completed');
          navigate('/upload-video'); // Redirect to upload page or any other page
        }
      } catch (error) {
        console.error('Error checking progress:', error.message);
      }
    };

    const interval = setInterval(() => {
      checkProgress();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [taskId, navigate]);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Processing Video</h2>
        <p>{message}</p>
        {progress > 0 && progress < 100 && <ProgressBar progress={progress} />}
      </div>
    </div>
  );
};

export default ProcessingPage;
