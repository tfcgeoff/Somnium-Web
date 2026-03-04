/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: FontSettingsModal.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review FontSettingsModal.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - Uses a curated list of common web fonts instead of native module
 * - No loading state since fonts are static
 * - Added font weight and style options
 * - Added +/- buttons for font size adjustment
 * - Font list in scrollable container
 * - Each font displays in its own font
 */

import React from 'react';
import { useSettings } from '../../../services/SettingsContext';
import { useTheme } from '../../../services/ThemeContext';
import type { FontFamily, FontStyle } from '../../../services/SettingsContext';

interface FontSettingsModalProps {
  onClose: () => void;
}

// Web-safe fonts including accessibility options
const WEB_FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  // Accessibility fonts (loaded via @font-face in web/index.html)
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  { value: 'Lexend', label: 'Lexend' },
  { value: 'AtkinsonHyperlegible', label: 'Atkinson Hyperlegible' },
  // Open source alternatives to common fonts (bundled with app)
  { value: 'LiberationSans', label: 'Liberation Sans' },
  { value: 'LiberationSerif', label: 'Liberation Serif' },
  { value: 'ComicNeue', label: 'Comic Neue' },
  // System defaults
  { value: 'system-ui', label: 'System UI' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  // Common web fonts (may or may not be available on system)
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Bookman', label: 'Bookman' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Impact', label: 'Impact' },
];

// Quick preset buttons for common font weights
const FONT_WEIGHT_PRESETS: { label: string; value: number }[] = [
  { label: 'Light', value: 300 },
  { label: 'Normal', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Bold', value: 700 },
];

const FontSettingsModal: React.FC<FontSettingsModalProps> = ({ onClose }) => {
  const { fontSettings, setFontSettings } = useSettings();
  const { currentTheme: colors } = useTheme();

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10, Math.min(24, (fontSettings.fontSize as number) + delta));
    setFontSettings({ fontSize: newSize });
  };

  const handleFontSizeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Math.round(Number(e.target.value));
    setFontSettings({ fontSize: newSize });
  };

  const handleFontWeightPreset = (presetWeight: number) => {
    setFontSettings({ fontWeight: presetWeight });
  };

  const handleFontWeightSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weightValue = Math.round(Number(e.target.value));
    setFontSettings({ fontWeight: weightValue });
  };

  const handleFontStyleToggle = () => {
    setFontSettings({ fontStyle: fontSettings.fontStyle === 'normal' ? 'italic' : 'normal' });
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
      maxHeight: '85%',
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      display: 'flex',
      flexDirection: 'column',
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
      marginBottom: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    // Font size controls
    sizeControlRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    sizeButtonsRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sizeButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.border,
      backgroundColor: colors.surface,
      cursor: 'pointer',
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textMain,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sizeValue: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    sliderRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sliderLabel: {
      fontSize: 11,
      color: colors.textMuted,
      minWidth: 30,
    },
    slider: {
      flex: 1,
      height: 6,
      cursor: 'pointer',
    },
    // Font weight controls
    weightControlRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    weightButtonsRow: {
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
    },
    weightButton: {
      flex: 1,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: '500',
    },
    // Italic toggle
    italicControlRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    italicLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.textMain,
    },
    italicToggleButton: {
      padding: '10px 20px',
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      cursor: 'pointer',
      fontSize: 14,
      fontStyle: 'italic',
      fontWeight: '600',
    },
    // Preview box
    previewBox: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: `${colors.primary}11`,
    },
    previewText: {
      color: colors.textMain,
    },
    // Font list
    fontListContainer: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 250,
      overflowY: 'auto',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    fontOption: {
      padding: '12px 16px',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: colors.border,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
    },
    fontOptionSelected: {
      backgroundColor: `${colors.primary}22`,
    },
    fontName: {
      flex: 1,
      fontSize: 16,
    },
    checkmark: {
      fontSize: 18,
      color: colors.primary,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.backButton}>
            <span style={{ color: colors.primary, fontSize: 18, lineHeight: '22px' }}>← Back</span>
          </button>
          <span style={styles.title}>Font Settings</span>
          <div style={styles.spacer} />
        </div>

        <div style={styles.content}>
          {/* Font Size Control with +/- buttons and slider */}
          <span style={styles.subtitle}>Font Size</span>
          <div style={styles.sizeControlRow}>
            <div style={styles.sizeButtonsRow}>
              <button
                style={styles.sizeButton}
                onClick={() => handleFontSizeChange(-1)}
                disabled={(fontSettings.fontSize as number) <= 10}
              >
                −
              </button>
              <span style={styles.sizeValue}>{fontSettings.fontSize}pt</span>
              <button
                style={styles.sizeButton}
                onClick={() => handleFontSizeChange(1)}
                disabled={(fontSettings.fontSize as number) >= 24}
              >
                +
              </button>
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>10</span>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={fontSettings.fontSize as number}
                onChange={handleFontSizeSlider}
                style={styles.slider}
              />
              <span style={styles.sliderLabel}>24</span>
            </div>
          </div>

          {/* Font Weight Control with buttons and slider */}
          <span style={styles.subtitle}>Font Weight</span>
          <div style={styles.weightControlRow}>
            <div style={styles.weightButtonsRow}>
              {FONT_WEIGHT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  style={{
                    ...styles.weightButton,
                    backgroundColor: fontSettings.fontWeight === preset.value ? colors.primary : colors.surface,
                    borderColor: fontSettings.fontWeight === preset.value ? colors.primary : colors.border,
                    color: fontSettings.fontWeight === preset.value ? colors.background : colors.textMain,
                  }}
                  onClick={() => handleFontWeightPreset(preset.value)}
                >
                  <span style={{ fontWeight: preset.value }}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ ...styles.sliderRow, justifyContent: 'center', fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
              {fontSettings.fontWeight}
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>200</span>
              <input
                type="range"
                min="200"
                max="700"
                step="1"
                value={fontSettings.fontWeight}
                onChange={handleFontWeightSlider}
                style={styles.slider}
              />
              <span style={styles.sliderLabel}>700</span>
            </div>
          </div>

          {/* Italic Toggle */}
          <div style={styles.italicControlRow}>
            <span style={styles.italicLabel}>Italic Style</span>
            <button
              style={{
                ...styles.italicToggleButton,
                backgroundColor: fontSettings.fontStyle === 'italic' ? colors.primary : colors.surface,
                borderColor: fontSettings.fontStyle === 'italic' ? colors.primary : colors.border,
                color: fontSettings.fontStyle === 'italic' ? colors.background : colors.textMain,
              }}
              onClick={handleFontStyleToggle}
            >
              <span style={{ fontStyle: 'italic' }}>
                {fontSettings.fontStyle === 'italic' ? 'Italic' : 'Normal'}
              </span>
            </button>
          </div>

          {/* Preview */}
          <span style={styles.subtitle}>Preview</span>
          <div style={styles.previewBox}>
            <span
              className="font-preview-exempt"
              style={{
                color: colors.textMain,
                fontSize: fontSettings.fontSize,
                fontFamily: fontSettings.fontFamily === 'system' ? 'system-ui' : fontSettings.fontFamily,
                fontWeight: fontSettings.fontWeight,
                fontStyle: fontSettings.fontStyle,
              }}
            >
              The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            </span>
          </div>

          {/* Font Family List - Scrollable */}
          <span style={styles.subtitle}>Font Family ({WEB_FONT_OPTIONS.length} fonts)</span>
          <div style={styles.fontListContainer}>
            {WEB_FONT_OPTIONS.map(option => (
              <button
                key={option.value}
                style={{
                  ...styles.fontOption,
                  ...(fontSettings.fontFamily === option.value ? styles.fontOptionSelected : {}),
                }}
                onClick={() => setFontSettings({ fontFamily: option.value })}
              >
                <span
                  className="font-preview-exempt"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: option.value === 'system' ? 'system-ui' : option.value,
                    fontWeight: fontSettings.fontWeight,
                    fontStyle: fontSettings.fontStyle,
                    color: fontSettings.fontFamily === option.value ? colors.primary : colors.textMain,
                  }}
                >
                  {option.label}
                </span>
                {fontSettings.fontFamily === option.value && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontSettingsModal;
