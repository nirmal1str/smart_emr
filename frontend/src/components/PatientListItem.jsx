import React from 'react';

const PatientListItem = ({ patient, onDelete }) => {
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
            await onDelete(patient.id);
        }
    };

    return (
        <div className="patient-card">
            <h4>{patient.name}</h4>
            <p>DOB: {patient.dob}</p>
            <button className="delete-button" onClick={handleDelete}>
                Delete Patient
            </button>
        </div>
    );
};

export default PatientListItem;