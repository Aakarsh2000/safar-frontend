import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import '../styles/RunDetail.css';

const RunDetail = () => {
  const { name } = useParams();
  const [runData, setRunData] = useState([]);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(19);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [objectTypes, setObjectTypes] = useState([]);

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

  useEffect(() => {
    if (!chartRef.current || runData.length === 0) return;

    const labels = runData.slice(startIndex, endIndex + 1).map(entry => entry.frame_number);

    const objectTypesSet = new Set();
    runData.slice(startIndex, endIndex + 1).forEach(entry => {
      entry.objects_detected.split(',').forEach(object => {
        const objectType = object.trim().split(' ')[1];
        objectTypesSet.add(objectType);
      });
    });
    const objectTypesArray = Array.from(objectTypesSet);

    setObjectTypes(objectTypesArray);

    const datasets = objectTypesArray.map(type => {
      const data = runData.slice(startIndex, endIndex + 1).map(entry => {
        const objectCount = entry.objects_detected.split(',').find(obj => obj.includes(type));
        const count = objectCount ? parseInt(objectCount.trim().split(' ')[0]) : null;
        return count !== 0 ? count : null;
      });

      return {
        label: type,
        data: data,
        borderColor: getRandomColor(),
        fill: false,
      };
    });

    if (chartInstance.current) {
      chartInstance.current.data.labels = labels;
      chartInstance.current.data.datasets = datasets;
      chartInstance.current.update();
    } else {
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            }
          }
        }
      });
    }
  }, [runData, startIndex, endIndex]);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handlePrevious = () => {
    if (startIndex >= 20) {
      setStartIndex(startIndex - 20);
      setEndIndex(endIndex - 20);
    }
  };

  const handleNext = () => {
    if (endIndex < runData.length - 1) {
      setStartIndex(startIndex + 20);
      setEndIndex(endIndex + 20);
    }
  };

  return (
    <div className="run-detail-container">
      <h1>Run Details: {name}</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="object-types">
            <h3>Objects Detected:</h3>
            {objectTypes.map((type, index) => (
              <span key={index}>{type}{index !== objectTypes.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="table-container">
            <button onClick={handlePrevious} disabled={startIndex < 20}>Previous</button>
            <button onClick={handleNext} disabled={endIndex >= runData.length - 1}>Next</button>
            <table>
              <thead>
                <tr>
                  <th>Frame Number</th>
                  <th>Objects Detected</th>
                  <th>Processing Time</th>
                </tr>
              </thead>
              <tbody>
                {runData.slice(startIndex, endIndex + 1).map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.frame_number}</td>
                    <td>{entry.objects_detected}</td>
                    <td>{entry.processing_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Link to="/run">
        <button>Back to Run List</button>
      </Link>
    </div>
  );
};

export default RunDetail;
