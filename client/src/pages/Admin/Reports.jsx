import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/adminService';
import Table from '../../components/ui/Table';
import { useNotification } from '../../context/NotificationContext';
import { exportToExcel, formatDateRangeForFilename } from '../../utils/exportUtils';

const Reports = () => {
  const [reports, setReports] = useState({});
  const [selectedReport, setSelectedReport] = useState('applications');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadReports();
  }, [selectedReport, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const reportsData = await adminService.getReports(selectedReport, dateRange);
      
      // Handle response format
      if (reportsData && reportsData.success !== false) {
        // Set reports with proper structure
        setReports({
          data: Array.isArray(reportsData.data) ? reportsData.data : [],
          total: reportsData.total || 0,
          period: reportsData.period || 'N/A',
          generatedAt: reportsData.generatedAt
        });
      } else {
        setReports({
          data: [],
          total: 0,
          period: 'N/A',
          generatedAt: null
        });
        setError(reportsData?.message || 'No data available for the selected report');
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      const errorMessage = err.message || 'Failed to load reports';
      setError(errorMessage);
      // Set empty reports structure
      setReports({
        data: [],
        total: 0,
        period: 'N/A',
        generatedAt: null
      });
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

  const handleExportPDF = async () => {
    try {
      const data = Array.isArray(reports.data) ? reports.data : [];
      if (data.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No data to export'
        });
        return;
      }

      // For now, we'll use a simple approach - generate PDF on client side
      // In the future, this could call a backend endpoint
      addNotification({
        type: 'info',
        title: 'PDF Export',
        message: 'PDF export feature coming soon. Please use Excel export for now.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export report'
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const data = Array.isArray(reports.data) ? reports.data : [];
      if (data.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No data to export'
        });
        return;
      }

      const filename = `${selectedReport}_report_${formatDateRangeForFilename(dateRange.start, dateRange.end)}`;
      exportToExcel(data, filename, getColumns());
      
      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Report exported to Excel successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export report'
      });
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>System Reports</h1>
        <p>Comprehensive analytics and reporting</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="report-controls">
        <div className="controls-row">
          <div className="control-group">
            <label>Report Type:</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
              className="report-type-select"
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

          <div className="export-buttons">
            <button onClick={handleExportExcel} className="export-button btn-export-excel" disabled={loading || !Array.isArray(reports.data) || reports.data.length === 0}>
              Export Excel
            </button>
            <button onClick={handleExportPDF} className="export-button btn-export-pdf" disabled={loading || !Array.isArray(reports.data) || reports.data.length === 0}>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="report-summary">
        <h3>Report Summary</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">{reports.total || (reports.data && reports.data.length) || 0}</div>
            <div className="summary-label">Total Records</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {dateRange.start && dateRange.end 
                ? `${new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'N/A'}
            </div>
            <div className="summary-label">Period</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {reports.generatedAt 
                ? new Date(reports.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
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