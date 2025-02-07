export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant powered by Google's Gemini Pro model. You can help with various tasks including answering questions, writing code, and analyzing data.`;

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEdited?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
} 