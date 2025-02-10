import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@gemini_theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setIsDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载保存的主题设置
  useEffect(() => {
    loadTheme();
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (!isLoaded) return;
    saveTheme(systemColorScheme === 'dark');
  }, [systemColorScheme, isLoaded]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // 如果没有保存的主题设置，使用系统主题
        setIsDarkMode(systemColorScheme === 'dark');
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading theme:', error);
      // 发生错误时使用系统主题
      setIsDarkMode(systemColorScheme === 'dark');
      setIsLoaded(true);
    }
  };

  const saveTheme = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
      setIsDarkMode(isDark);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    saveTheme(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 