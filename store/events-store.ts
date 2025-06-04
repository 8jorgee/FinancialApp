import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '@/types';
import { events as mockEvents } from '@/mocks/events';
import { useNotificationStore } from './notifications-store';

interface EventsState {
  events: Event[];
  bookmarkedEvents: string[];
  isLoading: boolean;
  error: string | null;
  
  fetchEvents: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  createEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  
  toggleBookmark: (eventId: string) => void;
  isBookmarked: (eventId: string) => boolean;
  getBookmarkedEvents: () => Event[];
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      bookmarkedEvents: [],
      isLoading: false,
      error: null,
      
      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ events: mockEvents, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch events', 
            isLoading: false 
          });
        }
      },
      
      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },
      
      createEvent: async (eventData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const newEvent: Event = {
            ...eventData,
            id: `event-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            events: [...state.events, newEvent],
            isLoading: false,
          }));
          
          // Send notification for new event
          const notificationStore = useNotificationStore.getState();
          await notificationStore.sendEventNotification(newEvent.title, newEvent.id);
          
          return newEvent;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create event', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateEvent: async (id, eventData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          let updatedEvent: Event | undefined;
          
          set((state) => {
            const updatedEvents = state.events.map((event) => {
              if (event.id === id) {
                updatedEvent = { ...event, ...eventData };
                return updatedEvent;
              }
              return event;
            });
            
            return {
              events: updatedEvents,
              isLoading: false,
            };
          });
          
          if (!updatedEvent) {
            throw new Error('Event not found');
          }
          
          return updatedEvent;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update event', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
            bookmarkedEvents: state.bookmarkedEvents.filter((eventId) => eventId !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete event', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      toggleBookmark: (eventId) => {
        set((state) => {
          const isCurrentlyBookmarked = state.bookmarkedEvents.includes(eventId);
          
          return {
            bookmarkedEvents: isCurrentlyBookmarked
              ? state.bookmarkedEvents.filter((id) => id !== eventId)
              : [...state.bookmarkedEvents, eventId],
          };
        });
      },
      
      isBookmarked: (eventId) => {
        return get().bookmarkedEvents.includes(eventId);
      },
      
      getBookmarkedEvents: () => {
        const { events, bookmarkedEvents } = get();
        return events.filter((event) => bookmarkedEvents.includes(event.id));
      },
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ bookmarkedEvents: state.bookmarkedEvents }),
    }
  )
);