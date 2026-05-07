import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
}

const LightTheme: ThemeColors = {
  primary: '#2E7D32',
  background: '#F1F8E9',
  card: '#FFFFFF',
  text: '#1B262C',
  border: 'rgba(46, 125, 50, 0.08)',
  notification: '#4CAF50',
};

const DarkTheme: ThemeColors = {
  primary: '#4CAF50',
  background: '#0F120F',
  card: '#1A1F1A',
  text: '#F5F5F5',
  border: 'rgba(255, 255, 255, 0.1)',
  notification: '#2E7D32',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('SYSTEM');
  const systemScheme = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('klb_theme_mode');
      if (saved) setThemeModeState(saved as ThemeMode);
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('klb_theme_mode', mode);
  };

  const isDark = themeMode === 'SYSTEM' ? systemScheme === 'dark' : themeMode === 'DARK';
  const colors = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    console.log(`🌓 Theme Changed: Mode=${themeMode}, System=${systemScheme}, Final=${isDark ? 'DARK' : 'LIGHT'}`);
  }, [themeMode, systemScheme, isDark]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
