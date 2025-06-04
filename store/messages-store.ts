import { create } from 'zustand';
import { Message, Conversation } from '@/types';
import { messages as mockMessages, conversations as mockConversations } from '@/mocks/messages';
import { currentUser } from '@/mocks/users';
import { useNotificationStore } from './notifications-store';

interface MessagesState {
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  getConversationById: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string) => Promise<Message>;
  markAsRead: (conversationId: string) => Promise<void>;
  createConversation: (participantId: string, initialMessage: string) => Promise<Conversation>;
}

export const useMessagesStore = create<MessagesState>()((set, get) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,
  
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set({ 
        conversations: mockConversations, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        isLoading: false 
      });
    }
  },
  
  fetchMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const conversation = mockConversations.find((c) => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      const conversationMessages = mockMessages.filter(
        (message) => 
          conversation.participants.includes(message.senderId) && 
          conversation.participants.includes(message.receiverId)
      );
      
      set({ 
        messages: conversationMessages, 
        isLoading: false 
      });
      
      return conversationMessages;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        isLoading: false 
      });
      return [];
    }
  },
  
  getConversationById: (id) => {
    return get().conversations.find((conversation) => conversation.id === id);
  },
  
  sendMessage: async (conversationId, text) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const conversation = get().conversations.find((c) => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      const otherParticipantId = conversation.participants.find(
        (id) => id !== currentUser.id
      );
      
      if (!otherParticipantId) {
        throw new Error('Recipient not found');
      }
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: otherParticipantId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      set((state) => {
        // Update messages
        const updatedMessages = [...state.messages, newMessage];
        
        // Update conversation with last message
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: newMessage,
            };
          }
          return c;
        });
        
        return {
          messages: updatedMessages,
          conversations: updatedConversations,
          isLoading: false,
        };
      });
      
      // Send notification for new message
      const notificationStore = useNotificationStore.getState();
      await notificationStore.sendMessageNotification(
        currentUser.username, 
        conversationId, 
        otherParticipantId
      );
      
      return newMessage;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  markAsRead: async (conversationId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      set((state) => {
        // Update messages
        const updatedMessages = state.messages.map((message) => {
          if (message.receiverId === currentUser.id && !message.read) {
            return { ...message, read: true };
          }
          return message;
        });
        
        // Update conversation unread count
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              unreadCount: 0,
            };
          }
          return c;
        });
        
        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },
  
  createConversation: async (participantId, initialMessage) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Check if conversation already exists
      const existingConversation = get().conversations.find((c) => 
        c.participants.includes(currentUser.id) && 
        c.participants.includes(participantId)
      );
      
      if (existingConversation) {
        return existingConversation;
      }
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: participantId,
        text: initialMessage,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        participants: [currentUser.id, participantId],
        lastMessage: newMessage,
        unreadCount: 0,
      };
      
      set((state) => ({
        conversations: [...state.conversations, newConversation],
        messages: [...state.messages, newMessage],
        isLoading: false,
      }));
      
      // Send notification for new message
      const notificationStore = useNotificationStore.getState();
      await notificationStore.sendMessageNotification(
        currentUser.username, 
        newConversation.id, 
        participantId
      );
      
      return newConversation;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create conversation', 
        isLoading: false 
      });
      throw error;
    }
  },
}));