import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import CreatePatient from './pages/CreatePatient'; // 1. Import the component

function App() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients/:patientId" element={<PatientDetails />} />
          
          {/* 2. Add this new route for the create patient page */}
          <Route path="/create-patient" element={<CreatePatient />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;