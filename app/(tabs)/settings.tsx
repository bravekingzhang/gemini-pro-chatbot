import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { DEFAULT_SYSTEM_PROMPT } from '@/constants/Config';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_KEY_STORAGE_KEY = '@gemini_api_key';
const SYSTEM_PROMPT_STORAGE_KEY = '@gemini_system_prompt';
const THEME_STORAGE_KEY = '@gemini_theme';
const STREAM_RESPONSE_KEY = '@gemini_stream_response';
const CODE_HIGHLIGHT_KEY = '@gemini_code_highlight';

export default function SettingsScreen() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [streamResponse, setStreamResponse] = useState(true);
  const [highlightCode, setHighlightCode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        savedApiKey,
        savedSystemPrompt,
        savedStreamResponse,
        savedHighlightCode,
      ] = await Promise.all([
        AsyncStorage.getItem(API_KEY_STORAGE_KEY),
        AsyncStorage.getItem(SYSTEM_PROMPT_STORAGE_KEY),
        AsyncStorage.getItem(STREAM_RESPONSE_KEY),
        AsyncStorage.getItem(CODE_HIGHLIGHT_KEY),
      ]);

      if (savedApiKey) setApiKey(savedApiKey);
      if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
      if (savedStreamResponse) setStreamResponse(savedStreamResponse === 'true');
      if (savedHighlightCode) setHighlightCode(savedHighlightCode === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'API Key is required');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim()),
        AsyncStorage.setItem(SYSTEM_PROMPT_STORAGE_KEY, systemPrompt.trim() || DEFAULT_SYSTEM_PROMPT),
        AsyncStorage.setItem(STREAM_RESPONSE_KEY, String(streamResponse)),
        AsyncStorage.setItem(CODE_HIGHLIGHT_KEY, String(highlightCode)),
      ]);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([
                AsyncStorage.removeItem(API_KEY_STORAGE_KEY),
                AsyncStorage.removeItem(SYSTEM_PROMPT_STORAGE_KEY),
                AsyncStorage.removeItem(STREAM_RESPONSE_KEY),
                AsyncStorage.removeItem(CODE_HIGHLIGHT_KEY),
              ]);
              setApiKey('');
              setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
              setIsDarkMode(false);
              setStreamResponse(true);
              setHighlightCode(true);
              Alert.alert('Success', 'Settings reset successfully');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const handleGetApiKey = () => {
    Linking.openURL('https://makersuite.google.com/app/apikey');
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>API Key</Text>
            <View style={styles.apiKeyContainer}>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter your Gemini API Key"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <Pressable
                style={[styles.getApiKeyButton, isDarkMode && styles.darkButton]}
                onPress={handleGetApiKey}
              >
                <Text style={[styles.getApiKeyText, isDarkMode && styles.darkButtonText]}>Get API Key</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>System Prompt</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              placeholder="Enter system prompt"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkLabel]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Enable dark theme for the app
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#E5E5E5', true: '#6B4EFF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkLabel]}>Stream Response</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Show AI responses as they are generated
                </Text>
              </View>
              <Switch
                value={streamResponse}
                onValueChange={setStreamResponse}
                trackColor={{ false: '#E5E5E5', true: '#6B4EFF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkLabel]}>Code Highlighting</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Enable syntax highlighting for code blocks
                </Text>
              </View>
              <Switch
                value={highlightCode}
                onValueChange={setHighlightCode}
                trackColor={{ false: '#E5E5E5', true: '#6B4EFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.saveButton, isDarkMode && styles.darkSaveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.resetButton, isDarkMode && styles.darkResetButton]}
              onPress={handleReset}
            >
              <Text style={[styles.buttonText, styles.resetButtonText, isDarkMode && styles.darkResetButtonText]}>
                Reset to Default
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for bottom tab bar
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  darkLabel: {
    color: '#FFFFFF',
  },
  apiKeyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    color: '#000000',
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  getApiKeyButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  darkButton: {
    backgroundColor: '#1C1C1E',
  },
  getApiKeyText: {
    color: '#6B4EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  darkButtonText: {
    color: '#6B4EFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  darkDescription: {
    color: '#999999',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6B4EFF',
  },
  darkSaveButton: {
    backgroundColor: '#6B4EFF',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  darkResetButton: {
    borderColor: '#FF453A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#FF3B30',
  },
  darkResetButtonText: {
    color: '#FF453A',
  },
});