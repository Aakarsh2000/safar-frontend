import React, { useState, useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../styles/VideoUpload.css';

const VideoUploadChunk = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null); 
  const [taskID, setTaskID] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [detectStatus, setDetectStatus] = useState('idle');
  const [detectProgress, setDetectProgress] = useState(0);
  const [sseStarted, setSseStarted] = useState(false);
  const [eventStrings, setEventStrings] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus('pending');

    const generatedTaskID = Math.random().toString(36).substring(2, 15);
    setTaskID(generatedTaskID);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      return;
    }

    const file = selectedFile;
    const chunkSize = 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);

    setUploadStatus('uploading');

    try {
      for (let i = 1; i <= totalChunks; i++) {
        const start = (i - 1) * chunkSize;
        const end = Math.min(i * chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkNumber', i);
        formData.append('totalChunks', totalChunks);
        formData.append('fileName', file.name);
        formData.append('task_id', taskID);

        const response = await fetch('http://127.0.0.1:5000/upload_chunk', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.status !== 'Chunk uploaded successfully') {
          throw new Error('Chunk upload failed');
        }

        setUploadProgress(Math.round((i / totalChunks) * 100));
      }

      setUploadStatus('success');
      const detectResponse = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskID }),
      });

      if (detectResponse.ok) {
        setDetectStatus('in_progress');
        setTimeout(() => {
          setSseStarted(true);
        }, 5000);
      } else {
        throw new Error('Detect API call failed');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setSelectedFile(null);
    }
  };

  const parseEventString = (eventString) => {
    const entries = eventString.split(', ');
    const data = entries.reduce((acc, entry) => {
      const [count, label] = entry.split(' ');
      acc.labels.push(label);
      acc.data.push(parseInt(count));
      return acc;
    }, { labels: [], data: [] });
    return data;
  };

  useEffect(() => {
    let eventSource;
    if (sseStarted) {
      eventSource = new EventSource(`http://127.0.0.1:5000/progress_stream/${taskID}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const progress = data.progress;
          if (progress === 100) {
            setDetectStatus('success');
            window.location.href = `http://127.0.0.1:5000/download/${taskID}`;
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          } else {
            setDetectProgress(progress);
            const latestEventString = data.string;
            setEventStrings(prevEventStrings => [...prevEventStrings, latestEventString]);
            
            const parsedData = parseEventString(latestEventString);
            const labels = parsedData.labels;
            const chartData = parsedData.data;
            if (chartInstance.current) {
              // Update existing chart
              chartInstance.current.data.labels = labels;
              chartInstance.current.data.datasets[0].data = chartData;
              chartInstance.current.update();
            } else {
              // Create new chart
              const ctx = chartRef.current.getContext('2d');
              chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [{
                    label: 'Object Counts',
                    data: chartData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  }],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error('Error parsing message data:', error);
          console.log('Received data:', event.data);
        }
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [sseStarted, taskID]);

  const renderUploadButton = () => {
    if (uploadStatus === 'uploading') {
      return <button disabled>Uploading...</button>;
    } else if (uploadStatus === 'success') {
      return <button disabled>Upload Successful!</button>;
    } else {
      return <button onClick={handleUpload}>Upload Video</button>;
    }
  };

  return (
    <div className="container">
      <div className="input-container">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        <label htmlFor="file" className="choose-file-button" onClick={() => fileInputRef.current.click()}>Choose File</label>
      </div>
      <div className="upload-button">
        {renderUploadButton()}
      </div>
      {videoPreview && selectedFile && (
        <div className="video-preview-container">
          <div className="centered-content">
            <video className="video-preview" controls>
              <source src={videoPreview} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      <div className="upload-message">
        {uploadStatus === 'pending' && <p>Preparing to upload...</p>}
        {uploadStatus === 'uploading' && (
          <div>
            <p>Uploading: {uploadProgress}%</p>
          </div>
        )}
        {detectStatus === 'in_progress' && (
          <div>
            <p>Detecting: {detectProgress}%</p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${detectProgress}%` }}></div>
            </div>
            <div>
              <canvas ref={chartRef} />
            </div>
            <h3>Events:</h3>
            <div className="event-strings-box">
              <div className="event-strings-content">
                {eventStrings.map((eventString, index) => (
                  <p key={index}>{eventString}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploadChunk;
