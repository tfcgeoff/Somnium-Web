import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ImageProvider, NarrativeSettings } from '../constants/types';
import {
  MAX_NARRATIVE_PARAGRAPHS,
  SUGGESTED_ACTIONS_COUNT,
  DEFAULT_SUMMARIZE_AFTER_TURNS,
} from '../constants/variables';

export type FontFamily = string; // Allow any font name from device
export type FontStyle = 'normal' | 'italic';

interface FontSettings {
  fontSize: number; // 10-24pt, default 12
  fontFamily: FontFamily;
  fontWeight: number; // 100-900, default 400 (normal)
  fontStyle: FontStyle; // default 'normal'
}

interface TransparencySettings {
  textAreaOpacity: number; // 0-100, default 75 (75% opacity = 25% transparent)
}

interface SettingsContextType {
  apiKeys: { [key in ImageProvider]?: string };
  sessionApiKeys: { [key in ImageProvider]?: string }; // Session-only keys
  allApiKeys: { [key in ImageProvider]?: string }; // Combined persistent + session keys
  selectedImageProvider: ImageProvider | null;
  narrativeSettings: NarrativeSettings;
  fontSettings: FontSettings;
  transparencySettings: TransparencySettings;
  setApiKey: (provider: ImageProvider, key: string) => void; // Persistent storage
  setSessionApiKey: (provider: ImageProvider, key: string) => void; // Session-only
  setSelectedImageProvider: (provider: ImageProvider | null) => void;
  setNarrativeSettings: (settings: Partial<NarrativeSettings>) => void;
  setFontSettings: (settings: Partial<FontSettings>) => void;
  setTransparencySettings: (settings: Partial<TransparencySettings>) => void;
}

const API_KEYS_STORAGE_KEY = 'dream_catcher_api_keys';
const SELECTED_PROVIDER_KEY = 'dream_catcher_selected_provider';
const NARRATIVE_SETTINGS_KEY = 'dream_catcher_narrative_settings';
const FONT_SETTINGS_KEY = 'dream_catcher_font_settings';
const TRANSPARENCY_SETTINGS_KEY = 'dream_catcher_transparency_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeysState] = useState<{ [key in ImageProvider]?: string }>({});
  const [sessionApiKeys, setSessionApiKeysState] = useState<{ [key in ImageProvider]?: string }>(
    {}
  );
  const [selectedImageProvider, setSelectedImageProviderState] = useState<ImageProvider | null>(
    null
  );
  const [narrativeSettings, setNarrativeSettingsState] = useState<NarrativeSettings>({
    maxNarrativeParagraphs: MAX_NARRATIVE_PARAGRAPHS,
    suggestedActionsCount: SUGGESTED_ACTIONS_COUNT,
    summarizeAfterTurns: DEFAULT_SUMMARIZE_AFTER_TURNS,
    defaultDirectives: '',
  });
  const [fontSettings, setFontSettingsState] = useState<FontSettings>({
    fontSize: 12,
    fontFamily: 'system',
    fontWeight: 400,
    fontStyle: 'normal',
  });
  const [transparencySettings, setTransparencySettingsState] = useState<TransparencySettings>({
    textAreaOpacity: 75, // Default 75% opacity (25% transparent)
  });

  // Combine persistent and session-only keys
  const allApiKeys = useMemo(() => {
    const combined: { [key in ImageProvider]?: string } = { ...apiKeys };
    // Session keys take precedence over persistent keys
    for (const [provider, key] of Object.entries(sessionApiKeys)) {
      if (key) {
        combined[provider as ImageProvider] = key;
      }
    }
    return combined;
  }, [apiKeys, sessionApiKeys]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
        const savedProvider = localStorage.getItem(SELECTED_PROVIDER_KEY);
        const savedNarrativeSettings = localStorage.getItem(NARRATIVE_SETTINGS_KEY);
        const savedFontSettings = localStorage.getItem(FONT_SETTINGS_KEY);
        const savedTransparencySettings = localStorage.getItem(TRANSPARENCY_SETTINGS_KEY);

        if (savedApiKeys) setApiKeysState(JSON.parse(savedApiKeys));
        if (savedProvider) setSelectedImageProviderState(savedProvider as ImageProvider);
        if (savedNarrativeSettings) setNarrativeSettingsState(JSON.parse(savedNarrativeSettings));
        if (savedFontSettings) {
          const parsed = JSON.parse(savedFontSettings);
          // Ensure fontSize is a number (can be string after JSON.parse from storage)
          setFontSettingsState({
            ...parsed,
            fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : Number(parsed.fontSize) || 12,
          });
        }
        if (savedTransparencySettings) {
          const parsed = JSON.parse(savedTransparencySettings);
          setTransparencySettingsState({
            textAreaOpacity: typeof parsed.textAreaOpacity === 'number' ? parsed.textAreaOpacity : 75,
          });
        }
      } catch (error) {
        console.error('Failed to load app settings from storage', error);
      }
    };
    loadSettings();
  }, []);

  // Set API key with persistent storage
  const setApiKey = async (provider: ImageProvider, key: string) => {
    const newApiKeys = { ...apiKeys, [provider]: key };
    setApiKeysState(newApiKeys);
    try {
      const jsonValue = JSON.stringify(newApiKeys);
      localStorage.setItem(API_KEYS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save API keys to storage', error);
    }
  };

  // Set session-only API key (not persisted)
  const setSessionApiKey = (provider: ImageProvider, key: string) => {
    setSessionApiKeysState(prev => ({ ...prev, [provider]: key }));
  };

  const setSelectedImageProvider = async (provider: ImageProvider | null) => {
    setSelectedImageProviderState(provider);
    try {
      if (provider) {
        localStorage.setItem(SELECTED_PROVIDER_KEY, provider);
      } else {
        localStorage.removeItem(SELECTED_PROVIDER_KEY);
      }
    } catch (error) {
      console.error('Failed to save selected provider to storage', error);
    }
  };

  const setNarrativeSettings = async (settings: Partial<NarrativeSettings>) => {
    const newSettings = { ...narrativeSettings, ...settings };
    setNarrativeSettingsState(newSettings);
    try {
      const jsonValue = JSON.stringify(newSettings);
      localStorage.setItem(NARRATIVE_SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save narrative settings to storage', error);
    }
  };

  const setFontSettings = async (settings: Partial<FontSettings>) => {
    // Ensure fontSize is always a number
    const newSettings = {
      ...fontSettings,
      ...settings,
      fontSize: settings.fontSize !== undefined
        ? (typeof settings.fontSize === 'number' ? settings.fontSize : Number(settings.fontSize) || 12)
        : fontSettings.fontSize,
    };
    setFontSettingsState(newSettings);
    try {
      const jsonValue = JSON.stringify(newSettings);
      localStorage.setItem(FONT_SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save font settings to storage', error);
    }
  };

  const setTransparencySettings = async (settings: Partial<TransparencySettings>) => {
    const newSettings = {
      ...transparencySettings,
      ...settings,
      textAreaOpacity: settings.textAreaOpacity !== undefined
        ? (typeof settings.textAreaOpacity === 'number' ? settings.textAreaOpacity : 75)
        : transparencySettings.textAreaOpacity,
    };
    setTransparencySettingsState(newSettings);
    try {
      const jsonValue = JSON.stringify(newSettings);
      localStorage.setItem(TRANSPARENCY_SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save transparency settings to storage', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        apiKeys,
        sessionApiKeys,
        allApiKeys,
        selectedImageProvider,
        narrativeSettings,
        fontSettings,
        transparencySettings,
        setApiKey,
        setSessionApiKey,
        setSelectedImageProvider,
        setNarrativeSettings,
        setFontSettings,
        setTransparencySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
