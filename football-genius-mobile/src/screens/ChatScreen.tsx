import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message, MODES } from '../types';
import ChatMessage from '../components/ChatMessage';
import SuggestedQuestions from '../components/SuggestedQuestions';
import { askQuestion } from '../services/api';
import { saveMessages, loadMessages } from '../services/storage';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

interface Props {
  currentMode: string;
  onOpenModes: () => void;
}

const generateId = () => Math.random().toString(36).substring(7);

export default function ChatScreen({ currentMode, onOpenModes }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateId());
  const flatListRef = useRef<FlatList>(null);
  const currentModeRef = useRef(currentMode);

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    loadMessages(sessionId).then(setMessages);
  }, [sessionId]);

  useEffect(() => {
    saveMessages(messages, sessionId);
  }, [messages, sessionId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askQuestion({
        query: text.trim(),
        mode: currentModeRef.current,
      });

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ Error al conectar con el servidor. Intenta de nuevo.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const modeInfo = MODES.find(m => m.key === currentMode);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚽ Football Genius</Text>
          <TouchableOpacity onPress={onOpenModes} style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {modeInfo?.icon} {modeInfo?.name || 'General'} ▼
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {messages.length === 0 && !loading ? (
        <SuggestedQuestions
          currentMode={currentMode}
          onSelectQuestion={sendMessage}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          contentContainerStyle={styles.messageList}
        />
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.loadingText}>Analizando...</Text>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pregúntame sobre fútbol..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.gold,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  modeBadge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  modeBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
  },
  messageList: {
    paddingVertical: Spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  loadingText: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: Colors.background,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
