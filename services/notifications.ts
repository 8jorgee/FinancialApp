import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when app is in foreground
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationData {
  type: 'event' | 'message';
  eventId?: string;
  conversationId?: string;
  title: string;
  body: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      if (Platform.OS === 'web') {
        console.log('Push notifications not supported on web');
        await this.requestWebNotificationPermission();
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync();
        this.expoPushToken = token.data;
        
        // Store token locally
        await AsyncStorage.setItem('expoPushToken', token.data);
        
        console.log('Push token:', token.data);
        return token.data;
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async scheduleLocalNotification(data: NotificationData) {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.body,
            icon: '/icon.png',
          });
        } else {
          console.log('Web notification:', data.title, data.body);
          // Show a simple alert as fallback
          alert(`${data.title}: ${data.body}`);
        }
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: {
            type: data.type,
            eventId: data.eventId,
            conversationId: data.conversationId,
          },
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      // Fallback to console log
      console.log('Notification fallback:', data.title, data.body);
    }
  }

  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      // In a real app, you would send this to your backend server
      // which would then send it to Expo's push notification service
      console.log('Would send push notification:', message);
      
      // For demo purposes, we'll schedule a local notification instead
      await this.scheduleLocalNotification({
        type: data?.type || 'event',
        title,
        body,
        eventId: data?.eventId,
        conversationId: data?.conversationId,
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async notifyNewEvent(eventTitle: string, eventId: string, userTokens: string[]) {
    const title = 'New Event Near You!';
    const body = `Check out: ${eventTitle}`;
    
    for (const token of userTokens) {
      await this.sendPushNotification(token, title, body, {
        type: 'event',
        eventId,
      });
    }
  }

  async notifyNewMessage(senderName: string, conversationId: string, recipientToken: string) {
    const title = 'New Message';
    const body = `${senderName} sent you a message`;
    
    await this.sendPushNotification(recipientToken, title, body, {
      type: 'message',
      conversationId,
    });
  }

  async cancelAllNotifications() {
    if (Platform.OS === 'web') {
      console.log('Cannot cancel notifications on web');
      return;
    }
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Handle notification interactions
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    if (Platform.OS === 'web') {
      return { remove: () => {} };
    }
    try {
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (error) {
      console.error('Error adding notification response listener:', error);
      return { remove: () => {} };
    }
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    if (Platform.OS === 'web') {
      return { remove: () => {} };
    }
    try {
      return Notifications.addNotificationReceivedListener(callback);
    } catch (error) {
      console.error('Error adding notification received listener:', error);
      return { remove: () => {} };
    }
  }

  async requestWebNotificationPermission() {
    if (Platform.OS === 'web' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting web notification permission:', error);
        return false;
      }
    }
    return false;
  }
}

export const notificationService = new NotificationService();