import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handlers to catch and log all errors
window.addEventListener('error', (event) => {
  const error = event.error || new Error(event.message);
  console.error('❌ Global error caught:', error);
  console.error('Error message:', event.message || error.message);
  console.error('Error source:', event.filename, 'line', event.lineno, 'col', event.colno);
  console.error('Error stack:', error.stack);
  console.error('Full error object:', error);
  // Don't prevent default - let browser handle it normally
  // But ensure it's logged
  return false;
}, true); // Use capture phase

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  console.error('❌ Unhandled promise rejection:', reason);
  if (reason instanceof Error) {
    console.error('Error message:', reason.message);
    console.error('Error stack:', reason.stack);
  } else {
    console.error('Rejection reason:', reason);
  }
  console.error('Full rejection object:', reason);
  // Prevent default to avoid browser console suppression
  event.preventDefault();
}, true); // Use capture phase

// Override console methods to ensure they always work
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = function(...args) {
  originalError.apply(console, args);
  // Also log to window for debugging
  if (window.__consoleErrors) {
    window.__consoleErrors.push({ type: 'error', args, timestamp: new Date() });
  }
};

console.warn = function(...args) {
  originalWarn.apply(console, args);
  if (window.__consoleWarnings) {
    window.__consoleWarnings.push({ type: 'warn', args, timestamp: new Date() });
  }
};

console.log = function(...args) {
  originalLog.apply(console, args);
};

// Initialize error tracking arrays
window.__consoleErrors = [];
window.__consoleWarnings = [];

// Ensure console errors are always visible
if (typeof console !== 'undefined' && console.error) {
  console.log('✅ Console error handler initialized');
  console.log('✅ Error tracking enabled');
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
