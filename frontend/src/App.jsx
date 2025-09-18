import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import CreatePatient from './pages/CreatePatient';
import { FaUserMd, FaPlus } from 'react-icons/fa';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <Link to="/" className="header-logo">
            <FaUserMd style={{ marginRight: '0.5rem' }} /> EMR App
          </Link>
          <nav>
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
            <Link to="/create-patient" className="nav-button">
              <FaPlus style={{ marginRight: '0.5rem' }} /> New Patient
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-patient" element={<CreatePatient />} />
            <Route path="/patients/:patientId" element={<PatientDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;