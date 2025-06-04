import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { Conversation } from '@/types';
import { formatMessageTime } from '@/utils/date';
import Avatar from './Avatar';
import { users } from '@/mocks/users';
import { currentUser } from '@/mocks/users';

interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  const router = useRouter();
  
  const otherParticipantId = conversation.participants.find(
    (id) => id !== currentUser.id
  );
  
  const otherUser = users.find((user) => user.id === otherParticipantId);
  
  if (!otherUser) return null;

  const handlePress = () => {
    router.push(`/messages/${conversation.id}`);
  };

  const isLastMessageFromMe = conversation.lastMessage.senderId === currentUser.id;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Avatar 
        uri={otherUser.profileImage} 
        name={otherUser.username} 
        online={true} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{otherUser.username}</Text>
          <Text style={styles.time}>
            {formatMessageTime(conversation.lastMessage.timestamp)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.message, 
              !conversation.lastMessage.read && !isLastMessageFromMe && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {isLastMessageFromMe ? 'You: ' : ''}{conversation.lastMessage.text}
          </Text>
          
          {conversation.unreadCount > 0 && !isLastMessageFromMe && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    marginLeft: layout.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: layout.spacing.s,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});