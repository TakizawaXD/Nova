'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'slate';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('nova-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('nova-theme', newTheme);
  };

  useEffect(() => {
    // Remove all theme classes
    const themes: Theme[] = ['purple', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'slate'];
    document.body.classList.remove(...themes.map(t => `theme-${t}`));
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
