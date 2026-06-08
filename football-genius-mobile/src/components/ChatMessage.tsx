import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.roleIcon]}>{isUser ? '👤' : '🤖'}</Text>
        <View style={styles.contentContainer}>
          <Text style={[styles.roleLabel, isUser ? styles.userLabel : styles.assistantLabel]}>
            {isUser ? 'Tú' : 'Football Genius AI'}
          </Text>
          <Text style={styles.messageText}>{message.content}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    maxWidth: '85%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderWidth: 1,
    borderColor: Colors.userBorder,
  },
  assistantBubble: {
    backgroundColor: Colors.assistantBubble,
    borderWidth: 1,
    borderColor: Colors.assistantBorder,
  },
  roleIcon: {
    fontSize: FontSize.lg,
    marginRight: Spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  userLabel: {
    color: Colors.gold,
  },
  assistantLabel: {
    color: Colors.gold,
  },
  messageText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
