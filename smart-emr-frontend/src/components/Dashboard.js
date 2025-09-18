import React from 'react';
import '../App.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Smart EMR Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <h2>Welcome, Doctor</h2>
        <p>This is your personalized dashboard for patient records and insights.</p>
        {/* You will add more components here later for patient lists, summaries, etc. */}
      </main>
    </div>
  );
};

export default Dashboard;