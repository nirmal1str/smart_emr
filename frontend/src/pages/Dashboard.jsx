import React, { useEffect, useState } from 'react';
import { getPatients } from '../api/apiService';
import PatientListItem from '../components/PatientListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients();
        setPatients(response.data.patients);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch patients. Please check the backend server.");
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container"><ErrorMessage message={error} /></div>;

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