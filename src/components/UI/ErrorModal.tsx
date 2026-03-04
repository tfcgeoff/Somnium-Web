/**
 * Shared ErrorModal Component
 *
 * Generic error modal component
 *
 * Previously platform-split as ErrorModal.web.tsx and ErrorModal.native.tsx
 * Consolidated because code is identical across platforms
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../services/ThemeContext';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Something went wrong',
  message,
  onDismiss,
}) => {
  const { currentTheme: colors } = useTheme();

  if (!visible) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 1000,
    },
    container: {
      width: '100%',
      maxWidth: Math.min(window.innerWidth * 0.9, 400),
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.textMain,
    },
    message: {
      fontSize: 16,
      lineHeight: '24px',
      marginBottom: 24,
      color: colors.textMuted,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: colors.primary,
      border: 'none',
      cursor: 'pointer',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  };

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        <span style={styles.title}>{title}</span>
        <span style={styles.message}>{message}</span>

        <button
          style={styles.button}
          onClick={onDismiss}
        >
          <span style={styles.buttonText}>OK</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ErrorModal;
