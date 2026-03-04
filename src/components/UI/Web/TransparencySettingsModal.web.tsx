/**
 * @platform web
 *
 * Transparency Settings Modal
 *
 * Allows users to adjust the opacity/transparency of text areas
 * in the Narrative UI and Setup Wizard.
 */

import React from 'react';
import { useSettings } from '../../../services/SettingsContext';
import { useTheme } from '../../../services/ThemeContext';
import backgroundImg from '../../../assets/SomniumBackground.png';

interface TransparencySettingsModalProps {
  onClose: () => void;
}

const TransparencySettingsModal: React.FC<TransparencySettingsModalProps> = ({ onClose }) => {
  const { transparencySettings, setTransparencySettings } = useSettings();
  const { currentTheme: colors } = useTheme();

  // Convert opacity (0-100) to alpha (0-1) for rgba
  const opacityToAlpha = (opacity: number) => (opacity / 100).toFixed(2);

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
      marginBottom: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    previewContainer: {
      height: 150,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    previewTextArea: {
      flex: 1,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: `rgba(0, 0, 0, ${opacityToAlpha(transparencySettings.textAreaOpacity)})`,
      borderColor: colors.border,
    },
    previewText: {
      fontSize: 14,
      lineHeight: '20px',
      color: colors.textMain,
    },
    sliderContainer: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
      borderColor: colors.border,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderLabels: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    sliderLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    description: {
      fontSize: 12,
      textAlign: 'center',
      fontStyle: 'italic',
      color: colors.textMuted,
      marginTop: 16,
    },
    okButton: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primary,
      marginTop: 24,
      border: 'none',
      cursor: 'pointer',
    },
    okButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.background,
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
          <span style={styles.title}>Text Area Transparency</span>
          <div style={styles.spacer} />
        </div>

        {/* Live Preview Section */}
        <span style={styles.subtitle}>Live Preview</span>
        <div style={styles.previewContainer}>
          <div style={styles.previewTextArea}>
            <span style={styles.previewText}>
              This is how your text areas will appear. Adjust the opacity slider below to change the transparency level.
            </span>
            <span style={{ ...styles.previewText, marginTop: 12 }}>
              Higher opacity = more solid background
              Lower opacity = more transparent
            </span>
          </div>
        </div>

        {/* Slider Section */}
        <span style={{ ...styles.subtitle, marginTop: 24 }}>
          Background Opacity: {Math.round(transparencySettings.textAreaOpacity)}%
        </span>
        <div style={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={transparencySettings.textAreaOpacity}
            onChange={(e) => setTransparencySettings({ textAreaOpacity: Math.round(Number(e.target.value)) })}
            style={styles.slider}
          />
          <div style={styles.sliderLabels}>
            <span style={styles.sliderLabel}>0%</span>
            <span style={{ ...styles.sliderLabel, fontWeight: '600' }}>
              {Math.round(transparencySettings.textAreaOpacity)}%
            </span>
            <span style={styles.sliderLabel}>100%</span>
          </div>
        </div>

        {/* Description */}
        <span style={styles.description}>
          0% = Fully transparent (no background)
          100% = Fully solid (opaque background)
          Default: 75%
        </span>

        {/* OK Button */}
        <button
          style={styles.okButton}
          onClick={onClose}
        >
          <span style={styles.okButtonText}>OK</span>
        </button>
      </div>
    </div>
  );
};

export default TransparencySettingsModal;
