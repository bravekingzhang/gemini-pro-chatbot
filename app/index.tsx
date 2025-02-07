import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Message } from '../components/Message';
import { Chat, Message as MessageType, DEFAULT_SYSTEM_PROMPT } from '../constants/Config';
import { streamCompletion } from '../utils/gemini';
import { saveChat, loadChats, updateMessage } from '../utils/storage';
import { nanoid } from 'nanoid/non-secure';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@gemini_api_key';

export default function ChatScreen() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadInitialChat();
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      setApiKey(savedApiKey);
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadInitialChat = async () => {
    try {
      const chats = await loadChats();
      if (chats.length > 0) {
        setCurrentChat(chats[0]);
        setMessages(chats[0].messages);
      } else {
        const newChat: Chat = {
          id: nanoid(),
          title: 'New Chat',
          messages: [],
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setCurrentChat(newChat);
        await saveChat(newChat);
      }
    } catch (error) {
      console.error('Error loading initial chat:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentChat || !apiKey) return;

    const userMessage: MessageType = {
      id: nanoid(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    const assistantMessage: MessageType = {
      id: nanoid(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages([...updatedMessages, assistantMessage]);

    try {
      let responseContent = '';
      await streamCompletion(
        [{ role: 'system', content: currentChat.systemPrompt }, ...updatedMessages.map(m => ({ role: m.role, content: m.content }))],
        (chunk) => {
          responseContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: responseContent,
            };
            return updated;
          });
        },
        (error) => {
          console.error('Error in stream:', error);
        },
        () => {
          setIsLoading(false);
        }
      );

      const updatedChat: Chat = {
        ...currentChat,
        messages: [...updatedMessages, { ...assistantMessage, content: responseContent }],
        updatedAt: Date.now(),
      };
      await saveChat(updatedChat);
      setCurrentChat(updatedChat);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    // Implement message editing logic here
    console.log('Edit message:', messageId);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Message message={item} onEdit={handleEditMessage} />
            )}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { maxHeight: 100 }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={apiKey ? "Type a message..." : "Please set your API key in settings"}
              placeholderTextColor="#666"
              multiline
              editable={!!apiKey}
            />
            <Pressable
              style={[styles.sendButton, (!inputText.trim() || !apiKey) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading || !apiKey}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <MaterialIcons 
                  name="send" 
                  size={24} 
                  color={inputText.trim() && apiKey ? '#FFFFFF' : '#666666'} 
                />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
  },
}); 