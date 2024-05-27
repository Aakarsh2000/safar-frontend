// src/components/RunDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../styles/RunDetail.css';

const RunDetail = () => {
  const { name } = useParams();
  const [runData, setRunData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRunData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/log-files/${name}`);
        setRunData(response.data);
      } catch (error) {
        setError('Error fetching run file.');
        console.error('Error fetching run file:', error);
      }
    };
    fetchRunData();
  }, [name]);

  return (
    <div className="run-detail-container">
      <h1>Run Details: {name}</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Frame Number</th>
              <th>Objects Detected</th>
              <th>Processing Time</th>
            </tr>
          </thead>
          <tbody>
            {runData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.frame_number}</td>
                <td>{entry.objects_detected}</td>
                <td>{entry.processing_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/run">
        <button>Back to Run List</button>
      </Link>
    </div>
  );
};

export default RunDetail;
