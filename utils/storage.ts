import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../constants/Config';

const CHATS_STORAGE_KEY = '@gemini_chats';

export const saveChat = async (chat: Chat) => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
    const existingChats: Chat[] = existingChatsJson ? JSON.parse(existingChatsJson) : [];
    
    const chatIndex = existingChats.findIndex(c => c.id === chat.id);
    if (chatIndex !== -1) {
      existingChats[chatIndex] = chat;
    } else {
      existingChats.push(chat);
    }
    
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(existingChats));
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

export const loadChats = async (): Promise<Chat[]> => {
  try {
    const chatsJson = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
    return chatsJson ? JSON.parse(chatsJson) : [];
  } catch (error) {
    console.error('Error loading chats:', error);
    throw error;
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
    const existingChats: Chat[] = existingChatsJson ? JSON.parse(existingChatsJson) : [];
    
    const updatedChats = existingChats.filter(chat => chat.id !== chatId);
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

export const updateMessage = async (chatId: string, messageId: string, newContent: string) => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
    const existingChats: Chat[] = existingChatsJson ? JSON.parse(existingChatsJson) : [];
    
    const chatIndex = existingChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;
    
    const messageIndex = existingChats[chatIndex].messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    existingChats[chatIndex].messages[messageIndex].content = newContent;
    existingChats[chatIndex].messages[messageIndex].isEdited = true;
    existingChats[chatIndex].updatedAt = Date.now();
    
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(existingChats));
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}; 