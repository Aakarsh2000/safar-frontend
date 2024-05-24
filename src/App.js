// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import VideoUploadPage from './components/VideoUploadPage';
import SeeResultsPage from './components/SeeResultsPage';
import ProcessingPage from './components/ProcessingPage';
import './styles.css';
import VideoUploadChunk from './components/VideoUploadChunk';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload-video" element={<VideoUploadPage />} />
        <Route path="/see-results" element={<SeeResultsPage />} />
        <Route path="/video/:taskId" element={<ProcessingPage />} />
        <Route path="/upload-chunk" element={<VideoUploadChunk />} />
      </Routes>
    </Router>
  );
}

export default App;
