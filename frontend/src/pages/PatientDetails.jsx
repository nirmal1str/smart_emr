import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientDetails, addClinicalNote, deleteClinicalNote } from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PatientDetails = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await getPatientDetails(patientId);
                setPatient(response.data);
            } catch (err) {
                setError("Failed to fetch patient details.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [patientId]);

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (newNote.trim() === '') return;
        try {
            const response = await addClinicalNote(patientId, newNote);
            setPatient(prevPatient => ({
                ...prevPatient,
                notes: [...prevPatient.notes, response.data]
            }));
            setNewNote('');
        } catch (err) {
            console.error("Failed to add note:", err);
            setError("Could not save the new note. Please try again.");
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await deleteClinicalNote(patientId, noteId);
                setPatient(prevPatient => ({
                    ...prevPatient,
                    notes: prevPatient.notes.filter(note => note.id !== noteId)
                }));
            } catch (err) {
                console.error("Failed to delete note:", err);
                setError("Could not delete the note. Please try again.");
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container"><ErrorMessage message={error} /></div>;
    if (!patient) return <div className="container"><p>Patient not found.</p></div>;

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{patient.name}</h1>
                    <p className="page-subtitle">Date of Birth: {patient.dob}</p>
                </div>
                <Link to="/" className="nav-button-secondary">
                    ← Back to All Patients
                </Link>
            </div>

            <div className="notes-section">
                <h2>Clinical Notes</h2>
                <form onSubmit={handleNoteSubmit} className="note-form">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new clinical note..."
                        className="note-textarea"
                        rows="4"
                    />
                    <button type="submit" className="nav-button">
                        Save Note
                    </button>
                </form>

                {patient.notes && patient.notes.length > 0 ? (
                    <ul className="notes-list">
                        {patient.notes.map(note => (
                            <li key={note.id} className="note-item">
                                <span className="note-content">{note.content}</span>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="note-delete-button"
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No clinical notes have been added for this patient.</p>
                )}
            </div>
        </div>
    );
};

export default PatientDetails;