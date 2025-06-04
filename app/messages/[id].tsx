import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { useMessagesStore } from '@/store/messages-store';
import MessageBubble from '@/components/MessageBubble';
import Avatar from '@/components/Avatar';
import { users } from '@/mocks/users';
import { currentUser } from '@/mocks/users';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getConversationById, 
    fetchMessages, 
    sendMessage, 
    messages, 
    markAsRead 
  } = useMessagesStore();
  
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const conversation = getConversationById(id);
  
  if (!conversation) {
    router.back();
    return null;
  }
  
  const otherParticipantId = conversation.participants.find(
    (participantId) => participantId !== currentUser.id
  );
  
  const otherUser = users.find((user) => user.id === otherParticipantId);
  
  useEffect(() => {
    const loadMessages = async () => {
      await fetchMessages(id);
      await markAsRead(id);
    };
    
    loadMessages();
  }, [id, fetchMessages, markAsRead]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSend = async () => {
    if (!text.trim()) return;
    
    setIsSending(true);
    setText('');
    
    try {
      await sendMessage(id, text.trim());
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: otherUser?.username || 'Conversation',
          headerRight: () => (
            <Avatar
              uri={otherUser?.profileImage}
              name={otherUser?.username}
              size="small"
              online={true}
            />
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesContainer}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!text.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
          >
            <Send size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    paddingVertical: layout.spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.large,
    paddingHorizontal: layout.spacing.m,
    paddingVertical: layout.spacing.s,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: layout.spacing.s,
  },
  sendButtonDisabled: {
    backgroundColor: colors.inactive,
  },
});