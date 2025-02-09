import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CodeBlock } from './CodeBlock';
import { Message as MessageType } from '@/constants/Config';
import { MaterialIcons } from '@expo/vector-icons';

interface MessageProps {
  message: MessageType;
  onEdit?: (messageId: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onEdit }) => {
  const renderContent = () => {
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
      </View>
      {message.role === 'user' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onEdit?.(message.id)}
            hitSlop={8}
          >
            <MaterialIcons name="content-copy" size={16} color="#999999" />
          </Pressable>
        </View>
      )}
      {message.role === 'assistant' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onEdit?.(message.id)}
            hitSlop={8}
          >
            <MaterialIcons name="content-copy" size={16} color="#999999" />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => onEdit?.(message.id)}
            hitSlop={8}
          >
            <MaterialIcons name="refresh" size={16} color="#999999" />
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
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
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
}); 