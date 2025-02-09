import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { CodeBlock } from './CodeBlock';
import { Message as MessageType } from '@/constants/Config';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageProps {
  message: MessageType;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onEdit, onRegenerate, onCopy }) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }
    onEdit?.(message.id, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, isDarkMode && styles.darkEditInput]}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            autoFocus
          />
          <View style={styles.editButtons}>
            <Pressable
              style={[styles.editButton, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}
              onPress={handleCancelEdit}
            >
              <Text style={[styles.editButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={[styles.editButton, { backgroundColor: '#6B4EFF' }]}
              onPress={handleSaveEdit}
            >
              <Text style={[styles.editButtonText, { color: '#FFFFFF' }]}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: message.content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.content.length) {
      parts.push({
        type: 'text',
        content: message.content.slice(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return <CodeBlock key={index} code={part.content} language={part.language} />;
      }
      return (
        <Text key={index} style={[styles.text, isDarkMode && styles.darkText]}>
          {part.content}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, message.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
      {message.role === 'assistant' && (
        <View style={styles.avatar}>
          <MaterialIcons name="smart-toy" size={20} color="#FFFFFF" />
        </View>
      )}
      <View style={[
        styles.messageContent,
        message.role === 'user' ? styles.userMessageContent : styles.assistantMessageContent,
        isDarkMode && message.role === 'assistant' && styles.darkAssistantMessageContent
      ]}>
        {renderContent()}
        {message.isEdited && !isEditing && (
          <Text style={[styles.editedLabel, isDarkMode && styles.darkEditedLabel]}>
            (edited)
          </Text>
        )}
      </View>
      {message.role === 'user' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
            onPress={() => onCopy?.(message.content)}
            hitSlop={8}
          >
            <MaterialIcons name="content-copy" size={16} color={isDarkMode ? '#CCCCCC' : '#999999'} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
            onPress={() => setIsEditing(true)}
            hitSlop={8}
          >
            <MaterialIcons name="edit" size={16} color={isDarkMode ? '#CCCCCC' : '#999999'} />
          </Pressable>
        </View>
      )}
      {message.role === 'assistant' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
            onPress={() => onCopy?.(message.content)}
            hitSlop={8}
          >
            <MaterialIcons name="content-copy" size={16} color={isDarkMode ? '#CCCCCC' : '#999999'} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
            onPress={() => onRegenerate?.(message.id)}
            hitSlop={8}
          >
            <MaterialIcons name="refresh" size={16} color={isDarkMode ? '#CCCCCC' : '#999999'} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B4EFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: '#6B4EFF',
    borderBottomRightRadius: 4,
  },
  assistantMessageContent: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  darkAssistantMessageContent: {
    backgroundColor: '#1C1C1E',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  darkActionButton: {
    backgroundColor: '#1C1C1E',
  },
  editContainer: {
    width: '100%',
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  darkEditInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editedLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  darkEditedLabel: {
    color: '#666666',
  },
}); 