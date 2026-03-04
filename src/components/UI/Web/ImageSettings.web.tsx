/**
 * ImageSettings.web.tsx (Pure Web)
 *
 * PLATFORM: Web
 *
 * Image generation provider settings UI
 */

import React, { useMemo, useState } from 'react';
import { useSettings } from '../../../services/SettingsContext';
import { IMAGE_PROVIDERS, IMAGE_PROVIDER_NAMES } from '../../../constants/types';
import type { ImageProvider } from '../../../constants/types';
import { useTheme } from '../../../services/ThemeContext';
import { settingsMenuStyles } from '../../../constants/styles';

interface ImageSettingsProps {
  onBack: () => void;
}

// List of image generation providers with descriptions
const IMAGE_PROVIDER_DESCRIPTIONS: { [key in ImageProvider]: string } = {
  GROK: 'Grok (xAI) - Fast, high-quality image generation',
  OpenRouter: 'OpenRouter - Access to multiple image models (Flux, etc.)',
  StabilityAI: 'Stability AI - Stable Diffusion XL',
  OpenAI: 'OpenAI DALL-E 3 - Premium image generation',
  ZAI: 'Z.AI - CogView image generation',
};

const ImageSettings: React.FC<ImageSettingsProps> = ({ onBack }) => {
  const {
    apiKeys,
    sessionApiKeys,
    setApiKey,
    setSessionApiKey,
    selectedImageProvider,
    setSelectedImageProvider,
  } = useSettings();
  const { currentTheme: colors } = useTheme();

  // State for save preference (permanent vs session) for each provider
  const [savePreference, setSavePreference] = useState<{ [key in ImageProvider]?: boolean }>({});

  // Combine persistent and session keys for display
  const allKeys = useMemo(() => {
    const combined: { [key in ImageProvider]?: string } = { ...apiKeys };
    for (const [provider, key] of Object.entries(sessionApiKeys)) {
      if (key) {
        combined[provider as ImageProvider] = key;
      }
    }
    return combined;
  }, [apiKeys, sessionApiKeys]);

  // Filter providers that have API keys available
  const availableProviders = useMemo(() => {
    return IMAGE_PROVIDERS.filter(
      provider => allKeys[provider] && allKeys[provider]!.trim() !== ''
    );
  }, [allKeys]);

  // Reset selected provider if it's no longer available
  React.useEffect(() => {
    if (selectedImageProvider && !allKeys[selectedImageProvider]) {
      setSelectedImageProvider(null);
    }
  }, [selectedImageProvider, allKeys, setSelectedImageProvider]);

  const handleApiKeyChange = (provider: ImageProvider, key: string) => {
    if (savePreference[provider]) {
      setApiKey(provider, key);
    } else {
      setSessionApiKey(provider, key);
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
  };

  const backButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const titleSectionStyle: React.CSSProperties = {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    paddingBottom: 12,
    marginBottom: 16,
  };

  const scrollViewStyle: React.CSSProperties = {
    maxHeight: 400,
    overflowY: 'auto',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    color: colors.textMuted,
  };

  const pickerWrapperStyle: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 45,
    padding: '0 16px',
    backgroundColor: colors.surface,
    border: 'none',
    color: colors.textMain,
    fontSize: 16,
    cursor: 'pointer',
  };

  const descriptionTextStyle: React.CSSProperties = {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: '18px',
    color: colors.textMuted,
  };

  const providerCardStyle: React.CSSProperties = {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  };

  const providerHeaderStyle: React.CSSProperties = {
    marginBottom: 4,
  };

  const providerTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMain,
  };

  const providerDescriptionStyle: React.CSSProperties = {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: '16px',
    color: colors.textMuted,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
    color: colors.textMain,
    borderColor: colors.border,
    boxSizing: 'border-box',
  };

  const saveOptionRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const checkboxContainerStyle: React.CSSProperties = {
    marginRight: 12,
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  };

  const checkboxStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const checkboxLabelContainerStyle: React.CSSProperties = {
    flex: 1,
  };

  const checkboxLabelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  };

  const checkboxSublabelStyle: React.CSSProperties = {
    fontSize: 12,
    marginTop: 2,
    color: colors.textMuted,
  };

  const eulaTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
    lineHeight: '16px',
  };

  const infoBoxStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    marginBottom: 20,
  };

  const infoBoxTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  };

  const infoBoxTextStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: '18px',
    color: colors.textMain,
  };

  return (
    <div style={containerStyle}>
      {/* Back button in corner */}
      <div style={{ alignItems: 'flex-start', marginBottom: 8 }}>
        <button onClick={onBack} style={backButtonStyle}>
          <span style={{ color: colors.primary, fontSize: 20, lineHeight: '22px', marginTop: -4 }}>←</span>
          <span style={{ color: colors.primary, fontSize: 16, lineHeight: '22px', marginLeft: 4 }}>Back</span>
        </button>
      </div>

      {/* Title centered below back button */}
      <div style={titleSectionStyle}>
        <span style={{ ...settingsMenuStyles.menuTitle, color: colors.primary }}>Image Settings</span>
      </div>

      <div style={scrollViewStyle}>
        <span style={sectionLabelStyle}>Active Provider</span>
        <div style={pickerWrapperStyle}>
          <select
            value={selectedImageProvider || ''}
            onChange={(e) => setSelectedImageProvider(e.target.value as ImageProvider | null)}
            style={selectStyle}
          >
            <option value="">-- None --</option>
            {availableProviders.map(provider => (
              <option key={provider} value={provider}>
                {IMAGE_PROVIDER_NAMES[provider]}
              </option>
            ))}
          </select>
        </div>

        {availableProviders.length === 0 && (
          <span style={{ color: colors.textMuted, fontStyle: 'italic', marginTop: 8 }}>
            No providers configured. Add an API key below to enable image generation.
          </span>
        )}

        <span style={{ ...sectionLabelStyle, marginTop: 24 }}>
          Image Generation API Keys
        </span>

        <span style={descriptionTextStyle}>
          Add your own API key to generate images instantly, or use the app for 30 minutes to unlock
          free image generation.
        </span>

        {IMAGE_PROVIDERS.map(provider => (
          <div key={provider} style={providerCardStyle}>
            <div style={providerHeaderStyle}>
              <span style={providerTitleStyle}>
                {IMAGE_PROVIDER_NAMES[provider]}
              </span>
            </div>
            <span style={providerDescriptionStyle}>
              {IMAGE_PROVIDER_DESCRIPTIONS[provider]}
            </span>

            <input
              type="password"
              style={inputStyle}
              value={allKeys[provider] || ''}
              onChange={(e) => handleApiKeyChange(provider, e.target.value)}
              placeholder={`Enter your ${IMAGE_PROVIDER_NAMES[provider]} key...`}
            />

            <div style={saveOptionRowStyle}>
              <button
                style={checkboxContainerStyle}
                onClick={() =>
                  setSavePreference(prev => ({ ...prev, [provider]: !prev[provider] }))
                }
              >
                <div
                  style={{ ...checkboxStyle, backgroundColor: savePreference[provider] ? colors.primary : colors.surface, borderColor: colors.border }}
                >
                  {savePreference[provider] && (
                    <span
                      style={{ color: colors.isDark ? colors.background : '#fff', fontSize: 12 }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </button>
              <div style={checkboxLabelContainerStyle}>
                <span style={checkboxLabelStyle}>
                  Save API key permanently
                </span>
                <span style={checkboxSublabelStyle}>
                  {savePreference[provider]
                    ? 'Key will be saved to device storage'
                    : 'Key will only be used this session (cleared on app close)'}
                </span>
              </div>
            </div>
          </div>
        ))}

        <span style={eulaTextStyle}>
          Your API keys are stored exclusively on your device. Keys marked "permanently" are saved
          to storage, while session-only keys are cleared when you close the app. They are never
          sent to our servers.
        </span>

        <div
          style={{ ...infoBoxStyle, backgroundColor: `${colors.primary}20`, borderColor: colors.primary }}
        >
          <span style={infoBoxTitleStyle}>
            Free Image Generation
          </span>
          <span style={infoBoxTextStyle}>
            Don't have an API key? Use the app for 30 minutes continuously to unlock free image
            generation powered by Grok AI.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageSettings;
