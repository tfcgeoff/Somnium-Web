/**
 * EulaModal.web.tsx
 *
 * PLATFORM: Web
 *
 * End User License Agreement modal
 *
 * Platform Differences: None - code is identical across platforms
 */

import React from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { commonStyles } from '../../../constants/styles';

interface EulaModalProps {
  onClose: () => void;
}

const EulaModal: React.FC<EulaModalProps> = ({ onClose }) => {
  const { currentTheme: colors } = useTheme();

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
      maxWidth: 600,
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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    content: {
      marginBottom: 20,
      overflowY: 'auto',
      flexGrow: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      color: colors.primary,
    },
    text: {
      fontSize: 14,
      lineHeight: '20px',
      marginBottom: 8,
      color: colors.textMain,
    },
    footer: {
      marginTop: 20,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
    },
    footerText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: colors.textMuted,
    },
    closeButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.primary,
      border: 'none',
      cursor: 'pointer',
      width: '100%',
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.isDark ? colors.background : colors.textMain, // Assuming colors.isDark exists
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>End User License Agreement</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.textMuted, fontSize: 20 }}>✕</span>
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.sectionTitle}>
            1. Acceptance of Terms
          </p>
          <p style={styles.text}>
            By accessing or using the Dream Catcher application ("App"), you agree to be bound by
            this End User License Agreement (EULA). If you do not agree to these terms, please do
            not use the App.
          </p>

          <p style={styles.sectionTitle}>2. License Grant</p>
          <p style={styles.text}>
            You are granted a limited, non-exclusive, non-transferable license to use the App for
            personal, non-commercial purposes. You may not modify, reverse engineer, or distribute
            the App.
          </p>

          <p style={styles.sectionTitle}>3. User Content</p>
          <p style={styles.text}>
            You retain ownership of any content you create within the App. By using the App, you
            grant us a license to store, process, and transmit your content solely to provide the
            App's services.
          </p>

          <p style={styles.sectionTitle}>
            4. AI-Generated Content
          </p>
          <p style={styles.text}>
            The App uses artificial intelligence to generate narrative content. Such content is
            provided "as is" and may not always be accurate, appropriate, or suitable for all
            audiences. You use AI-generated content at your own risk.
          </p>

          <p style={styles.sectionTitle}>5. Disclaimers</p>
          <p style={styles.text}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <p style={styles.sectionTitle}>
            6. Limitation of Liability
          </p>
          <p style={styles.text}>
            In no event shall we be liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the App.
          </p>

          <p style={styles.sectionTitle}>7. Termination</p>
          <p style={styles.text}>
            We reserve the right to terminate or suspend your access to the App at any time, with or
            without cause, with or without notice.
          </p>

          <p style={styles.sectionTitle}>8. Governing Law</p>
          <p style={styles.text}>
            This EULA shall be governed by and construed in accordance with applicable laws.
          </p>

          <p style={styles.sectionTitle}>9. Changes to Terms</p>
          <p style={styles.text}>
            We reserve the right to modify this EULA at any time. Continued use of the App after
            such changes constitutes acceptance of the new terms.
          </p>

          <p style={styles.sectionTitle}>10. Contact</p>
          <p style={styles.text}>
            For questions about this EULA, please contact us through the App's support channels.
          </p>

          <div style={styles.footer}>
            <span style={styles.footerText}>
              Last Updated: December 26, 2025
            </span>
          </div>
        </div>

        <button
          style={styles.closeButton}
          onClick={onClose}
        >
          <span
            style={styles.closeButtonText}
          >
            I Accept
          </span>
        </button>
      </div>
    </div>
  );
};

export default EulaModal;
