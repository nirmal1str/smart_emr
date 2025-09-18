import React, { useEffect, useState } from 'react';
import PatientListItem from '../components/PatientListItem'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { getPatients, deletePatient } from '../api/apiService';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients();
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (err) {
        setError("Failed to fetch patients. Make sure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const handleDeletePatient = async (patientId) => {
    try {
      await deletePatient(patientId);
      setPatients(currentPatients =>
        currentPatients.filter(patient => patient.id !== patientId)
      );
    } catch (err) {
      console.error("Failed to delete patient:", err);
      setError("Failed to delete patient. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="max-w-3xl mx-auto"><ErrorMessage message={error} /></div>;

  return (
    <div className="max-w-5xl mx-auto mt-10">
      {/* Header with search bar and animated button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">All Patients</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="peer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-64 transition-all duration-300 ease-in-out"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <Link
            to="/create-patient"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-gray-200 animate-pulse-once"
          >
            + Add New Patient
          </Link>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div
              key={patient.id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition flex flex-col justify-between dark:bg-gray-800 transform hover:scale-105 duration-300"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{patient.name}</h2>
                <p className="text-gray-500 text-sm dark:text-gray-400">DOB: {patient.dob}</p>
              </div>
              <div className="mt-4 flex justify-between">
                <Link
                  to={`/patients/${patient.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-200"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDeletePatient(patient.id)}
                  className="text-red-500 hover:text-red-700 font-medium dark:text-red-400 dark:hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No patients found. Add a new one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;