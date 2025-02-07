import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CodeBlock } from './CodeBlock';
import { Message as MessageType } from '../constants/Config';
import { MaterialIcons } from '@expo/vector-icons';

interface MessageProps {
  message: MessageType;
  onEdit?: (messageId: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderContent = () => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: message.content.slice(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
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
        <Text key={index} style={styles.text}>
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
        message.role === 'user' ? styles.userMessageContent : styles.assistantMessageContent
      ]}>
        {renderContent()}
        {message.isEdited && (
          <Text style={styles.editedText}>(edited)</Text>
        )}
      </View>
      {message.role === 'user' && onEdit && (
        <Pressable
          style={styles.editButton}
          onPress={() => onEdit(message.id)}
          hitSlop={8}
        >
          <MaterialIcons name="edit" size={16} color="#999999" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userMessageContent: {
    backgroundColor: '#007AFF',
  },
  assistantMessageContent: {
    backgroundColor: '#333333',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  editedText: {
    color: '#999999',
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    marginLeft: 8,
    alignSelf: 'center',
    padding: 4,
  },
}); 