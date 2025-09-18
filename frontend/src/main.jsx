import React from 'react'; // It's good practice to import React as well
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './App.css'; // <<< THIS WAS THE MISSING LINE

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)