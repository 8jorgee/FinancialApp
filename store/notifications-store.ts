import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '@/services/notifications';

interface NotificationSettings {
  eventsEnabled: boolean;
  messagesEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  nearbyEventsRadius: number; // in kilometers
}

interface NotificationState {
  settings: NotificationSettings;
  pushToken: string | null;
  isInitialized: boolean;
  
  initializeNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  sendEventNotification: (eventTitle: string, eventId: string) => Promise<void>;
  sendMessageNotification: (senderName: string, conversationId: string, recipientId: string) => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  eventsEnabled: true,
  messagesEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  nearbyEventsRadius: 10, // 10km radius
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      pushToken: null,
      isInitialized: false,
      
      initializeNotifications: async () => {
        try {
          const token = await notificationService.initialize();
          set({ 
            pushToken: token,
            isInitialized: true 
          });
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
          set({ isInitialized: false });
        }
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      sendEventNotification: async (eventTitle: string, eventId: string) => {
        const { settings, pushToken } = get();
        
        if (!settings.eventsEnabled) return;
        
        try {
          // In a real app, you would get tokens of users within the radius
          // For demo, we'll just send to the current user if we have a token
          if (pushToken) {
            await notificationService.notifyNewEvent(eventTitle, eventId, [pushToken]);
          } else {
            // Fallback to local notification
            await notificationService.scheduleLocalNotification({
              type: 'event',
              title: 'New Event Near You!',
              body: `Check out: ${eventTitle}`,
              eventId,
            });
          }
        } catch (error) {
          console.error('Failed to send event notification:', error);
        }
      },
      
      sendMessageNotification: async (senderName: string, conversationId: string, recipientId: string) => {
        const { settings, pushToken } = get();
        
        if (!settings.messagesEnabled) return;
        
        try {
          // In a real app, you would get the recipient's push token from your backend
          // For demo, we'll use the current user's token or fallback to local notification
          if (pushToken) {
            await notificationService.notifyNewMessage(senderName, conversationId, pushToken);
          } else {
            // Fallback to local notification
            await notificationService.scheduleLocalNotification({
              type: 'message',
              title: 'New Message',
              body: `${senderName} sent you a message`,
              conversationId,
            });
          }
        } catch (error) {
          console.error('Failed to send message notification:', error);
        }
      },
    }),
    {
      name: 'notification-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        settings: state.settings,
        pushToken: state.pushToken 
      }),
    }
  )
);