"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: 'LIGHT' | 'DARK';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('SYSTEM');
  const [resolvedTheme, setResolvedTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');

  const setThemeMode = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
    localStorage.setItem('klb_theme_mode', newMode);
  };

  useEffect(() => {
    // Initial load from localStorage
    const savedTheme = localStorage.getItem('klb_theme_mode') as ThemeMode;
    if (savedTheme) {
      setThemeModeState(savedTheme);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const currentMode = localStorage.getItem('klb_theme_mode') as ThemeMode || 'SYSTEM';
      let resolved: 'LIGHT' | 'DARK';
      
      if (currentMode === 'SYSTEM') {
        resolved = mediaQuery.matches ? 'DARK' : 'LIGHT';
      } else {
        resolved = currentMode === 'DARK' ? 'DARK' : 'LIGHT';
      }
      
      setResolvedTheme(resolved);
      if (resolved === 'DARK') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
