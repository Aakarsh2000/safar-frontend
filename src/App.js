// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import SeeResultsPage from './components/SeeResultsPage';
import './styles.css';
import VideoUploadChunk from './components/VideoUploadChunk';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload-video" element={<VideoUploadChunk />} />
        <Route path="/see-results" element={<SeeResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
