import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Force error to console - use multiple methods to ensure visibility
    console.error('🔴 Error caught by ErrorBoundary:', error);
    console.error('Error details:', errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log to console with full details
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack trace:', error.stack);
    }
    
    // Also log to window for debugging
    window.lastError = {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    };
    
    // Force console to show errors even if filtered
    setTimeout(() => {
      console.error('=== ERROR BOUNDARY ERROR ===');
      console.error('Error:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Refresh Page
            </button>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
              {this.state.error && this.state.error.toString()}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;