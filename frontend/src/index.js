import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './mejoras.css';   // ← NO tocar, es read-only
import './darkmode.css';  // ← NUEVO: modo oscuro área blanca
import App from './AppNuevo';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
