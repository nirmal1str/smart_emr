import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientDetails, addClinicalNote, getAiSummary } from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await getPatientDetails(patientId);
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch patient details. The patient might not exist.");
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await addClinicalNote(patientId, noteContent);
      setPatient(response.data);
      setNoteContent('');
      setIsAddingNote(false);
    } catch (err) {
      alert("Failed to add note.");
      setIsAddingNote(false);
    }
  };

  const handleGetSummary = async () => {
    setIsFetchingSummary(true);
    try {
      const response = await getAiSummary(patientId);
      setSummary(response.data.summary);
      setIsFetchingSummary(false);
    } catch (err) {
      alert("Failed to get AI summary.");
      setIsFetchingSummary(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container"><ErrorMessage message={error} /></div>;
  if (!patient) return null;

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>{patient.name}</h1>
        <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Date of Birth: {patient.dob}</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>Clinical Notes</h2>
        <form onSubmit={handleAddNote} style={{ marginBottom: '1rem' }}>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="form-textarea"
            rows="4"
            placeholder="Add a new clinical note..."
            disabled={isAddingNote}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
            disabled={isAddingNote}
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </button>
        </form>
        <ul className="notes-list" style={{ marginTop: '1rem', padding: '0' }}>
          {patient.notes.length > 0 ? (
            patient.notes.map((note, index) => (
              <li key={index} className="note-item" style={{ marginBottom: '0.5rem' }}>
                <p style={{ color: '#374151' }}>{note}</p>
              </li>
            ))
          ) : (
            <p style={{ color: '#6b7280' }}>No clinical notes available.</p>
          )}
        </ul>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>AI Summary</h2>
        <button
          onClick={handleGetSummary}
          className="btn btn-secondary"
          disabled={isFetchingSummary}
        >
          {isFetchingSummary ? 'Generating...' : 'Generate AI Summary'}
        </button>
        {summary && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p style={{ color: '#374151' }}>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;