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

    const [analysis, setAnalysis] = useState(null);
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
                color: 'rgb(156, 163, 175)',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                }
            },
            y: {
                ticks: {
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                }
            }
        }
    };


    if (loading) return <LoadingSpinner />;
    if (error) return <div className="max-w-4xl mx-auto p-6"><ErrorMessage message={error} /></div>;
    if (!patient) return <div className="max-w-4xl mx-auto p-6"><p className="text-gray-900 dark:text-gray-50">Patient not found.</p></div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{patient.name}</h1>
                <div className="flex space-x-4">
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-200">
                        ← Back to All Patients
                    </Link>
                    <button onClick={handleGetSummary} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition dark:bg-green-700 dark:hover:bg-green-600" disabled={summaryLoading}>
                        {summaryLoading ? 'Generating...' : 'Get AI Summary'}
                    </button>
                    <button onClick={handleGetAnalysis} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition dark:bg-purple-700 dark:hover:bg-purple-600" disabled={analysisLoading}>
                        {analysisLoading ? 'Analyzing...' : 'Get Predictive Analysis'}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 bg-white shadow-md rounded-xl p-5 dark:bg-gray-800">
                <div className="detail-item">
                    <span className="detail-label text-gray-500 dark:text-gray-400">Date of Birth</span>
                    <span className="detail-value text-gray-800 dark:text-gray-200">{patient.dob}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label text-gray-500 dark:text-gray-400">Gender</span>
                    <span className="detail-value text-gray-800 dark:text-gray-200">{patient.gender}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label text-gray-500 dark:text-gray-400">Blood Type</span>
                    <span className="detail-value text-gray-800 dark:text-gray-200">{patient.blood_type}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label text-gray-500 dark:text-gray-400">Contact</span>
                    <span className="detail-value text-gray-800 dark:text-gray-200">{patient.contact_number}</span>
                </div>
            </div>

            {(summaryLoading || summary) && (
                <div className="bg-white shadow-md rounded-xl p-5 dark:bg-gray-800 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">AI-Generated Summary</h2>
                    {summaryLoading ? (
                        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                            <LoadingSpinner />
                            <p>Analyzing notes...</p>
                        </div>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200">{summary}</p>
                    )}
                </div>
            )}
            
            {(analysisLoading || analysis) && (
                <div className="bg-white shadow-md rounded-xl p-5 dark:bg-gray-800 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">AI-Generated Predictive Analysis</h2>
                    {analysisLoading ? (
                        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
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

            <div className="bg-white shadow-md rounded-xl p-5 dark:bg-gray-800 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Clinical Notes</h2>
                <div className="space-y-4">
                    {patient.notes && patient.notes.length > 0 ? (
                        <ul className="notes-list space-y-3">
                            {patient.notes.map(note => (
                                <li key={note.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center dark:bg-gray-700">
                                    <span className="note-content text-gray-800 dark:text-gray-200">{note.content}</span>
                                    <button onClick={() => handleDeleteNote(note.id)} className="note-delete-button text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">&times;</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No clinical notes have been added for this patient.</p>
                    )}
                </div>
                <div className="mt-6">
                    <form onSubmit={handleNoteSubmit} className="flex flex-col space-y-4">
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            rows="4"
                            placeholder="Add a new clinical note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            Save Note
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;