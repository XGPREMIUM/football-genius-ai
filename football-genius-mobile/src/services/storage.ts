import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';

const CONVERSATIONS_KEY = '@football_genius_conversations';
const CURRENT_MODE_KEY = '@football_genius_current_mode';

export async function saveMessages(messages: Message[], sessionId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    const allConversations: Record<string, Message[]> = data ? JSON.parse(data) : {};
    allConversations[sessionId] = messages;
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(allConversations));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
}

export async function loadMessages(sessionId: string): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    if (data) {
      const allConversations: Record<string, Message[]> = JSON.parse(data);
      return allConversations[sessionId] || [];
    }
    return [];
  } catch (e) {
    console.error('Failed to load messages:', e);
    return [];
  }
}

export async function listConversations(): Promise<{ id: string; preview: string; timestamp: number }[]> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    if (data) {
      const allConversations: Record<string, Message[]> = JSON.parse(data);
      return Object.entries(allConversations).map(([id, msgs]) => ({
        id,
        preview: msgs.find(m => m.role === 'user')?.content?.slice(0, 50) || 'Empty',
        timestamp: msgs[msgs.length - 1]?.timestamp || 0,
      })).sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch {
    return [];
  }
}

export async function deleteConversation(sessionId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    if (data) {
      const allConversations: Record<string, Message[]> = JSON.parse(data);
      delete allConversations[sessionId];
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(allConversations));
    }
  } catch (e) {
    console.error('Failed to delete conversation:', e);
  }
}

export async function saveCurrentMode(mode: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_MODE_KEY, mode);
}

export async function loadCurrentMode(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_MODE_KEY);
}
