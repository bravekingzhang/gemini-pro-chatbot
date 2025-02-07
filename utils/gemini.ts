import OpenAI from 'openai';
import { GEMINI_API_KEY, GEMINI_BASE_URL } from '../constants/Config';

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: GEMINI_BASE_URL,
});

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const streamCompletion = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete: () => void
) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: messages as any,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
    onComplete();
  } catch (error) {
    onError(error);
  }
};

export const generateCompletion = async (messages: ChatMessage[]) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: messages as any,
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
};