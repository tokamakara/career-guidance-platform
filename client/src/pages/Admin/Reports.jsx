import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/adminService';
import Table from '../../components/ui/Table';

const Reports = () => {
  const [reports, setReports] = useState({});
  const [selectedReport, setSelectedReport] = useState('applications');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [selectedReport, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsData = await adminService.getReports(selectedReport, dateRange);
      setReports(reportsData);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'applications', label: 'Course Applications' },
    { value: 'admissions', label: 'Admission Statistics' },
    { value: 'jobs', label: 'Job Applications' },
    { value: 'users', label: 'User Statistics' },
    { value: 'institutions', label: 'Institution Performance' }
  ];

  const getColumns = () => {
    switch (selectedReport) {
      case 'applications':
        return [
          { header: 'Institution', key: 'institutionName', width: '30%' },
          { header: 'Course', key: 'courseName', width: '30%' },
          { header: 'Applications', key: 'count', width: '20%' },
          { header: 'Status', key: 'status', width: '20%' }
        ];
      case 'admissions':
        return [
          { header: 'Institution', key: 'institutionName', width: '25%' },
          { header: 'Course', key: 'courseName', width: '25%' },
          { header: 'Applied', key: 'applied', width: '15%' },
          { header: 'Admitted', key: 'admitted', width: '15%' },
          { header: 'Rate', key: 'rate', width: '20%' }
        ];
      case 'jobs':
        return [
          { header: 'Company', key: 'companyName', width: '30%' },
          { header: 'Job Title', key: 'jobTitle', width: '30%' },
          { header: 'Applications', key: 'applications', width: '20%' },
          { header: 'Matches', key: 'matches', width: '20%' }
        ];
      default:
        return [];
    }
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const data = reports.data || [];
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport}_report_${dateRange.start}_to_${dateRange.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>System Reports</h1>
        <p>Comprehensive analytics and reporting</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select 
            value={selectedReport} 
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>

        <div className="control-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>

        <button onClick={exportToCSV} className="export-button">
          Export CSV
        </button>
      </div>

      <div className="report-summary">
        <h3>Report Summary</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">{reports.total || 0}</div>
            <div className="summary-label">Total Records</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reports.period || 'N/A'}</div>
            <div className="summary-label">Period</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reports.generatedAt ? new Date(reports.generatedAt).toLocaleDateString() : 'N/A'}</div>
            <div className="summary-label">Generated</div>
          </div>
        </div>
      </div>

      <div className="report-data">
        <h3>Report Data</h3>
        <Table
          columns={getColumns()}
          data={reports.data || []}
          loading={loading}
          emptyMessage="No data available for the selected report and date range"
        />
      </div>
    </div>
  );
};

export default Reports;