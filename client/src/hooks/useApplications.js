import { useState, useEffect } from 'react';
import { applicationService } from '../services/api/applicationService';

export const useApplications = (studentId) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadApplications();
    }
  }, [studentId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getStudentApplications(studentId);
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (applicationData) => {
    try {
      const newApplication = await applicationService.submitApplication(applicationData);
      setApplications(prev => [newApplication, ...prev]);
      return newApplication;
    } catch (err) {
      setError(err.message || 'Failed to submit application');
      throw err;
    }
  };

  const withdrawApplication = async (applicationId) => {
    try {
      await applicationService.withdrawApplication(applicationId);
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      setError(err.message || 'Failed to withdraw application');
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    submitApplication,
    withdrawApplication,
    refetch: loadApplications
  };
};