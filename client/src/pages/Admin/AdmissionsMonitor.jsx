import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/adminService';
import Table from '../../components/ui/Table';

const AdmissionsMonitor = () => {
  const [admissions, setAdmissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdmissionsData();
  }, []);

  const loadAdmissionsData = async () => {
    try {
      setLoading(true);
      const [admissionsData, statsData] = await Promise.all([
        adminService.getAdmissionsReport(),
        adminService.getDashboardStats()
      ]);
      
      setAdmissions(admissionsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load admissions data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Institution',
      key: 'institutionName',
      width: '25%'
    },
    {
      header: 'Course',
      key: 'courseName',
      width: '25%'
    },
    {
      header: 'Applications',
      key: 'totalApplications',
      width: '15%',
      render: (row) => (
        <span className={`count ${row.totalApplications > 50 ? 'high' : ''}`}>
          {row.totalApplications}
        </span>
      )
    },
    {
      header: 'Admitted',
      key: 'admitted',
      width: '15%',
      render: (row) => (
        <span className="admitted-count">{row.admitted || 0}</span>
      )
    },
    {
      header: 'Waitlist',
      key: 'waitlist',
      width: '15%',
      render: (row) => (
        <span className="waitlist-count">{row.waitlist || 0}</span>
      )
    }
  ];

  return (
    <div className="admissions-monitor">
      <div className="page-header">
        <h1>Admissions Monitor</h1>
        <p>Monitor admission statistics across all institutions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalApplications || 0}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalAdmitted || 0}</div>
          <div className="stat-label">Total Admitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInstitutions || 0}</div>
          <div className="stat-label">Active Institutions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.admissionRate || '0%'}</div>
          <div className="stat-label">Admission Rate</div>
        </div>
      </div>

      <div className="admissions-table">
        <h3>Admission Statistics by Institution</h3>
        <Table
          columns={columns}
          data={admissions}
          loading={loading}
          emptyMessage="No admission data available"
        />
      </div>

      <div className="admissions-insights">
        <h3>Admission Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Top Courses</h4>
            <ul>
              {admissions
                .sort((a, b) => b.totalApplications - a.totalApplications)
                .slice(0, 5)
                .map((item, index) => (
                  <li key={index}>
                    <span className="course-name">{item.courseName}</span>
                    <span className="application-count">{item.totalApplications} apps</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <div className="insight-card">
            <h4>Institutions with Most Applications</h4>
            <ul>
              {Array.from(new Set(admissions.map(a => a.institutionName)))
                .map(institution => {
                  const institutionApps = admissions
                    .filter(a => a.institutionName === institution)
                    .reduce((sum, a) => sum + a.totalApplications, 0);
                  
                  return { institution, total: institutionApps };
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((item, index) => (
                  <li key={index}>
                    <span className="institution-name">{item.institution}</span>
                    <span className="application-count">{item.total} apps</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsMonitor;