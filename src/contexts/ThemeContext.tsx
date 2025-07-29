import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { ThemeContextType } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { toast } from 'react-hot-toast';

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-dark-mode', false);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
    toast.success(`Tema ${!isDarkMode ? 'escuro' : 'claro'} ativado`);
  }, [isDarkMode, setIsDarkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(isDarkMode ? 'light' : 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const value = useMemo(() => ({ 
    isDarkMode, 
    toggleTheme 
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};