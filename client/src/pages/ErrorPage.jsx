import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  const getErrorMessage = () => {
    if (error.status === 404) {
      return {
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        emoji: "🔍"
      };
    }

    if (error.status === 403) {
      return {
        title: "Access Denied",
        message: "You don't have permission to access this page.",
        emoji: "🚫"
      };
    }

    if (error.status === 500) {
      return {
        title: "Server Error",
        message: "Something went wrong on our end. Please try again later.",
        emoji: "⚙️"
      };
    }

    return {
      title: "Oops! Something went wrong",
      message: "An unexpected error has occurred. Please try again.",
      emoji: "😵"
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-emoji">{errorInfo.emoji}</div>
          <h1 className="error-title">{errorInfo.title}</h1>
          <p className="error-message">{errorInfo.message}</p>
          
          <div className="error-details">
            {error.status && (
              <p className="error-code">Error Code: {error.status}</p>
            )}
            {error.statusText && (
              <p className="error-text">{error.statusText}</p>
            )}
          </div>

          <div className="error-actions">
            <Link to="/" className="home-button">
              🏠 Go Home
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              🔄 Try Again
            </button>
            <Link to="/contact" className="support-button">
              💬 Contact Support
            </Link>
          </div>

          <div className="error-tips">
            <h3>While you're here, you might want to:</h3>
            <ul>
              <li>Check the URL for typos</li>
              <li>Go back to the previous page</li>
              <li>Visit our homepage</li>
              <li>Contact our support team if the problem persists</li>
            </ul>
          </div>
        </div>

        <div className="error-graphic">
          <div className="graphic-container">
            <div className="floating-element">🎓</div>
            <div className="floating-element">💼</div>
            <div className="floating-element">📚</div>
            <div className="floating-element">🚀</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;