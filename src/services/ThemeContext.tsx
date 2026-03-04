import React, { createContext, useContext, useState, useEffect } from 'react';
import { PALETTES, getGlobalCSS } from '../constants/styles';
import type { ThemePalette } from '../constants/styles';
import { getItem } from './storageService';

interface ThemeContextType {
  currentTheme: ThemePalette;
  themeName: string;
  setTheme: (name: string) => void;
  setCustomTheme: (theme: ThemePalette) => void;
}

const THEME_STORAGE_KEY = 'dream_catcher_theme';
const CUSTOM_THEME_STORAGE_KEY = 'dream_catcher_custom_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState('CONSERVATIVE_DARK');
  const [customTheme, setCustomThemeState] = useState<ThemePalette | null>(null);

  // Get current theme - use custom theme if selected, otherwise use built-in
  const currentTheme =
    themeName === 'CUSTOM' && customTheme
      ? customTheme
      : PALETTES[themeName] || PALETTES.CONSERVATIVE_DARK;

  // Load theme and custom theme from storage on app start
  useEffect(() => {
    const loadThemes = async () => {
      try {
        // Load selected theme name
        let savedTheme: string | null = null;
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        // Load custom theme if it exists
        const savedCustomTheme = await getItem(CUSTOM_THEME_STORAGE_KEY);
        if (savedCustomTheme) {
          try {
            const parsed = JSON.parse(savedCustomTheme) as ThemePalette;
            setCustomThemeState(parsed);
          } catch (e) {
            console.error('Failed to parse custom theme:', e);
          }
        }

        // Set theme name (default to CUSTOM if custom theme exists and was last selected)
        if (savedTheme) {
          if (savedTheme === 'CUSTOM' && !savedCustomTheme) {
            // Custom theme was selected but no longer exists, fall back to default
            setThemeName('CONSERVATIVE_DARK');
          } else {
            setThemeName(savedTheme);
          }
        } else if (savedCustomTheme) {
          // Custom theme exists but no saved preference, use it
          setThemeName('CUSTOM');
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
      }
    };
    void loadThemes();
  }, []);

  // Sync Web CSS whenever theme changes
  useEffect(() => {
    const styleId = 'dream-catcher-styles';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = getGlobalCSS(currentTheme);
  }, [currentTheme]);

  const setTheme = async (name: string) => {
    if (PALETTES[name] || name === 'CUSTOM') {
      setThemeName(name);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, name);
      } catch (error) {
        console.error('Failed to save theme to storage', error);
      }
    }
  };

  const setCustomTheme = (theme: ThemePalette) => {
    setCustomThemeState(theme);
    // Update PALETTES.CUSTOM dynamically
    PALETTES.CUSTOM = theme;
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
