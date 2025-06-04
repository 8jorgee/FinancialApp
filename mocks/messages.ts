import { Conversation, Message } from '@/types';

export const messages: Message[] = [
  {
    id: 'm1',
    senderId: '2',
    receiverId: '1',
    text: "Hey! Are you going to the Tech Startup Mixer next week?",
    timestamp: '2025-05-28T14:30:00Z',
    read: true,
  },
  {
    id: 'm2',
    senderId: '1',
    receiverId: '2',
    text: "Yes, I'm planning to attend. Are you presenting anything?",
    timestamp: '2025-05-28T14:35:00Z',
    read: true,
  },
  {
    id: 'm3',
    senderId: '2',
    receiverId: '1',
    text: "No presentation this time, just networking. Let's meet up there!",
    timestamp: '2025-05-28T14:40:00Z',
    read: true,
  },
  {
    id: 'm4',
    senderId: '3',
    receiverId: '1',
    text: "Don't forget about the Farmers Market this weekend. I've got a booth set up!",
    timestamp: '2025-05-29T09:15:00Z',
    read: false,
  },
  {
    id: 'm5',
    senderId: '1',
    receiverId: '3',
    text: "I'll definitely stop by! What are you selling this time?",
    timestamp: '2025-05-29T09:20:00Z',
    read: true,
  },
  {
    id: 'm6',
    senderId: '4',
    receiverId: '1',
    text: "Thanks for RSVPing to the Art Gallery Opening. Did you see the featured artists list?",
    timestamp: '2025-05-30T10:05:00Z',
    read: false,
  },
];

export const conversations: Conversation[] = [
  {
    id: 'c1',
    participants: ['1', '2'],
    lastMessage: messages[2],
    unreadCount: 0,
  },
  {
    id: 'c2',
    participants: ['1', '3'],
    lastMessage: messages[4],
    unreadCount: 1,
  },
  {
    id: 'c3',
    participants: ['1', '4'],
    lastMessage: messages[5],
    unreadCount: 1,
  },
];