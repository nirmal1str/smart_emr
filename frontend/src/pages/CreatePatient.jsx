import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../api/apiService';
import ErrorMessage from '../components/ErrorMessage';

const CreatePatient = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const patientData = {
          name: name,
          dob: dob,
          gender: gender,
          blood_type: bloodType,
          contact_number: contactNumber
      };
      await createPatient(patientData);
      setLoading(false);
      navigate('/'); // Navigate to the dashboard after success
    } catch (err) {
      setLoading(false);
      setError("Failed to create patient. Please ensure all fields are valid.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10 dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-200">Add a New Patient</h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="e.g., Jane Doe" required disabled={loading}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Date of Birth
            </label>
            <input
              type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required disabled={loading}
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Gender
            </label>
            <select
              id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
              required disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Type */}
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Blood Type
            </label>
            <select
              id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
              required disabled={loading}
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option> <option value="A-">A-</option>
              <option value="B+">B+</option> <option value="B-">B-</option>
              <option value="AB+">AB+</option> <option value="AB-">AB-</option>
              <option value="O+">O+</option> <option value="O-">O-</option>
            </select>
          </div>

          {/* Contact Number (spans full width) */}
          <div className="md:col-span-2">
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Contact Number
            </label>
            <input
              type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="e.g., +91 98765 43210" required disabled={loading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 mt-6 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Patient Record'}
        </button>
      </form>
    </div>
  );
};

export default CreatePatient;