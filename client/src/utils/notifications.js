// Notification utilities

import { NOTIFICATION_TYPES } from './constants';

/**
 * Create notification object
 */
export const createNotification = (type, title, message, options = {}) => {
  return {
    id: options.id || generateNotificationId(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    ...options
  };
};

/**
 * Generate unique notification ID
 */
export const generateNotificationId = () => {
  return `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create job match notification
 */
export const createJobMatchNotification = (jobTitle, companyName, matchScore, jobId) => {
  return createNotification(
    NOTIFICATION_TYPES.JOB_MATCH,
    `New Job Match - ${matchScore}%`,
    `You have a ${matchScore}% match for "${jobTitle}" at ${companyName}`,
    { relatedId: jobId, priority: 'high' }
  );
};

/**
 * Create admission decision notification
 */
export const createAdmissionNotification = (institutionName, courseName, status, applicationId) => {
  const statusText = status === 'admitted' ? 'admitted' : 
                    status === 'rejected' ? 'not accepted' : 
                    'waitlisted';
  
  return createNotification(
    NOTIFICATION_TYPES.ADMISSION_DECISION,
    `Admission Decision - ${institutionName}`,
    `Your application for ${courseName} has been ${statusText}`,
    { relatedId: applicationId, priority: 'high' }
  );
};

/**
 * Create application update notification
 */
export const createApplicationUpdateNotification = (applicationType, itemName, status, applicationId) => {
  return createNotification(
    NOTIFICATION_TYPES.APPLICATION_UPDATE,
    `Application Update - ${applicationType}`,
    `Your ${applicationType.toLowerCase()} for "${itemName}" is now ${status}`,
    { relatedId: applicationId, priority: 'medium' }
  );
};

/**
 * Create system notification
 */
export const createSystemNotification = (title, message, options = {}) => {
  return createNotification(
    NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    { priority: options.priority || 'low', ...options }
  );
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.JOB_MATCH]: '💼',
    [NOTIFICATION_TYPES.ADMISSION_DECISION]: '🎓',
    [NOTIFICATION_TYPES.APPLICATION_UPDATE]: '📝',
    [NOTIFICATION_TYPES.SYSTEM]: '🔔',
    [NOTIFICATION_TYPES.GENERAL]: '📨'
  };
  
  return icons[type] || '📨';
};

/**
 * Get notification color based on type and priority
 */
export const getNotificationColor = (type, priority = 'medium') => {
  const colorMap = {
    high: {
      [NOTIFICATION_TYPES.JOB_MATCH]: 'var(--color-success)',
      [NOTIFICATION_TYPES.ADMISSION_DECISION]: 'var(--color-primary)',
      [NOTIFICATION_TYPES.APPLICATION_UPDATE]: 'var(--color-warning)',
      default: 'var(--color-primary)'
    },
    medium: {
      default: 'var(--color-info)'
    },
    low: {
      default: 'var(--color-gray)'
    }
  };
  
  return colorMap[priority]?.[type] || colorMap[priority]?.default || 'var(--color-gray)';
};

/**
 * Filter notifications by type
 */
export const filterNotifications = (notifications, filter = 'all') => {
  if (filter === 'all') return notifications;
  if (filter === 'unread') return notifications.filter(notification => !notification.read);
  return notifications.filter(notification => notification.type === filter);
};

/**
 * Sort notifications by date (newest first)
 */
export const sortNotificationsByDate = (notifications, order = 'desc') => {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  };
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date(today);
  thisMonth.setDate(thisMonth.getDate() - 30);
  
  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);
    
    if (notificationDate >= today) {
      groups.today.push(notification);
    } else if (notificationDate >= yesterday) {
      groups.yesterday.push(notification);
    } else if (notificationDate >= thisWeek) {
      groups.thisWeek.push(notification);
    } else if (notificationDate >= thisMonth) {
      groups.thisMonth.push(notification);
    } else {
      groups.older.push(notification);
    }
  });
  
  return groups;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = (notifications) => {
  return notifications.filter(notification => !notification.read).length;
};

/**
 * Mark notifications as read
 */
export const markAsRead = (notifications, notificationIds) => {
  return notifications.map(notification => 
    notificationIds.includes(notification.id) 
      ? { ...notification, read: true, readAt: new Date().toISOString() }
      : notification
  );
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = (notifications) => {
  return notifications.map(notification => ({
    ...notification,
    read: true,
    readAt: new Date().toISOString()
  }));
};

/**
 * Remove notifications by IDs
 */
export const removeNotifications = (notifications, notificationIds) => {
  return notifications.filter(notification => !notificationIds.includes(notification.id));
};

/**
 * Check if notification is expired (older than 30 days)
 */
export const isNotificationExpired = (notification) => {
  const notificationDate = new Date(notification.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return notificationDate < thirtyDaysAgo;
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = (notifications) => {
  return notifications.filter(notification => !isNotificationExpired(notification));
};

/**
 * Get notification display time
 */
export const getNotificationTime = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now - created;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return created.toLocaleDateString();
};

/**
 * Create notification preferences object
 */
export const createNotificationPreferences = () => {
  return {
    email: true,
    push: true,
    inApp: true,
    types: {
      [NOTIFICATION_TYPES.JOB_MATCH]: true,
      [NOTIFICATION_TYPES.ADMISSION_DECISION]: true,
      [NOTIFICATION_TYPES.APPLICATION_UPDATE]: true,
      [NOTIFICATION_TYPES.SYSTEM]: true,
      [NOTIFICATION_TYPES.GENERAL]: false
    }
  };
};

/**
 * Check if notification type is enabled in preferences
 */
export const isNotificationTypeEnabled = (preferences, type) => {
  return preferences?.types?.[type] !== false;
};

/**
 * Validate notification object
 */
export const isValidNotification = (notification) => {
  return notification && 
         notification.id && 
         notification.type && 
         notification.title && 
         notification.message &&
         notification.createdAt;
};

export default {
  createNotification,
  generateNotificationId,
  createJobMatchNotification,
  createAdmissionNotification,
  createApplicationUpdateNotification,
  createSystemNotification,
  getNotificationIcon,
  getNotificationColor,
  filterNotifications,
  sortNotificationsByDate,
  groupNotificationsByDate,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotifications,
  isNotificationExpired,
  cleanupExpiredNotifications,
  getNotificationTime,
  createNotificationPreferences,
  isNotificationTypeEnabled,
  isValidNotification
};