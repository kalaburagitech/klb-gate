import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
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
  text: '#263238',
  border: 'rgba(0,0,0,0.05)',
  notification: '#4CAF50',
};

const DarkTheme: ThemeColors = {
  primary: '#4CAF50',
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  border: 'rgba(255,255,255,0.1)',
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
  const [themeMode, setThemeMode] = useState<ThemeMode>('SYSTEM');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('klb_theme_mode');
      if (saved) setThemeMode(saved as ThemeMode);
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const saveTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('klb_theme_mode', mode);
  };

  const isDark = themeMode === 'SYSTEM' ? systemScheme === 'dark' : themeMode === 'DARK';
  const colors = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode: saveTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
