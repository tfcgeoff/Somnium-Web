/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: ColorSchemeModal.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review ColorSchemeModal.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - None (this component is identical across platforms)
 */

import React from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { PALETTES } from '../../../constants/styles';
import type { ThemePalette } from '../../../constants/styles';
import CustomThemeModal from './CustomThemeModal.web';

interface ColorSchemeModalProps {
  onClose: () => void;
}

const ColorSchemeModal: React.FC<ColorSchemeModalProps> = ({ onClose }) => {
  const { themeName, setTheme, setCustomTheme, currentTheme: colors } = useTheme();
  const [showCustomTheme, setShowCustomTheme] = React.useState(false);

  // Theme pairs: light on left, corresponding dark on right
  const themePairs = [
    ['CONSERVATIVE_LIGHT', 'CONSERVATIVE_DARK'],
    ['HIGH_FANTASY_LIGHT', 'HIGH_FANTASY_DARK'],
  ];
  const extraThemes = ['CYBERPUNK_DARK']; // Themes without light/dark pair

  const handleSaveCustomTheme = (theme: ThemePalette) => {
    setCustomTheme(theme);
    setTheme('CUSTOM');
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
    themeRow: {
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    themeOption: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      cursor: 'pointer',
    },
    themeOptionHalf: {
      flex: 1,
    },
    previewCircle: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    themeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    customThemeButton: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      borderStyle: 'dashed',
      borderWidth: 1,
      cursor: 'pointer',
      background: 'none',
    },
    customThemeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          {/* Header with back arrow on left */}
          <div style={styles.header}>
            <button onClick={onClose} style={styles.backButton}>
              <span style={{ color: colors.primary, fontSize: 18, lineHeight: '22px' }}>← Back</span>
            </button>
            <span style={styles.title}>Color Scheme</span>
            <div style={styles.spacer} />
          </div>

          <div style={styles.content}>
            <span style={styles.subtitle}>
              Choose your preferred color scheme
            </span>

            {/* Theme Pairs - Light on left, Dark on right */}
            {themePairs.map(([lightTheme, darkTheme]) => (
              <div key={lightTheme} style={styles.themeRow}>
                <button
                  style={{
                    ...styles.themeOption,
                    ...styles.themeOptionHalf,
                    backgroundColor: PALETTES[lightTheme].background,
                    borderColor: themeName === lightTheme ? colors.primary : colors.border,
                  }}
                  onClick={() => setTheme(lightTheme)}
                >
                  <div style={{ ...styles.previewCircle, backgroundColor: PALETTES[lightTheme].primary }} />
                  <span style={{ ...styles.themeText, color: PALETTES[lightTheme].textMain }}>
                    {lightTheme.replace('_', ' ')}
                  </span>
                </button>
                <button
                  style={{
                    ...styles.themeOption,
                    ...styles.themeOptionHalf,
                    backgroundColor: PALETTES[darkTheme].background,
                    borderColor: themeName === darkTheme ? colors.primary : colors.border,
                  }}
                  onClick={() => setTheme(darkTheme)}
                >
                  <div style={{ ...styles.previewCircle, backgroundColor: PALETTES[darkTheme].primary }} />
                  <span style={{ ...styles.themeText, color: PALETTES[darkTheme].textMain }}>
                    {darkTheme.replace('_', ' ')}
                  </span>
                </button>
              </div>
            ))}

            {/* Extra themes without pairs */}
            {extraThemes.map(name => (
              <button
                key={name}
                style={{
                  ...styles.themeOption,
                  backgroundColor: PALETTES[name].background,
                  borderColor: themeName === name ? colors.primary : colors.border,
                }}
                onClick={() => setTheme(name)}
              >
                <div style={{ ...styles.previewCircle, backgroundColor: PALETTES[name].primary }} />
                <span style={{ ...styles.themeText, color: PALETTES[name].textMain }}>
                  {name.replace('_', ' ')}
                </span>
              </button>
            ))}

            {/* Custom Theme Button */}
            <button
              style={styles.customThemeButton}
              onClick={() => setShowCustomTheme(true)}
            >
              <span style={styles.customThemeButtonText}>
                + Create Custom Theme
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Theme Modal */}
      {showCustomTheme && (
        <CustomThemeModal
          onClose={() => setShowCustomTheme(false)}
          onSave={handleSaveCustomTheme}
        />
      )}
    </>
  );
};

export default ColorSchemeModal;
