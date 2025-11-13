import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar/Navbar';
import './PendingApproval.css';

const PendingApproval = () => {
  const { userProfile } = useAuth();

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-content">
        <main className="main-content">
          <div className="pending-approval-container">
            <div className="pending-approval-card">
              <div className="pending-icon">⏳</div>
              <h1>Account Pending Approval</h1>
              <p className="pending-message">
                Your account is pending admin approval. You will be notified once your account has been approved.
              </p>
              <p className="pending-submessage">
                Some features may be limited until approval. Please check back later or contact support if you have questions.
              </p>
              <div className="pending-info">
                <p><strong>Account Status:</strong> {userProfile?.status || 'Pending'}</p>
                <p><strong>Role:</strong> {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PendingApproval;

