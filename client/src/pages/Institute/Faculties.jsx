import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {  institutionService } from '../../services/api/instituteService';
import Table from '../../components/ui/Table';

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dean: '',
    email: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      setLoading(true);
      const data = await instituteService.getFaculties();
      setFaculties(data);
    } catch (err) {
      setError(err.message || 'Failed to load faculties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await instituteService.addFaculty(formData);
      setSuccess('Faculty added successfully!');
      setFormData({ name: '', description: '', dean: '', email: '' });
      setShowAddForm(false);
      await loadFaculties();
    } catch (err) {
      setError(err.message || 'Failed to add faculty');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const deleteFaculty = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) {
      return;
    }

    try {
      await instituteService.deleteFaculty(facultyId);
      setSuccess('Faculty deleted successfully!');
      await loadFaculties();
    } catch (err) {
      setError(err.message || 'Failed to delete faculty');
    }
  };

  const columns = [
    {
      header: 'Faculty Name',
      key: 'name',
      width: '25%'
    },
    {
      header: 'Description',
      key: 'description',
      width: '35%',
      render: (row) => (
        <p className="faculty-description">{row.description}</p>
      )
    },
    {
      header: 'Dean',
      key: 'dean',
      width: '20%'
    },
    {
      header: 'Courses',
      key: 'courses',
      width: '10%',
      render: (row) => (
        <span className="course-count">{row.courseCount || 0}</span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '10%',
      render: (row) => (
        <div className="action-buttons">
          <button 
            className="edit-btn"
            onClick={() => editFaculty(row)}
          >
            Edit
          </button>
          <button 
            className="delete-btn"
            onClick={() => deleteFaculty(row.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const editFaculty = (faculty) => {
    // Implement edit functionality
    console.log('Edit faculty:', faculty);
  };

  return (
    <div className="faculties-page">
      <div className="page-header">
        <h1>Faculty Management</h1>
        <p>Manage your institution's faculties and departments</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="faculties-actions">
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-faculty-btn"
        >
          Add New Faculty
        </button>
      </div>

      {/* Add Faculty Form */}
      {showAddForm && (
        <div className="add-faculty-form">
          <h3>Add New Faculty</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Faculty Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dean">Dean Name</label>
                <input
                  type="text"
                  id="dean"
                  name="dean"
                  value={formData.dean}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the faculty and its focus areas..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Contact Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="cancel-button"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="save-button"
              >
                {saving ? 'Saving...' : 'Save Faculty'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculties Table */}
      <div className="faculties-table">
        <Table
          columns={columns}
          data={faculties}
          loading={loading}
          emptyMessage="No faculties found. Add your first faculty to get started."
        />
      </div>

      {/* Faculty Statistics */}
      <div className="faculty-stats">
        <h3>Faculty Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{faculties.length}</div>
            <div className="stat-label">Total Faculties</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {faculties.reduce((total, faculty) => total + (faculty.courseCount || 0), 0)}
            </div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {faculties.filter(f => f.dean).length}
            </div>
            <div className="stat-label">Faculties with Deans</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faculties;