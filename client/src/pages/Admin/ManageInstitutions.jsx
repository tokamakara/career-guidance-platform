import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../context/NotificationContext';
import './ManageEntities.css';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, suspended
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const institutionsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'institute');

      setInstitutions(institutionsData);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load institutions'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInstitutionStatus = async (institutionId, newStatus) => {
    try {
      await updateDoc(doc(db, 'users', institutionId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setInstitutions(prev =>
        prev.map(inst =>
          inst.id === institutionId ? { ...inst, status: newStatus } : inst
        )
      );

      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Institution status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update institution status'
      });
    }
  };

  const deleteInstitution = async (institutionId) => {
    if (!window.confirm('Are you sure you want to delete this institution?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', institutionId));
      // Also delete from institutions collection if exists
      await deleteDoc(doc(db, 'institutions', institutionId));
      
      setInstitutions(prev => prev.filter(inst => inst.id !== institutionId));

      addNotification({
        type: 'success',
        title: 'Institution Deleted',
        message: 'Institution has been removed from the system'
      });
    } catch (error) {
      console.error('Error deleting institution:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete institution'
      });
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    if (filter === 'all') return true;
    return inst.status === filter;
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
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    <div className="manage-entities">
      <div className="page-header">
        <h1>Manage Institutions</h1>
        <p>Approve, manage, and monitor educational institutions</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({institutions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({institutions.filter(i => i.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({institutions.filter(i => i.status === 'approved').length})
        </button>
        <button
          className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`}
          onClick={() => setFilter('suspended')}
        >
          Suspended ({institutions.filter(i => i.status === 'suspended').length})
        </button>
      </div>

      {/* Institutions Table */}
      <div className="entities-table">
        <table>
          <thead>
            <tr>
              <th>Institution Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstitutions.map(institution => (
              <tr key={institution.id}>
                <td>
                  <div className="entity-info">
                    <div className="entity-name">{institution.institutionName}</div>
                    <div className="entity-meta">{institution.location}</div>
                  </div>
                </td>
                <td>{institution.contactPerson}</td>
                <td>{institution.email}</td>
                <td>
                  <span className="type-badge">{institution.institutionType}</span>
                </td>
                <td>{getStatusBadge(institution.status)}</td>
                <td>
                  {institution.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    {institution.status === 'pending' && (
                      <>
                        <button
                          className="btn-success"
                          onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => updateInstitutionStatus(institution.id, 'suspended')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {institution.status === 'approved' && (
                      <button
                        className="btn-warning"
                        onClick={() => updateInstitutionStatus(institution.id, 'suspended')}
                      >
                        Suspend
                      </button>
                    )}
                    {institution.status === 'suspended' && (
                      <button
                        className="btn-success"
                        onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => deleteInstitution(institution.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInstitutions.length === 0 && (
          <div className="empty-state">
            <p>No institutions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInstitutions;