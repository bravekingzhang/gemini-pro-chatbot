import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Agent } from '@/constants/Config';
import { loadAgents, initializeAgents, deleteAgent } from '@/utils/storage';
import { nanoid } from 'nanoid/non-secure';

export default function AgentScreen() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadInitialAgents();
  }, []);

  const loadInitialAgents = async () => {
    const initialAgents = await initializeAgents();
    setAgents(initialAgents);
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: nanoid(),
      name: 'New Agent',
      description: 'Describe your agent\'s purpose',
      systemPrompt: 'You are a helpful AI assistant.',
      icon: 'android',
      color: '#6B4EFF',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    router.push('/agent/new');
  };

  const handleEditAgent = (agent: Agent) => {
    router.push(`/agent/${agent.id}`);
  };

  const handleStartChat = (agent: Agent) => {
    router.push({
      pathname: '/',
      params: { agentId: agent.id }
    });
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (agent.isDefault) {
      Alert.alert('Cannot Delete', 'Default agents cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete "${agent.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAgent(agent.id);
              setAgents(agents.filter(a => a.id !== agent.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete agent');
            }
          },
        },
      ]
    );
  };

  const renderAgentItem = ({ item: agent }: { item: Agent }) => (
    <Pressable
      style={({ pressed }) => [
        styles.agentItem,
        pressed && styles.agentItemPressed,
      ]}
      onPress={() => handleStartChat(agent)}
      onLongPress={() => handleDeleteAgent(agent)}
    >
      <View style={[styles.iconContainer, { backgroundColor: agent.color }]}>
        <MaterialIcons name={agent.icon as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.agentInfo}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentDescription} numberOfLines={2}>
          {agent.description}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => handleEditAgent(agent)}
          hitSlop={8}
        >
          <MaterialIcons name="edit" size={20} color="#999999" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => handleStartChat(agent)}
          hitSlop={8}
        >
          <MaterialIcons name="chat" size={20} color="#999999" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FlatList
        data={agents}
        renderItem={renderAgentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.createButtonPressed,
        ]}
        onPress={handleCreateAgent}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create New Agent</Text>
      </Pressable>
    </SafeAreaView>
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
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  agentItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
    marginRight: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: 14,
    color: '#666666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4EFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  createButtonPressed: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
}); 