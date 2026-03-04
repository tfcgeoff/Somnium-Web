/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: WatchAdModal.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review WatchAdModal.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - Web uses View-based modal overlay (vs TouchableOpacity wrapper on native)
 * - WEB IS FOR TESTING ONLY - auto-grants ad reward without showing ads
 * - TODO: Implement Google AdSense integration if web becomes production
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../services/ThemeContext';

interface WatchAdModalProps {
  visible: boolean;
  themeName: string;
  onWatchAd: () => void;
  onClose: () => void;
}

const WatchAdModal: React.FC<WatchAdModalProps> = ({
  visible,
  themeName,
  onWatchAd,
  onClose,
}) => {
  const { currentTheme: colors } = useTheme();

  // Detect if running on localhost (development mode)
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.port === '19006' || // Expo dev server
    window.location.port === '8081' // Expo web dev server
  );

  if (!visible) return null;

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
      padding: 20,
      zIndex: 10001,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.primary,
    },
    content: {
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    message: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
      color: colors.textMain,
    },
    themeName: {
      fontWeight: 'bold',
      color: colors.primary, // Using primary color for theme name
    },
    description: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: '20px',
      color: colors.textMuted,
    },
    adPlaceholder: {
      width: '100%',
      aspectRatio: '16 / 9',
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: 'dashed',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    adPlaceholderText: {
      fontSize: 24,
      marginBottom: 4,
      color: colors.textMuted,
    },
    adPlaceholderSubtext: {
      fontSize: 12,
      color: colors.textMuted,
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      cursor: 'pointer',
      border: 'none',
    },
    cancelButton: {
      borderWidth: 1,
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    watchButton: {
      borderWidth: 0,
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.textMain,
    },
    watchButtonText: {
      color: colors.background,
    },
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>🔒 Premium Theme</span>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <span style={styles.message}>
            Unlock <span style={styles.themeName}>"{themeName}"</span>
          </span>
          <span style={styles.description}>
            {isLocalhost
              ? 'Development mode: Theme will be unlocked automatically.'
              : 'Please watch a short video to use this premium theme choice.'}
          </span>

          {/* Ad Placeholder */}
          <div style={styles.adPlaceholder}>
            <span style={styles.adPlaceholderText}>
              {isLocalhost ? '🛠️ Dev Mode' : '📺 Video Ad'}
            </span>
            <span style={styles.adPlaceholderSubtext}>
              {isLocalhost ? 'Auto-unlocked' : '15 seconds'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
          >
            <span style={{ ...styles.buttonText, ...styles.cancelButtonText }}>Cancel</span>
          </button>
          <button
            style={{ ...styles.button, ...styles.watchButton }}
            onClick={onWatchAd}
          >
            <span style={{ ...styles.buttonText, ...styles.watchButtonText }}>
              {isLocalhost ? 'Unlock' : 'Watch to Unlock'}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WatchAdModal;
