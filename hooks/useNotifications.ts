import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notifications';
import { useAuthStore } from '@/store/auth-store';
import { useMessagesStore } from '@/store/messages-store';

export function useNotifications() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchConversations } = useMessagesStore();
  
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize notifications
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        
        // Request web notification permission if on web
        if (Platform.OS === 'web') {
          await notificationService.requestWebNotificationPermission();
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        
        // Update badge count (only on native platforms)
        if (Platform.OS !== 'web') {
          try {
            const currentBadge = notification.request.content.badge || 0;
            notificationService.setBadgeCount(currentBadge + 1);
          } catch (error) {
            console.error('Error updating badge count:', error);
          }
        }
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification response:', response);
        
        try {
          const data = response.notification.request.content.data;
          
          // Navigate based on notification type
          if (data?.type === 'event' && data?.eventId) {
            router.push(`/event/${data.eventId}`);
          } else if (data?.type === 'message' && data?.conversationId) {
            router.push(`/messages/${data.conversationId}`);
            // Refresh conversations to update unread counts
            fetchConversations();
          }
          
          // Clear badge when user interacts with notification (only on native platforms)
          if (Platform.OS !== 'web') {
            notificationService.setBadgeCount(0);
          }
        } catch (error) {
          console.error('Error handling notification response:', error);
        }
      }
    );

    return () => {
      try {
        if (notificationListener.current && notificationListener.current.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current && responseListener.current.remove) {
          responseListener.current.remove();
        }
      } catch (error) {
        console.error('Error cleaning up notification listeners:', error);
      }
    };
  }, [isAuthenticated, router, fetchConversations]);

  return {
    scheduleNotification: notificationService.scheduleLocalNotification.bind(notificationService),
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
  };
}