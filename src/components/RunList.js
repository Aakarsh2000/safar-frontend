// src/components/RunList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/RunList.css';

const RunList = () => {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/log-files');
        setRuns(response.data);
      } catch (error) {
        console.error('Error fetching run files:', error);
      }
    };
    fetchRuns();
  }, []);

  return (
    <div className="run-list-container">
      <h1>Run List</h1>
      <ul>
        {runs.map(run => (
          <li key={run}>
            {run}: 
            <Link to={`/run/run-details/${run}`} className="custom-link">Details</Link>
            <Link to={`/run/run-speeds/${run}`} className="custom-link">Speeds</Link>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default RunList;
