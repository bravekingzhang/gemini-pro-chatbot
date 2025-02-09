import axios from 'axios';
import { GEMINI_API_KEY } from '../constants/Config';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

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
    console.log('Sending stream request with messages:', JSON.stringify(messages, null, 2));

    const response = await axios.post(
      BASE_URL,
      {
        model: 'gemini-2.0-pro-exp-02-05',
        messages,
        stream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'Accept': 'text/event-stream'
        },
        responseType: 'text'
      }
    );

    console.log('Stream response status:', response.status);
    console.log('Stream response headers:', response.headers);
    console.log('Raw response data:', response.data);

    const chunks = response.data.split('\n').filter(Boolean);
    console.log('Filtered chunks:', chunks);

    for (const chunk of chunks) {
      try {
        console.log('Processing chunk:', chunk);
        if (chunk.includes('[DONE]')) {
          console.log('Received [DONE] signal');
          continue;
        }
        const json = JSON.parse(chunk.replace(/^data: /, ''));
        console.log('Parsed JSON:', json);
        const content = json.choices[0]?.delta?.content;
        if (content) {
          console.log('Extracted content:', content);
          onChunk(content);
        }
      } catch (e) {
        console.error('Error parsing chunk:', e, '\nChunk:', chunk);
      }
    }
    onComplete();
  } catch (error) {
    console.error('Stream request failed:', error.response?.status);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    onError(error);
  }
};

export const generateCompletion = async (messages: ChatMessage[]) => {
  try {
    console.log('Sending completion request with messages:', JSON.stringify(messages, null, 2));

    const response = await axios.post(
      BASE_URL,
      {
        model: 'gemini-2.0-pro-exp-02-05',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );

    console.log('Completion response status:', response.status);
    console.log('Completion response data:', response.data);

    return response.data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Completion request failed:', error.response?.status);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    throw error;
  }
};