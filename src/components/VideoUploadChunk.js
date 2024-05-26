import React, { useState, useRef, useEffect } from 'react';
import '../styles/VideoUpload.css';

const VideoUploadChunk = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskID, setTaskID] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [detectStatus, setDetectStatus] = useState('idle');
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectionInfo, setDetectionInfo] = useState('');
  const [sseStarted, setSseStarted] = useState(false); // Track if SSE started
  const [eventStrings, setEventStrings] = useState([]); // Store event strings

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus('pending');

    // Generate a unique task ID (consider using a library like uuid)
    const generatedTaskID = Math.random().toString(36).substring(2, 15);
    setTaskID(generatedTaskID);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      return;
    }

    const file = selectedFile;
    const chunkSize = 1024 * 1024; // 1MB chunks
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
        body: JSON.stringify({
          task_id: taskID,
        }),
      });

      if (detectResponse.ok) {
        setDetectStatus('in_progress');
        setTimeout(() => {
          setSseStarted(true); // Start SSE after 5 seconds
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
            }, 5000); // Refresh after 5 seconds
          } else {
            setDetectProgress(progress);
            setDetectionInfo(data.string || '');
            // Add the string to the eventStrings array
            setEventStrings(prevEventStrings => [...prevEventStrings, data.string]);
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
            <h3>Event Strings:</h3>
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
