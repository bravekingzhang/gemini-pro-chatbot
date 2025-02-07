import React from 'react';
import { View, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.language}>{language}</Text>
      </View>
      <ScrollView
        horizontal
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}
      >
        <SyntaxHighlighter
          language={language}
          style={vs2015}
          customStyle={styles.codeBlock}
          highlighter="hljs"
        >
          {code}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  header: {
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333333',
  },
  language: {
    color: '#999999',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  scrollView: {
    maxHeight: 300,
  },
  codeBlock: {
    padding: 12,
    fontSize: 14,
    backgroundColor: '#1E1E1E',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
  },
});