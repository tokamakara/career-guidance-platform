import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handlers to catch and log all errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error message:', event.message);
  console.error('Error source:', event.filename, 'line', event.lineno, 'col', event.colno);
  // Don't prevent default - let browser handle it normally
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise rejection stack:', event.reason?.stack);
  // Prevent default to avoid browser console suppression
  event.preventDefault();
});

// Ensure console errors are always visible (don't override, just ensure they work)
// Check if console is available and working
if (typeof console !== 'undefined' && console.error) {
  // Test console.error is working
  console.log('✅ Console error handler initialized');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
