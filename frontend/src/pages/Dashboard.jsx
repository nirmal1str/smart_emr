import React, { useEffect, useState } from 'react';
import PatientListItem from '../components/PatientListItem'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { getPatients, deletePatient } from '../api/apiService'; // Import your api functions

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Using the apiService for consistency
        const response = await getPatients();
        setPatients(response.data);
      } catch (err) {
        setError("Failed to fetch patients. Make sure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // --- NEW HANDLER FUNCTION ---
  const handleDeletePatient = async (patientId) => {
    try {
      // 1. Call the API to delete the patient from the database
      await deletePatient(patientId);
      
      // 2. Update the UI state to remove the patient without a page refresh
      setPatients(currentPatients =>
        currentPatients.filter(patient => patient.id !== patientId)
      );
    } catch (err) {
      console.error("Failed to delete patient:", err);
      // Optionally set an error message to show the user
      setError("Failed to delete patient. Please try again.");
    }
  };

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
            <PatientListItem 
              key={patient.id} 
              patient={patient}
              // --- PASSING THE FUNCTION AS A PROP ---
              onDelete={handleDeletePatient} 
            />
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>No patients found. Add a new one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;