import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './index';

export const messagingService = {
  // Request notification permission
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return true;
      } else {
        console.log('Unable to get permission to notify.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  // Get FCM token
  async getFCMToken() {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      // Use VAPID key from Firebase Console > Project Settings > Cloud Messaging
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('VAPID key not found. Please set REACT_APP_FIREBASE_VAPID_KEY in your .env file');
        return null;
      }

      const currentToken = await getToken(messaging, { vapidKey });
      
      if (currentToken) {
        console.log('FCM token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  },

  // Listen for foreground messages
  onForegroundMessage(callback) {
    return onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      callback(payload);
    });
  },

  // Parse notification payload
  parseNotificationPayload(payload) {
    const notification = payload.notification || {};
    const data = payload.data || {};
    
    return {
      title: notification.title || data.title || 'Notification',
      body: notification.body || data.body || '',
      icon: notification.icon || data.icon || '/logo192.png',
      image: notification.image || data.image,
      clickAction: notification.click_action || data.click_action,
      // Custom data
      type: data.type || 'general',
      action: data.action,
      entityId: data.entityId,
      timestamp: data.timestamp || new Date().toISOString()
    };
  },

  // Show local notification
  showLocalNotification(notification) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    const { title, body, icon, image, data } = notification;

    const options = {
      body,
      icon: icon || '/logo192.png',
      image,
      data: data || {},
      badge: '/logo192.png',
      requireInteraction: false,
      silent: false
    };

    try {
      const notificationInstance = new Notification(title, options);
      
      notificationInstance.onclick = function() {
        window.focus();
        notificationInstance.close();
        
        // Handle notification click
        if (data && data.url) {
          window.location.href = data.url;
        }
      };
      
      // Auto close after 10 seconds
      setTimeout(() => {
        notificationInstance.close();
      }, 10000);
      
      return notificationInstance;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  },

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Check current permission status
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  // Unsubscribe from messages
  unsubscribeFromMessages(unsubscribeFunction) {
    if (unsubscribeFunction && typeof unsubscribeFunction === 'function') {
      unsubscribeFunction();
    }
  }
};

export default messagingService;