import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../api/apiService';
import ErrorMessage from '../components/ErrorMessage';

const CreatePatient = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await createPatient({ name, dob });
      setLoading(false);
      navigate(`/patients/${response.data.id}`);
    } catch (err) {
      setLoading(false);
      setError("Failed to create patient. Please ensure all fields are valid.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '640px' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Add a New Patient</h1>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Patient Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="e.g., Jane Doe"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dob" className="form-label">Date of Birth</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="form-input"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Patient'}
        </button>
      </form>
    </div>
  );
};

export default CreatePatient;