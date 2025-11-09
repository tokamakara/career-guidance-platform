import React from 'react';
import Navbar from '../components/common/Navbar/Navbar';
import './Layout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="auth-main">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;