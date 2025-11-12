import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAll(false); // Reset showAll when closing dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
    // You can add navigation logic here based on notification type
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return '📄';
      case 'admission': return '🎓';
      case 'job': return '💼';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    let date;
    
    // Handle different timestamp formats
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp object
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // String timestamp
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      // Number timestamp (milliseconds)
      date = new Date(timestamp);
    } else if (timestamp.seconds) {
      // Firestore Timestamp with seconds property
      date = new Date(timestamp.seconds * 1000);
    } else {
      // Fallback: try to create Date from the value
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    // For older notifications, show the actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              (showAll ? notifications : notifications.slice(0, 10)).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && !showAll && (
            <div className="notification-footer">
              <button 
                className="view-all"
                onClick={() => {
                  setShowAll(true);
                }}
              >
                View All Notifications ({notifications.length})
              </button>
            </div>
          )}
          {showAll && notifications.length > 10 && (
            <div className="notification-footer">
              <button 
                className="view-all"
                onClick={() => {
                  setShowAll(false);
                }}
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;