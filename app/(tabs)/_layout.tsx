import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
        },
        headerTitleStyle: {
          color: isDarkMode ? '#FFFFFF' : '#000000',
          fontSize: 20,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#1C1C1E' : '#E5E5E5',
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#6B4EFF',
        tabBarInactiveTintColor: isDarkMode ? '#666666' : '#999999',
        headerStatusBarHeight: insets.top,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="chat" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: 'Agents',
          tabBarLabel: 'Agents',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="psychology" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="explore" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
