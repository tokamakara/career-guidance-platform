import { useState, useEffect } from 'react';
import { jobService } from '../services/api/jobService';

export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Apply filters
    if (filters.company) {
      filtered = filtered.filter(job => 
        job.companyName?.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.title) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.industry) {
      filtered = filtered.filter(job => 
        job.industry === filters.industry
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minSalary) {
      filtered = filtered.filter(job =>
        job.salary >= filters.minSalary
      );
    }

    setFilteredJobs(filtered);
  };

  const applyToJob = async (jobId, applicationData) => {
    try {
      const result = await jobService.applyToJob(jobId, applicationData);
      await loadJobs(); // Reload to get updated application status
      return result;
    } catch (err) {
      setError(err.message || 'Failed to apply to job');
      throw err;
    }
  };

  const getJobMatches = async (studentId) => {
    try {
      const matches = await jobService.getJobMatches(studentId);
      return matches;
    } catch (err) {
      setError(err.message || 'Failed to get job matches');
      throw err;
    }
  };

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    loading,
    error,
    applyToJob,
    getJobMatches,
    refetch: loadJobs
  };
};