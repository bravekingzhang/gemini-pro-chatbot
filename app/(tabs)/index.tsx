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
  Text,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '@/components/Message';
import { Chat, Message as MessageType, Agent } from '@/constants/Config';
import { streamCompletion } from '@/utils/gemini';
import { saveChat, loadChats, updateMessage, loadAgents } from '@/utils/storage';
import { nanoid } from 'nanoid/non-secure';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

const API_KEY_STORAGE_KEY = '@gemini_api_key';

type ChatMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
  image?: string | null;
};

export default function ChatScreen() {
  const { agentId, chatId } = useLocalSearchParams<{ agentId: string; chatId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey();
    if (chatId) {
      loadExistingChat();
    } else if (agentId) {
      loadAgentAndChat();
    } else {
      loadDefaultAgentAndChat();
    }
  }, [agentId, chatId]);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      setApiKey(savedApiKey);
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadExistingChat = async () => {
    try {
      const chats = await loadChats();
      const chat = chats.find(c => c.id === chatId);
      if (!chat) {
        Alert.alert('Error', 'Chat not found');
        return;
      }

      const agents = await loadAgents();
      const agent = agents.find(a => a.id === chat.agentId);
      if (!agent) {
        Alert.alert('Error', 'Agent not found');
        return;
      }

      setCurrentChat(chat);
      setCurrentAgent(agent);
      setMessages(chat.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const loadAgentAndChat = async () => {
    try {
      // 加载 Agent
      const agents = await loadAgents();
      const agent = agents.find(a => a.id === agentId);
      if (!agent) {
        Alert.alert('Error', 'Agent not found');
        return;
      }
      setCurrentAgent(agent);

      // 加载或创建聊天
      const chats = await loadChats();
      let chat = chats.find(c => c.agentId === agentId);
      
      if (!chat) {
        chat = {
          id: nanoid(),
          title: `Chat with ${agent.name}`,
          messages: [],
          systemPrompt: agent.systemPrompt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          agentId: agent.id,
        };
        await saveChat(chat);
      }
      
      setCurrentChat(chat);
      setMessages(chat.messages);
    } catch (error) {
      console.error('Error loading agent and chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const loadDefaultAgentAndChat = async () => {
    try {
      // 加载默认 Agent
      const agents = await loadAgents();
      const defaultAgent = agents.find(a => a.id === 'default-chat');
      if (!defaultAgent) {
        Alert.alert('Error', 'Default agent not found');
        return;
      }
      setCurrentAgent(defaultAgent);

      // 加载或创建默认聊天
      const chats = await loadChats();
      let chat = chats.find(c => c.agentId === defaultAgent.id);
      
      if (!chat) {
        chat = {
          id: nanoid(),
          title: `Chat with ${defaultAgent.name}`,
          messages: [],
          systemPrompt: defaultAgent.systemPrompt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          agentId: defaultAgent.id,
        };
        await saveChat(chat);
      }
      
      setCurrentChat(chat);
      setMessages(chat.messages);
    } catch (error) {
      console.error('Error loading default agent and chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || !currentChat || !currentAgent || !apiKey) return;

    const userMessage: MessageType = {
      id: nanoid(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
      image: selectedImage,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      let responseContent = '';
      const assistantMessage: MessageType = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 构建发送给模型的消息
      const messagesToSend = [
        { role: 'system', content: currentAgent.systemPrompt },
        ...updatedMessages.map(m => ({
          role: m.role,
          content: m.content,
          image: m.image,
        }))
      ];

      await streamCompletion(
        messagesToSend,
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
          setIsLoading(false);
          setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove the failed assistant message
          Alert.alert('Error', 'Failed to get response from AI');
        },
        async () => {
          setIsLoading(false);
          const updatedChat: Chat = {
            ...currentChat,
            messages: [...updatedMessages, { ...assistantMessage, content: responseContent }],
            updatedAt: Date.now(),
          };
          await saveChat(updatedChat);
          setCurrentChat(updatedChat);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove the failed assistant message
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentChat) return;
    
    try {
      await updateMessage(currentChat.id, messageId, newContent);
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, isEdited: true }
          : msg
      ));
    } catch (error) {
      console.error('Error updating message:', error);
      Alert.alert('Error', 'Failed to update message');
    }
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (!currentChat || !currentAgent) return;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get all messages up to the message we want to regenerate
    const previousMessages = messages.slice(0, messageIndex);
    setIsLoading(true);

    try {
      let responseContent = '';
      await streamCompletion(
        [
          { role: 'system', content: currentAgent.systemPrompt },
          ...previousMessages.map(m => ({ role: m.role, content: m.content }))
        ],
        (chunk) => {
          responseContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[messageIndex] = {
              ...updated[messageIndex],
              content: responseContent,
              isEdited: true,
            };
            return updated;
          });
        },
        (error) => {
          console.error('Error in stream:', error);
          setIsLoading(false);
          Alert.alert('Error', 'Failed to regenerate response');
        },
        () => {
          setIsLoading(false);
        }
      );

      const updatedChat: Chat = {
        ...currentChat,
        messages: messages.map((msg, index) => 
          index === messageIndex 
            ? { ...msg, content: responseContent, isEdited: true }
            : msg
        ),
        updatedAt: Date.now(),
      };
      await saveChat(updatedChat);
      setCurrentChat(updatedChat);
    } catch (error) {
      console.error('Error regenerating message:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to regenerate message');
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await Clipboard.setStringAsync(content);
    } catch (error) {
      console.error('Error copying message:', error);
      Alert.alert('Error', 'Failed to copy message');
    }
  };

  const handleNewChat = () => {
    if (!currentAgent) return;
    
    const newChat: Chat = {
      id: nanoid(),
      title: `Chat with ${currentAgent.name}`,
      messages: [],
      systemPrompt: currentAgent.systemPrompt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agentId: currentAgent.id,
    };
    
    setCurrentChat(newChat);
    setMessages([]);
    saveChat(newChat);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={currentAgent?.icon as any || 'chat-bubble-outline'} 
        size={48} 
        color={currentAgent?.color || '#999999'} 
      />
      <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkEmptyStateTitle]}>
        {currentAgent?.name || 'Chat Assistant'}
      </Text>
      <Text style={[styles.emptyStateDescription, isDarkMode && styles.darkEmptyStateDescription]}>
        {currentAgent?.description || 'Start a conversation!'}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/chats')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
                isDarkMode && styles.darkHeaderButton,
              ]}
            >
              <MaterialIcons name="history" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
              <Message
                message={item}
                onEdit={handleEditMessage}
                onRegenerate={handleRegenerateMessage}
                onCopy={handleCopyMessage}
              />
            )}
            style={styles.messageList}
            contentContainerStyle={[
              styles.messageListContent,
              messages.length === 0 && styles.emptyList,
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={renderEmptyState}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
          <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
            <View style={styles.inputRow}>
              <Pressable
                style={[
                  styles.attachButton,
                  isDarkMode && styles.darkAttachButton,
                  selectedImage && styles.attachButtonActive
                ]}
                onPress={pickImage}
              >
                <MaterialIcons
                  name="image"
                  size={24}
                  color={selectedImage ? '#6B4EFF' : isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </Pressable>
              <View style={styles.inputWrapper}>
                {selectedImage && (
                  <View style={[
                    styles.selectedImageContainer,
                    isDarkMode && styles.darkSelectedImageContainer
                  ]}>
                    <Image 
                      source={{ uri: selectedImage }} 
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                      hitSlop={8}
                    >
                      <MaterialIcons name="close" size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode && styles.darkInput,
                    selectedImage && styles.inputWithImage
                  ]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={apiKey ? "Type a message..." : "Please set your API key in settings"}
                  placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                  multiline
                  editable={!!apiKey}
                  onFocus={() => {
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              </View>
              <Pressable
                style={[
                  styles.sendButton,
                  (!inputText.trim() && !selectedImage || !apiKey) && styles.sendButtonDisabled,
                  isDarkMode && styles.darkSendButton,
                ]}
                onPress={handleSend}
                disabled={(!inputText.trim() && !selectedImage) || isLoading || !apiKey}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <MaterialIcons
                    name="send"
                    size={24}
                    color={(inputText.trim() || selectedImage) && apiKey ? '#FFFFFF' : isDarkMode ? '#666666' : '#999999'}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  darkEmptyStateTitle: {
    color: '#FFFFFF',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  darkEmptyStateDescription: {
    color: '#999999',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  darkInputContainer: {
    backgroundColor: '#000000',
    borderTopColor: '#333333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#000000',
    fontSize: 16,
    minHeight: 44,
  },
  inputWithImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  darkInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButtonActive: {
    backgroundColor: '#EDE9FF',
  },
  darkAttachButton: {
    backgroundColor: '#1C1C1E',
  },
  selectedImageContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 8,
    marginBottom: -1,
  },
  darkSelectedImageContainer: {
    backgroundColor: '#1C1C1E',
  },
  selectedImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B4EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  darkSendButton: {
    backgroundColor: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  darkHeaderButton: {
    backgroundColor: '#1C1C1E',
  },
  headerButtonPressed: {
    opacity: 0.7,
    backgroundColor: '#E5E5E5',
  },
});