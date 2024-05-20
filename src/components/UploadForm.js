// src/components/UploadForm.js
import React from 'react';

const UploadForm = ({ handleFileChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
