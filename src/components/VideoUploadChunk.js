import React, { useState, useRef, useEffect } from 'react';
import '../styles/VideoUpload.css'

const VideoUploadChunk = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskID, setTaskID] = useState(null); // Store the task ID for reference
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // Initial status
  const [detectStatus, setDetectStatus] = useState('idle'); // Initial detect status
  const [detectProgress, setDetectProgress] = useState(0); // Initial detect progress

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus('pending');

    // Generate a unique task ID (consider using a library like uuid)
    const generatedTaskID = Math.random().toString(36).substring(2, 15); // Example
    setTaskID(generatedTaskID);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error'); // Handle missing file
      return;
    }

    const file = selectedFile;
    const chunkSize = 1024 * 1024; // Adjust chunk size as needed
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
          throw new Error('Chunk upload failed'); // Handle errors gracefully
        }

        setUploadProgress(Math.round((i / totalChunks) * 100));
      }

      setUploadStatus('success'); // Upload successful
      // Call the detect API after upload is done
      await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskID,
        }),
      });
      // Set detect status to in progress after the detect API call
      setDetectStatus('in_progress');
    } catch (error) {
      console.error(error);
      setUploadStatus('error'); // Handle upload errors
    } finally {
      setSelectedFile(null); // Reset state after upload
    }
  };

  const checkDetectProgress = async () => {
    if (taskID && detectStatus === 'in_progress') {
      try {
        const response = await fetch(`http://127.0.0.1:5000/progress/${taskID}`);
        const data = await response.json();
        if (data.progress === 100) {
          setDetectStatus('success');
          // Download the video after detection is completed
          window.location.href = `http://127.0.0.1:5000/download/${taskID}`;
          // Refresh the page after detection is completed
          setTimeout(() => {
            window.location.reload();
          }, 5000); // Refresh after 5 seconds
        } else {
          setDetectProgress(data.progress);
        }
      } catch (error) {
        console.error(error);
        setDetectStatus('error');
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(checkDetectProgress, 1000); // Check progress every second
    return () => clearInterval(interval);
  }, [taskID, detectStatus]);

  const renderUploadButton = () => {
    if (uploadStatus === 'uploading') {
      return <button disabled>Uploading...</button>;
    } else if (uploadStatus === 'success') {
      return <button disabled>Upload Successful!</button>;
    } else {
      return <button onClick={handleUpload}>Upload Video</button>;
    }
  };


// Inside the VideoUploadChunk component

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
        <p>Detecting: {detectProgress}%</p>
      )}
    </div>
  </div>
);
};

export default VideoUploadChunk;
