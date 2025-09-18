import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreatePatient from './pages/CreatePatient';
import PatientDetails from './pages/PatientDetails';

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 min-h-screen transition-colors duration-300">
        <button onClick={toggleTheme} className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg z-50">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <main className="transition-opacity duration-500 ease-in-out">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients/:patientId" element={<PatientDetails />} />
            <Route path="/create-patient" element={<CreatePatient />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;