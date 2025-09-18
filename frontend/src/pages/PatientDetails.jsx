import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientDetails, addClinicalNote, deleteNote, getAiSummary, getPredictiveAnalysis } from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PatientDetails = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [analysis, setAnalysis] = useState(null); // Now stores the chart data object
    const [analysisLoading, setAnalysisLoading] = useState(false);

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
            setError("Could not save the new note. Please try again.");
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await deleteNote(patientId, noteId);
                setPatient(prevPatient => ({
                    ...prevPatient,
                    notes: prevPatient.notes.filter(note => note.id !== noteId)
                }));
            } catch (err) {
                setError("Could not delete the note. Please try again.");
            }
        }
    };

    const handleGetSummary = async () => {
        setSummaryLoading(true);
        setError(null);
        setSummary('');
        try {
            const response = await getAiSummary(patientId);
            setSummary(response.data.summary);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Failed to generate AI summary. Please try again.";
            setError(errorMessage);
        } finally {
            setSummaryLoading(false);
        }
    };
    
    const handleGetAnalysis = async () => {
        setAnalysisLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const response = await getPredictiveAnalysis(patientId);
            // The AI returns a JSON string, so we need to parse it
            const parsedData = JSON.parse(response.data.analysis);
            setAnalysis(parsedData);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Failed to generate predictive analysis. Please ensure patient has enough notes.";
            setError(errorMessage);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const chartData = analysis ? {
        labels: analysis.labels,
        datasets: [
            {
                label: 'Patient Health Score',
                data: analysis.data,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Patient Health Trend Over Time',
            },
        },
    };


    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container"><ErrorMessage message={error} /></div>;
    if (!patient) return <div className="container"><p>Patient not found.</p></div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">{patient.name}</h1>
                <div className="header-actions">
                    <Link to="/" className="nav-button-secondary">
                        ← Back to All Patients
                    </Link>
                    <button onClick={handleGetSummary} className="nav-button" disabled={summaryLoading}>
                        {summaryLoading ? 'Generating...' : 'Get AI Summary'}
                    </button>
                    <button onClick={handleGetAnalysis} className="nav-button" disabled={analysisLoading}>
                        {analysisLoading ? 'Analyzing...' : 'Get Predictive Analysis'}
                    </button>
                </div>
            </div>

            <div className="patient-details-grid">
                <div className="detail-item">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">{patient.dob}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">{patient.gender}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Blood Type</span>
                    <span className="detail-value">{patient.blood_type}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Contact</span>
                    <span className="detail-value">{patient.contact_number}</span>
                </div>
            </div>

            {(summaryLoading || summary) && (
                <div className="summary-section">
                    <h2>AI-Generated Summary</h2>
                    {summaryLoading ? (
                        <div className="summary-loading">
                            <LoadingSpinner />
                            <p>Analyzing notes...</p>
                        </div>
                    ) : (
                        <p className="summary-content">{summary}</p>
                    )}
                </div>
            )}
            
            {/* New section for predictive analysis chart */}
            {(analysisLoading || analysis) && (
                <div className="summary-section">
                    <h2>AI-Generated Predictive Analysis</h2>
                    {analysisLoading ? (
                        <div className="summary-loading">
                            <LoadingSpinner />
                            <p>Predicting trends...</p>
                        </div>
                    ) : (
                        analysis ? (
                            <div className="chart-container" style={{ width: '100%', height: '400px' }}>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        ) : null
                    )}
                </div>
            )}

            <div className="notes-section">
                <h2>Clinical Notes</h2>
                <form onSubmit={handleNoteSubmit} className="note-form">
                    <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a new clinical note..." className="note-textarea" rows="4"/>
                    <button type="submit" className="nav-button">Save Note</button>
                </form>
                {patient.notes && patient.notes.length > 0 ? (
                    <ul className="notes-list">
                        {patient.notes.map(note => (
                            <li key={note.id} className="note-item">
                                <span className="note-content">{note.content}</span>
                                <button onClick={() => handleDeleteNote(note.id)} className="note-delete-button">&times;</button>
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