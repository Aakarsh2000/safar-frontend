import React, { useState, useRef } from 'react';

const VideoUploadChunk = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskID, setTaskID] = useState(null); // Store the task ID for reference
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // Initial status

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
    } catch (error) {
      console.error(error);
      setUploadStatus('error'); // Handle upload errors
    } finally {
      setSelectedFile(null); // Reset state after upload
    }
  };

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
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />
      <br />
      {uploadStatus === 'pending' && <p>Preparing to upload...</p>}
      {uploadStatus === 'uploading' && (
        <div>
          <p>Uploading: {uploadProgress}%</p>
        </div>
      )}
      {renderUploadButton()}
    </div>
  );
};

export default VideoUploadChunk;
