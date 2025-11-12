import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/adminService';
import { useNotification } from '../../context/NotificationContext';
import { exportToCSV, formatDateRangeForFilename } from '../../utils/exportUtils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Analytics.css';
import '../../components/common/SkeletonLoader.css';

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d'];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('institute'); // 'institute', 'company', 'combined'
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    loadAnalytics();
  }, [activeTab, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      switch (activeTab) {
        case 'institute':
          response = await adminService.getInstituteAnalytics(dateRange);
          break;
        case 'company':
          response = await adminService.getCompanyAnalytics(dateRange);
          break;
        case 'combined':
          response = await adminService.getCombinedAnalytics(dateRange);
          break;
        default:
          response = await adminService.getInstituteAnalytics(dateRange);
      }

      if (response.success) {
        setAnalytics(response.data || {});
        
        if (Object.keys(response.data || {}).length === 0) {
          addNotification({
            type: 'info',
            title: 'No Data',
            message: 'No analytics data available for the selected criteria'
          });
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load analytics';
      setError(errorMessage);
      setAnalytics({});
      
      addNotification({
        type: 'error',
        title: 'Failed to Load Analytics',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareStatusChartData = () => {
    if (!analytics.statusBreakdown) return [];
    
    return Object.entries(analytics.statusBreakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
      value: value
    }));
  };

  const prepareTopInstitutionsData = () => {
    if (!analytics.topInstitutions || !Array.isArray(analytics.topInstitutions)) return [];
    
    return analytics.topInstitutions.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      applications: item.count
    }));
  };

  const prepareTopCoursesData = () => {
    if (!analytics.popularCourses || !Array.isArray(analytics.popularCourses)) return [];
    
    return analytics.popularCourses.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      applications: item.count
    }));
  };

  const prepareTopCompaniesData = () => {
    if (!analytics.topCompanies || !Array.isArray(analytics.topCompanies)) return [];
    
    return analytics.topCompanies.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      applications: item.count
    }));
  };

  const preparePopularJobTypesData = () => {
    if (!analytics.popularJobTypes || !Array.isArray(analytics.popularJobTypes)) return [];
    
    return analytics.popularJobTypes.map(item => ({
      name: item.title || item.type || 'Unknown',
      applications: item.count
    }));
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p>Comprehensive analytics and insights across the platform</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab-button ${activeTab === 'institute' ? 'active' : ''}`}
          onClick={() => setActiveTab('institute')}
        >
          Institute Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'combined' ? 'active' : ''}`}
          onClick={() => setActiveTab('combined')}
        >
          Combined Analytics
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter-section">
        <div className="date-filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div className="date-filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <button
          onClick={() => setDateRange({ startDate: '', endDate: '' })}
          className="btn-clear-filter"
        >
          Clear Date Filter
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="metrics-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-stat-card">
                <div className="skeleton-stat-icon"></div>
                <div className="skeleton-stat-content">
                  <div className="skeleton-line skeleton-stat-value"></div>
                  <div className="skeleton-line skeleton-stat-label"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="charts-section">
            <div className="skeleton-chart">
              <div className="skeleton-chart-header">
                <div className="skeleton-line skeleton-chart-title"></div>
              </div>
              <div className="skeleton-chart-content">
                <div className="skeleton-chart-bars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton-chart-bar" style={{ height: `${60 + Math.random() * 40}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            {activeTab === 'institute' && (
              <>
                <div className="metric-card">
                  <div className="metric-label">Total Applications</div>
                  <div className="metric-value">{analytics.totalApplications || 0}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Admission Rate</div>
                  <div className="metric-value success">{analytics.admissionRate || 0}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Rejection Rate</div>
                  <div className="metric-value danger">{analytics.rejectionRate || 0}%</div>
                </div>
              </>
            )}
            {activeTab === 'company' && (
              <>
                <div className="metric-card">
                  <div className="metric-label">Total Applications</div>
                  <div className="metric-value">{analytics.totalApplications || 0}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Qualification Rate</div>
                  <div className="metric-value success">{analytics.qualificationRate || 0}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Rejection Rate</div>
                  <div className="metric-value danger">{analytics.rejectionRate || 0}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Average Match Score</div>
                  <div className="metric-value info">{analytics.averageMatchScore || 0}%</div>
                </div>
              </>
            )}
            {activeTab === 'combined' && (
              <>
                <div className="metric-card">
                  <div className="metric-label">Total Applications</div>
                  <div className="metric-value">{analytics.totalApplications || 0}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Education Applications</div>
                  <div className="metric-value">{analytics.education?.total || 0}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Job Applications</div>
                  <div className="metric-value">{analytics.job?.total || 0}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Education Admission Rate</div>
                  <div className="metric-value success">{analytics.education?.admissionRate || 0}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Job Qualification Rate</div>
                  <div className="metric-value success">{analytics.job?.qualificationRate || 0}%</div>
                </div>
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Status Breakdown Chart */}
            {analytics.statusBreakdown && Object.keys(analytics.statusBreakdown).length > 0 && (
              <div className="chart-container">
                <h3>Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareStatusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Institutions Chart */}
            {activeTab === 'institute' && analytics.topInstitutions && analytics.topInstitutions.length > 0 && (
              <div className="chart-container">
                <h3>Top Institutions by Applications</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareTopInstitutionsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Popular Courses Chart */}
            {activeTab === 'institute' && analytics.popularCourses && analytics.popularCourses.length > 0 && (
              <div className="chart-container">
                <h3>Popular Courses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareTopCoursesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#28a745" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Companies Chart */}
            {activeTab === 'company' && analytics.topCompanies && analytics.topCompanies.length > 0 && (
              <div className="chart-container">
                <h3>Top Companies by Applications</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareTopCompaniesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Popular Job Types Chart */}
            {activeTab === 'company' && analytics.popularJobTypes && analytics.popularJobTypes.length > 0 && (
              <div className="chart-container">
                <h3>Popular Job Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={preparePopularJobTypesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#ffc107" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Combined Analytics Comparison */}
            {activeTab === 'combined' && (
              <div className="chart-container">
                <h3>Education vs Job Applications Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Education', applications: analytics.education?.total || 0 },
                    { name: 'Jobs', applications: analytics.job?.total || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Statistics Table */}
          {analytics.statusBreakdown && (
            <div className="stats-table-section">
              <div className="stats-table-header">
                <h3>Detailed Statistics</h3>
                <button
                  onClick={() => {
                    try {
                      const statsData = Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                        const total = analytics.totalApplications || 1;
                        const percentage = ((count / total) * 100).toFixed(2);
                        return {
                          Status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
                          Count: count,
                          Percentage: `${percentage}%`
                        };
                      });
                      const filename = `${activeTab}_analytics_${formatDateRangeForFilename(dateRange.startDate, dateRange.endDate)}`;
                      exportToCSV(statsData, filename);
                      addNotification({
                        type: 'success',
                        title: 'Export Successful',
                        message: 'Analytics exported to CSV successfully'
                      });
                    } catch (error) {
                      addNotification({
                        type: 'error',
                        title: 'Export Failed',
                        message: error.message || 'Failed to export analytics'
                      });
                    }
                  }}
                  className="btn-export-csv"
                >
                  Export Statistics CSV
                </button>
              </div>
              <div className="stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                      const total = analytics.totalApplications || 1;
                      const percentage = ((count / total) * 100).toFixed(2);
                      return (
                        <tr key={status}>
                          <td>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</td>
                          <td>{count}</td>
                          <td>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && Object.keys(analytics).length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No Analytics Data Available</h3>
              <p>
                {dateRange.startDate || dateRange.endDate
                  ? 'No data found for the selected date range. Try adjusting your filters.'
                  : 'No analytics data available yet. Data will appear as applications are submitted.'}
              </p>
              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  className="btn-clear-filters"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;

