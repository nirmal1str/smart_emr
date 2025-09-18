import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientDetails, addClinicalNote } from '../api/apiService'; // Import addClinicalNote
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PatientDetails = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState(''); // State for the textarea input

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

    // --- NEW: Function to handle form submission ---
    const handleNoteSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        if (newNote.trim() === '') return; // Don't submit empty notes

        try {
            const response = await addClinicalNote(patientId, newNote);
            // Add the new note to the patient's notes in the state to update the UI instantly
            setPatient(prevPatient => ({
                ...prevPatient,
                notes: [...prevPatient.notes, response.data]
            }));
            setNewNote(''); // Clear the textarea
        } catch (err) {
            console.error("Failed to add note:", err);
            setError("Could not save the new note. Please try again.");
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
                {/* --- NEW: The form for adding a new note --- */}
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

                {/* --- Existing list of notes --- */}
                {patient.notes && patient.notes.length > 0 ? (
                    <ul className="notes-list">
                        {patient.notes.map(note => (
                            <li key={note.id} className="note-item">
                                {note.content}
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