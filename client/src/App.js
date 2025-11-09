import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ModeProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </ModeProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;