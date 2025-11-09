import React from 'react';
import Navbar from '../components/common/Navbar/Navbar';
import Sidebar from '../components/common/Sidebar/Sidebar';
import './Layout.css';

const InstituteLayout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InstituteLayout;