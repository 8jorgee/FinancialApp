import { User } from '@/types';

export const users: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    bio: 'Event enthusiast and local guide',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco, CA',
    },
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Photography lover and concert goer',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco, CA',
    },
    createdAt: '2023-02-20T10:15:00Z',
  },
  {
    id: '3',
    username: 'mikesmith',
    email: 'mike@example.com',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Food festival organizer and chef',
    location: {
      latitude: 37.3382,
      longitude: -121.8863,
      name: 'San Jose, CA',
    },
    createdAt: '2023-03-10T14:45:00Z',
  },
  {
    id: '4',
    username: 'sarahlee',
    email: 'sarah@example.com',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    bio: 'Tech meetup organizer and developer',
    location: {
      latitude: 37.4419,
      longitude: -122.1430,
      name: 'Palo Alto, CA',
    },
    createdAt: '2023-04-05T09:20:00Z',
  },
];

export const currentUser = users[0];