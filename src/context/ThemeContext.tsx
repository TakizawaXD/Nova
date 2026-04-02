'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Theme = 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'slate';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Clave de localStorage única por usuario para aislar sus preferencias de tema */
const getThemeKey = (uid: string | null) => uid ? `nova-theme-${uid}` : 'nova-theme-guest';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('purple');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Cargar el tema del usuario autenticado cuando cambia la sesión
  useEffect(() => {
    const key = getThemeKey(currentUser?.uid ?? null);
    const saved = localStorage.getItem(key) as Theme | null;
    setThemeState(saved || 'purple');
  }, [currentUser]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const key = getThemeKey(currentUser?.uid ?? null);
    localStorage.setItem(key, newTheme);
  };

  // Aplicar clase CSS al body cuando cambia el tema
  useEffect(() => {
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
