import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useNotification } from '../../../../hooks/useNotification';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { 
    notifications: contextNotifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotification(user?.uid);

  useEffect(() => {
    loadNotifications();
  }, [contextNotifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Use notifications from context or load separately
      setNotifications(contextNotifications || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_match':
        return '💼';
      case 'admission_decision':
        return '🎓';
      case 'application_update':
        return '📝';
      case 'system':
        return '🔔';
      default:
        return '📨';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'job_match':
        return 'Job Match';
      case 'admission_decision':
        return 'Admission Decision';
      case 'application_update':
        return 'Application Update';
      case 'system':
        return 'System Notification';
      default:
        return 'General';
    }
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated with your applications and opportunities</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Notification Stats and Controls */}
      <div className="notifications-header">
        <div className="notification-stats">
          <span className="total-count">{notifications.length} total</span>
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount} unread</span>
          )}
        </div>

        <div className="notification-actions">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="mark-all-read-btn"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="notification-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-btn ${filter === 'job_match' ? 'active' : ''}`}
          onClick={() => setFilter('job_match')}
        >
          Job Matches
        </button>
        <button 
          className={`filter-btn ${filter === 'admission_decision' ? 'active' : ''}`}
          onClick={() => setFilter('admission_decision')}
        >
          Admissions
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'all' 
                ? "You're all caught up! No notifications at the moment."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <span className="notification-type">
                    {getNotificationTypeLabel(notification.type)}
                  </span>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                <div className="notification-footer">
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                  
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        Mark Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences */}
      <div className="notification-preferences">
        <h3>Notification Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Job matches and recommendations
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Admission decisions
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Application status updates
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Platform announcements
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;