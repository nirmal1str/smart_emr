import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getPatients = () => api.get('/patients');
export const createPatient = (patientData) => api.post('/patients', patientData);
export const getPatientDetails = (patientId) => api.get(`/patients/${patientId}`);
export const addClinicalNote = (patientId, noteContent) => api.post(`/patients/${patientId}/notes`, { content: noteContent });
export const getAiSummary = (patientId) => api.get(`/patients/${patientId}/summary-perplexity`);
export const getPredictiveAnalysis = (patientId) => api.get(`/patients/${patientId}/predictive-analysis-perplexity`);
export const deletePatient = (patientId) => api.delete(`/patients/${patientId}`);
export const deleteNote = (patientId, noteId) => api.delete(`/patients/${patientId}/notes/${noteId}`);