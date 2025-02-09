import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, Agent, DEFAULT_AGENTS } from '../constants/Config';

const CHATS_STORAGE_KEY = '@gemini_chats';
const AGENTS_STORAGE_KEY = '@gemini_agents';

// Agent 相关操作
export const initializeAgents = async () => {
  try {
    const existingAgents = await loadAgents();
    if (existingAgents.length === 0) {
      await AsyncStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(DEFAULT_AGENTS));
      return DEFAULT_AGENTS;
    }
    return existingAgents;
  } catch (error) {
    console.error('Error initializing agents:', error);
    return DEFAULT_AGENTS;
  }
};

export const loadAgents = async (): Promise<Agent[]> => {
  try {
    const agentsJson = await AsyncStorage.getItem(AGENTS_STORAGE_KEY);
    return agentsJson ? JSON.parse(agentsJson) : [];
  } catch (error) {
    console.error('Error loading agents:', error);
    return [];
  }
};

export const saveAgent = async (agent: Agent) => {
  try {
    const existingAgents = await loadAgents();
    const agentIndex = existingAgents.findIndex(a => a.id === agent.id);
    
    if (agentIndex !== -1) {
      existingAgents[agentIndex] = agent;
    } else {
      existingAgents.push(agent);
    }
    
    await AsyncStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(existingAgents));
  } catch (error) {
    console.error('Error saving agent:', error);
    throw error;
  }
};

export const deleteAgent = async (agentId: string) => {
  try {
    const existingAgents = await loadAgents();
    const updatedAgents = existingAgents.filter(agent => agent.id !== agentId);
    await AsyncStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updatedAgents));
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};

// 现有的 Chat 相关操作
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