import React from 'react';
import { Link } from 'react-router-dom'; // Make sure Link is imported

const PatientListItem = ({ patient, onDelete }) => {
    // Modify handleDelete to accept the event object
    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevents the Link from being triggered
        e.preventDefault(); // Prevents any default browser action

        if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
            await onDelete(patient.id);
        }
    };

    return (
        // Wrap the whole card in a Link component
        <Link to={`/patients/${patient.id}`} className="patient-card-link">
            <div className="patient-card">
                <div>
                    <h4>{patient.name}</h4>
                    <p>DOB: {patient.dob}</p>
                </div>
                {/* The onClick now passes the event 'e' to the handler */}
                <button className="delete-button" onClick={handleDelete}>
                    Delete
                </button>
            </div>
        </Link>
    );
};

export default PatientListItem;