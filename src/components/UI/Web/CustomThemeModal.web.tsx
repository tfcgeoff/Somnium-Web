/**
 * CustomThemeModal.web.tsx
 *
 * PLATFORM: Web
 *
 * Modal for creating custom color themes with visual color picker
 *
 * Platform Differences: None - code is identical across platforms
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../services/ThemeContext';
import type { ThemePalette } from '../../../constants/styles';
import { getItem, setItem } from '../../../services/storageService';
import ColorPicker from './ColorPicker.web';

interface CustomThemeModalProps {
  onClose: () => void;
  onSave: (theme: ThemePalette) => void;
}

const CUSTOM_THEME_STORAGE_KEY = 'dream_catcher_custom_theme';

const CustomThemeModal: React.FC<CustomThemeModalProps> = ({ onClose, onSave }) => {
  const { currentTheme: colors } = useTheme();

  // Initialize with current theme or custom theme from storage
  const [customTheme, setCustomTheme] = useState<ThemePalette>({
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    textMain: colors.textMain,
    textMuted: colors.textMuted,
    isDark: colors.isDark,
  });

  useEffect(() => {
    // Load custom theme from storage on mount
    void (async () => {
      try {
        const saved = await getItem(CUSTOM_THEME_STORAGE_KEY);
        if (saved) {
          setCustomTheme(JSON.parse(saved) as ThemePalette);
        }
      } catch (error) {
        console.error('Failed to load custom theme:', error);
      }
    })();
  }, []);

  const handleColorChange = (key: keyof ThemePalette, value: string) => {
    setCustomTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save to storage
    void setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
    onSave(customTheme);
    onClose();
  };

  const handleReset = async () => {
    // Reset to current theme
    setCustomTheme({
      background: colors.background,
      surface: colors.surface,
      border: colors.border,
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      textMain: colors.textMain,
      textMuted: colors.textMuted,
      isDark: colors.isDark,
    });
    // Also remove from storage
    try {
      const { removeItem } = await import('../../../services/storageService');
      await removeItem(CUSTOM_THEME_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove custom theme:', error);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backgroundColor: `${colors.background}CC`,
    },
    modalContainer: {
      width: '90%',
      maxWidth: 500,
      maxHeight: '80%',
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      padding: 4,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    spacer: {
      width: 50,
    },
    subtitle: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 20,
      color: colors.textMuted,
    },
    content: {
      marginBottom: 20,
      overflowY: 'auto',
      flexGrow: 1,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.primary,
    },
    previewSection: {
      marginTop: 20,
    },
    previewBox: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: customTheme.border, // Use customTheme's border for preview
      backgroundColor: customTheme.background, // Use customTheme's background for preview
    },
    previewCard: {
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: customTheme.surface, // Use customTheme's surface for preview
      borderColor: customTheme.border, // Use customTheme's border for preview
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: customTheme.primary, // Use customTheme's primary for preview
    },
    previewText: {
      fontSize: 14,
      marginBottom: 4,
      color: customTheme.textMain, // Use customTheme's textMain for preview
    },
    previewMuted: {
      fontSize: 12,
      marginBottom: 12,
      color: customTheme.textMuted, // Use customTheme's textMuted for preview
    },
    previewButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginRight: 8,
      backgroundColor: customTheme.primary, // Use customTheme's primary for preview
      border: 'none',
    },
    previewTertiary: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: 'flex-start',
      backgroundColor: customTheme.tertiary, // Use customTheme's tertiary for preview
      border: 'none',
    },
    previewButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: customTheme.textMain, // Use customTheme's textMain for preview
    },
    contrastWarning: {
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    contrastText: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.textMuted,
    },
    footer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      cursor: 'pointer',
      border: 'none',
    },
    secondaryButton: {
      backgroundColor: colors.border,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header with back arrow on left */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.backButton}>
            <span style={{ color: colors.primary, fontSize: 18, lineHeight: '22px' }}>← Back</span>
          </button>
          <span style={styles.title}>Custom Theme</span>
          <div style={styles.spacer} />
        </div>

        <div style={styles.content}>
          <span style={styles.subtitle}>
            Create your own color scheme. Use the color pickers to customize each color.
          </span>

          <span style={styles.sectionTitle}>Background Colors</span>
          <ColorPicker
            label="Background"
            color={customTheme.background}
            onColorChange={value => handleColorChange('background', value)}
          />
          <ColorPicker
            label="Surface (Cards/Panels)"
            color={customTheme.surface}
            onColorChange={value => handleColorChange('surface', value)}
          />
          <ColorPicker
            label="Border"
            color={customTheme.border}
            onColorChange={value => handleColorChange('border', value)}
          />

          <span style={styles.sectionTitle}>Accent Colors</span>
          <ColorPicker
            label="Primary"
            color={customTheme.primary}
            onColorChange={value => handleColorChange('primary', value)}
          />
          <ColorPicker
            label="Secondary"
            color={customTheme.secondary}
            onColorChange={value => handleColorChange('secondary', value)}
          />
          <ColorPicker
            label="Tertiary"
            color={customTheme.tertiary}
            onColorChange={value => handleColorChange('tertiary', value)}
          />

          <span style={styles.sectionTitle}>Text Colors</span>
          <ColorPicker
            label="Main Text"
            color={customTheme.textMain}
            onColorChange={value => handleColorChange('textMain', value)}
          />
          <ColorPicker
            label="Muted Text"
            color={customTheme.textMuted}
            onColorChange={value => handleColorChange('textMuted', value)}
          />

          <div style={styles.previewSection}>
            <span style={styles.sectionTitle}>Preview</span>
            <div style={styles.previewBox}>
              <div style={styles.previewCard}>
                <span style={styles.previewTitle}>
                  Primary Text
                </span>
                <span style={styles.previewText}>
                  This is how main text will appear
                </span>
                <span style={styles.previewMuted}>
                  This is muted text for secondary info
                </span>
                <button style={styles.previewButton}>
                  <span
                    style={{
                      ...styles.previewButtonText,
                      color: customTheme.isDark ? customTheme.background : customTheme.textMain,
                    }}
                  >
                    Button
                  </span>
                </button>
                <button style={styles.previewTertiary}>
                  <span
                    style={styles.previewButtonText}
                  >
                    Tertiary
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={styles.contrastWarning}>
            <span style={styles.contrastText}>
              Tip: Ensure sufficient contrast between background and text for readability. Use the alpha
              (A) slider to add transparency.
            </span>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleReset}
          >
            <span style={{ ...styles.buttonText, color: colors.textMain }}>Reset</span>
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleSave}
          >
            <span
              style={{
                ...styles.buttonText,
                color: colors.isDark ? colors.background : colors.textMain,
              }}
            >
              Apply Theme
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeModal;
