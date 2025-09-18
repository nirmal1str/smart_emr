import React from 'react';
import { Link } from 'react-router-dom';

const PatientListItem = ({ patient }) => (
  <Link to={`/patients/${patient.id}`} className="patient-list-item">
    <div className="card">
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{patient.name}</h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>DOB: {patient.dob}</p>
    </div>
  </Link>
);

export default PatientListItem;