import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function RootLayoutNav() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
          },
          headerTitleStyle: {
            color: isDarkMode ? '#FFFFFF' : '#000000',
          },
          headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
          contentStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="agent/[id]"
          options={{
            headerShown: true,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="chats"
          options={{
            headerShown: true,
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
