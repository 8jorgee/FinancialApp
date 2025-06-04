import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { Message } from '@/types';
import { formatMessageTime } from '@/utils/date';
import { currentUser } from '@/mocks/users';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isFromMe = message.senderId === currentUser.id;
  
  return (
    <View style={[styles.container, isFromMe ? styles.rightContainer : styles.leftContainer]}>
      <View style={[styles.bubble, isFromMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.text, isFromMe ? styles.myText : styles.theirText]}>
          {message.text}
        </Text>
        <Text style={[styles.time, isFromMe ? styles.myTime : styles.theirTime]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: layout.spacing.xs,
    marginHorizontal: layout.spacing.m,
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  leftContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: layout.borderRadius.large,
    paddingHorizontal: layout.spacing.m,
    paddingVertical: layout.spacing.s,
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: colors.primary,
  },
  theirBubble: {
    backgroundColor: colors.card,
  },
  text: {
    fontSize: 16,
  },
  myText: {
    color: colors.white,
  },
  theirText: {
    color: colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTime: {
    color: colors.textSecondary,
  },
});