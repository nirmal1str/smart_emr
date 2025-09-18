import React from 'react';
import { Link } from 'react-router-dom';

const PatientListItem = ({ patient, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg transition">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {patient.name}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Date of Birth: {patient.dob}
      </p>

      <div className="flex justify-between items-center">
        <Link
          to={`/patients/${patient.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition"
        >
          View Details →
        </Link>
        <button
          onClick={() => onDelete(patient.id)}
          className="text-red-500 hover:text-red-700 font-medium transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PatientListItem;
