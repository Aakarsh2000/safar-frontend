import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import '../styles/RunSpeeds.css'; // Import CSS file

const RunSpeeds = () => {
    const { name } = useParams();
    const [data, setData] = useState([]);
    const [percentages, setPercentages] = useState({});
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const apiUrl = `http://127.0.0.1:5000/speeds/${name}`;
    const chartInstance = useRef(null); // Ref to hold the chart instance

    useEffect(() => {
        const fetchRunData = async () => {
          try {
            const response = await axios.get(apiUrl);
            setData(response.data.data);
            setPercentages(response.data.percentages)
          } catch (error) {
            setError('Error fetching run file.');
            console.error('Error fetching run file:', error);
          }
        };
        fetchRunData();
    }, [name]);

    useEffect(() => {
        // Ensure chartRef and percentages are ready
        if (chartRef.current && Object.keys(percentages).length > 0) {
            // Destroy previous chart instance if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Create new chart instance
            chartInstance.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(percentages),
                    datasets: [{
                        label: 'Percentage',
                        data: Object.values(percentages),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Clean up function to destroy chart instance on component unmount
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [percentages]);

    const tableRows = data.map((item, index) => (
        <tr key={index}>
            <td>{item.ID}</td>
            <td>{item.Category}</td>
            <td>{item.Speed}</td>
        </tr>
    ));

    return (
        <div className="run-speeds-container">
            <h1>Run Speeds Data</h1>
            <div className="chart-container">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="table-container">
                <table className="styled-table">
                <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Speed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
            <Link to="/run">
                <button>Back to Run List</button>
            </Link>
        </div>
    );
    
};

export default RunSpeeds;
