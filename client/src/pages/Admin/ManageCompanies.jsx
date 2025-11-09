import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../context/NotificationContext';
import './ManageEntities.css';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const companiesData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'company');

      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load companies'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId, newStatus) => {
    try {
      await updateDoc(doc(db, 'users', companyId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setCompanies(prev =>
        prev.map(company =>
          company.id === companyId ? { ...company, status: newStatus } : company
        )
      );

      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Company status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating company:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update company status'
      });
    }
  };

  const deleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', companyId));
      // Also delete from companies collection if exists
      await deleteDoc(doc(db, 'companies', companyId));
      
      setCompanies(prev => prev.filter(company => company.id !== companyId));

      addNotification({
        type: 'success',
        title: 'Company Deleted',
        message: 'Company has been removed from the system'
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete company'
      });
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    return company.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      approved: { class: 'badge-success', text: 'Approved' },
      suspended: { class: 'badge-danger', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <div className="manage-entities">
      <div className="page-header">
        <h1>Manage Companies</h1>
        <p>Approve, manage, and monitor employer accounts</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({companies.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({companies.filter(c => c.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({companies.filter(c => c.status === 'approved').length})
        </button>
        <button
          className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`}
          onClick={() => setFilter('suspended')}
        >
          Suspended ({companies.filter(c => c.status === 'suspended').length})
        </button>
      </div>

      {/* Companies Table */}
      <div className="entities-table">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Status</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>
                  <div className="entity-info">
                    <div className="entity-name">{company.companyName}</div>
                    <div className="entity-meta">{company.location}</div>
                  </div>
                </td>
                <td>
                  <span className="industry-badge">{company.industry}</span>
                </td>
                <td>{company.contactPerson}</td>
                <td>{company.email}</td>
                <td>{getStatusBadge(company.status)}</td>
                <td>
                  {company.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    {company.status === 'pending' && (
                      <>
                        <button
                          className="btn-success"
                          onClick={() => updateCompanyStatus(company.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => updateCompanyStatus(company.id, 'suspended')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {company.status === 'approved' && (
                      <button
                        className="btn-warning"
                        onClick={() => updateCompanyStatus(company.id, 'suspended')}
                      >
                        Suspend
                      </button>
                    )}
                    {company.status === 'suspended' && (
                      <button
                        className="btn-success"
                        onClick={() => updateCompanyStatus(company.id, 'approved')}
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => deleteCompany(company.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCompanies.length === 0 && (
          <div className="empty-state">
            <p>No companies found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCompanies;