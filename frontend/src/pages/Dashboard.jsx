import React, { useEffect, useState } from 'react';
// We might need to adjust these import paths based on your teammate's file structure
import PatientListItem from '../components/PatientListItem'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This useEffect hook runs once when the component first loads
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // ** THE MAGIC HAPPENS HERE **
        // We are calling your backend API to get the real patient list.
        // Note: We use the full URL because the frontend and backend are on different ports.
        const response = await fetch('http://127.0.0.1:5000/api/patients');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setPatients(data); // Set the state with the real data from the backend
        
      } catch (err) {
        // If the API call fails, we set an error message
        setError("Failed to fetch patients. Make sure the backend server is running.");
      } finally {
        // This runs whether the call succeeds or fails
        setLoading(false);
      }
    };

    fetchPatients();
  }, []); // The empty array [] means this effect runs only once on mount

  // Conditional rendering based on the state
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container"><ErrorMessage message={error} /></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">All Patients</h1>
        <Link to="/create-patient" className="nav-button">
          + Add New Patient
        </Link>
      </div>
      <div className="patient-grid">
        {patients.length > 0 ? (
          patients.map(patient => (
            <PatientListItem key={patient.id} patient={patient} />
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>No patients found. Add a new one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;