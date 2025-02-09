import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Agent } from '@/constants/Config';
import { loadAgents, saveAgent } from '@/utils/storage';
import { nanoid } from 'nanoid/non-secure';

const COLORS = ['#6B4EFF', '#00C853', '#FF6B4E', '#FF9100', '#2196F3', '#9C27B0'];
const ICONS = ['chat-bubble-outline', 'edit', 'code', 'psychology', 'science', 'school'];

export default function AgentEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent>({
    id: '',
    name: '',
    description: '',
    systemPrompt: '',
    icon: 'chat-bubble-outline',
    color: '#6B4EFF',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setAgent({
        ...agent,
        id: nanoid(),
      });
    } else {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    const agents = await loadAgents();
    const existingAgent = agents.find(a => a.id === id);
    if (existingAgent) {
      setAgent(existingAgent);
    }
  };

  const handleSave = async () => {
    if (!agent.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your agent');
      return;
    }

    if (!agent.systemPrompt.trim()) {
      Alert.alert('Error', 'Please enter a system prompt for your agent');
      return;
    }

    try {
      await saveAgent({
        ...agent,
        updatedAt: Date.now(),
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save agent');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: id === 'new' ? 'Create Agent' : 'Edit Agent',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <MaterialIcons name="close" size={24} color="#000000" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Pressable
              style={[styles.iconContainer, { backgroundColor: agent.color }]}
              onPress={() => setShowIconPicker(true)}
            >
              <MaterialIcons name={agent.icon as any} size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.colorButton, { backgroundColor: agent.color }]}
              onPress={() => setShowColorPicker(true)}
            >
              <Text style={styles.colorButtonText}>Change Color</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={agent.name}
            onChangeText={name => setAgent({ ...agent, name })}
            placeholder="Enter agent name"
            placeholderTextColor="#999999"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={agent.description}
            onChangeText={description => setAgent({ ...agent, description })}
            placeholder="Describe what this agent does"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>System Prompt</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={agent.systemPrompt}
            onChangeText={systemPrompt => setAgent({ ...agent, systemPrompt })}
            placeholder="Enter the system prompt that defines this agent's behavior"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={5}
          />

          {showColorPicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(color => (
                  <Pressable
                    key={color}
                    style={[styles.colorOption, { backgroundColor: color }]}
                    onPress={() => {
                      setAgent({ ...agent, color });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {showIconPicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map(icon => (
                  <Pressable
                    key={icon}
                    style={styles.iconOption}
                    onPress={() => {
                      setAgent({ ...agent, icon });
                      setShowIconPicker(false);
                    }}
                  >
                    <MaterialIcons name={icon as any} size={24} color="#000000" />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  colorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  colorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  headerButtonPressed: {
    opacity: 0.7,
    backgroundColor: '#E5E5E5',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4EFF',
  },
});