import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/common/Footer/Footer';
import './App.css';

function App() {
  // Catch any errors during render
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('App-level error:', event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ErrorBoundary>
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ModeProvider>
            <div className="App">
              <AppRoutes />
                <Footer />
            </div>
          </ModeProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;