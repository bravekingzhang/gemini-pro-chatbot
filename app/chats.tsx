import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Chat } from '@/constants/Config';
import { loadChats, deleteChat, loadAgents } from '@/utils/storage';

export default function ChatsScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [agents, setAgents] = useState<Record<string, { name: string; color: string }>>({});
  const router = useRouter();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const [loadedChats, loadedAgents] = await Promise.all([
        loadChats(),
        loadAgents(),
      ]);
      
      // Create a map of agent details for quick lookup
      const agentMap = loadedAgents.reduce((acc, agent) => {
        acc[agent.id] = { name: agent.name, color: agent.color };
        return acc;
      }, {} as Record<string, { name: string; color: string }>);
      
      setAgents(agentMap);
      setChats(loadedChats.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    }
  };

  const handleDeleteChat = (chat: Chat) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChat(chat.id);
              setChats(chats.filter(c => c.id !== chat.id));
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = (chat: Chat) => {
    router.push({
      pathname: '/(tabs)/',
      params: { agentId: chat.agentId, chatId: chat.id }
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderChatItem = ({ item: chat }: { item: Chat }) => {
    const agent = agents[chat.agentId];
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatItem,
          pressed && styles.chatItemPressed,
        ]}
        onPress={() => handleOpenChat(chat)}
        onLongPress={() => handleDeleteChat(chat)}
      >
        <View style={[styles.agentIndicator, { backgroundColor: agent?.color || '#999999' }]} />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.agentName}>{agent?.name || 'Unknown Agent'}</Text>
            <Text style={styles.date}>{formatDate(chat.updatedAt)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {lastMessage?.content || 'No messages'}
          </Text>
          <Text style={styles.messageCount}>
            {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => handleDeleteChat(chat)}
          hitSlop={8}
        >
          <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chat History',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialIcons name="chat-bubble-outline" size={48} color="#999999" />
              <Text style={styles.emptyStateTitle}>No Chats Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start a conversation with an agent to see your chat history here
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chatItemPressed: {
    opacity: 0.7,
  },
  agentIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF2F2',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  headerButtonPressed: {
    opacity: 0.7,
    backgroundColor: '#E5E5E5',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
}); 