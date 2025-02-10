export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant powered by Google's Gemini Pro model. You can help with various tasks including answering questions, writing code, and analyzing data.`;

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEdited?: boolean;
  image?: string | null;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
  agentId: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'default-chat',
    name: 'Chat Assistant',
    description: 'A friendly AI assistant for general conversation and help',
    systemPrompt: 'You are a helpful AI assistant powered by Google\'s Gemini Pro model. You can help with various tasks including answering questions, writing code, and analyzing data.',
    icon: 'chat-bubble-outline',
    color: '#6B4EFF',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-writer',
    name: 'Content Writer',
    description: 'Specialized in writing and editing various types of content',
    systemPrompt: 'You are a professional content writer. You excel at creating engaging, well-structured content including articles, blog posts, social media content, and more. Focus on clarity, engagement, and the target audience\'s needs.',
    icon: 'edit',
    color: '#00C853',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-coder',
    name: 'Code Expert',
    description: 'Expert in programming and technical problem-solving',
    systemPrompt: 'You are an expert programmer. You excel at writing clean, efficient code, debugging problems, and explaining technical concepts clearly. Provide code examples when helpful and focus on best practices.',
    icon: 'code',
    color: '#FF6B4E',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];