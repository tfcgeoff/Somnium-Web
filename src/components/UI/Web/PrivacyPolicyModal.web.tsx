/**
 * PrivacyPolicyModal.web.tsx
 *
 * PLATFORM: Web
 *
 * Privacy Policy modal
 *
 * Platform Differences: None - code is identical across platforms
 */

import React from 'react';
import { useTheme } from '../../../services/ThemeContext';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
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
          <span style={styles.title}>Privacy Policy</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.textMuted, fontSize: 20 }}>✕</span>
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.sectionTitle}>
            1. Information We Collect
          </p>
          <p style={styles.text}>
            <span style={{ fontWeight: 'bold' }}>Game Data:</span> We store your story progress,
            characters, and game state locally on your device. This data is used to provide the core
            functionality of the App.
          </p>
          <p style={styles.text}>
            <span style={{ fontWeight: 'bold' }}>API Keys:</span> If you provide your own AI service
            API keys, they are stored locally on your device and never transmitted to our servers.
            They are sent directly to the respective AI service providers.
          </p>
          <p style={styles.text}>
            <span style={{ fontWeight: 'bold' }}>Usage Data:</span> We may collect anonymous usage
            statistics to improve the App's performance and features.
          </p>

          <p style={styles.sectionTitle}>
            2. How We Use Your Information
          </p>
          <p style={styles.text}>Your game data is used to:</p>
          <p style={styles.text}>
            • Save and load your game progress<br/>• Generate AI-powered narrative content<br/>
            Provide personalized story experiences<br/>• Improve App functionality and performance
          </p>

          <p style={styles.sectionTitle}>
            3. Data Sharing and Disclosure
          </p>
          <p style={styles.text}>
            <span style={{ fontWeight: 'bold' }}>AI Service Providers:</span> Your story inputs are
            sent to third-party AI providers (such as Grok, Gemini, OpenAI, etc.) to generate
            narrative content. These providers have their own privacy policies governing data use.
          </p>
          <p style={styles.text}>
            <span style={{ fontWeight: 'bold' }}>No Sale of Personal Data:</span> We do not sell
            your personal data to third parties.
          </p>

          <p style={styles.sectionTitle}>
            4. Data Storage and Security
          </p>
          <p style={styles.text}>
            Game data is stored locally on your device using platform-specific storage (AsyncStorage
            on mobile, localStorage on web). We implement reasonable security measures to protect
            your data, but no method of transmission or storage is completely secure.
          </p>

          <p style={styles.sectionTitle}>
            5. Cookies and Tracking
          </p>
          <p style={styles.text}>
            The App may use cookies and similar technologies for analytics and advertising purposes.
            You can disable cookies in your device settings.
          </p>

          <p style={styles.sectionTitle}>
            6. Advertising and Personalization
          </p>
          <p style={styles.text}>
            The App displays advertisements to support free access to features. Some ads may be
            personalized based on your usage. You can opt out of personalized ads through your
            device settings (for iOS: Settings <br/> Privacy <br/> Apple Advertising; for Android:
            Settings<br/> Google <br/> Ads).
          </p>

          <p style={styles.sectionTitle}>
            7. Children's Privacy
          </p>
          <p style={styles.text}>
            The App is not intended for children under the age of 13. We do not knowingly collect
            personal information from children under 13. If you are a parent or guardian and believe
            your child has provided us with personal information, please contact us.
          </p>

          <p style={styles.sectionTitle}>
            8. Your Rights and Choices
          </p>
          <p style={styles.text}>You have the right to:</p>
          <p style={styles.text}>
            • Access your game data<br/>• Export your game data<br/>• Delete your game data<br/>
            Opt out of personalized advertising<br/>• Disable data collection through device
            settings
          </p>

          <p style={styles.sectionTitle}>9. Data Retention</p>
          <p style={styles.text}>
            Game data is retained on your device until you delete it or uninstall the App. Autosaves
            are managed based on your configured settings.
          </p>

          <p style={styles.sectionTitle}>
            10. International Users
          </p>
          <p style={styles.text}>
            Your information may be transferred to and processed in countries other than your own.
            We take appropriate safeguards to ensure your data remains protected in accordance with
            this Privacy Policy.
          </p>

          <p style={styles.sectionTitle}>
            11. Changes to This Policy
          </p>
          <p style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new policy within the App and updating the "Last Updated" date.
          </p>

          <p style={styles.sectionTitle}>12. Contact Us</p>
          <p style={styles.text}>
            If you have questions about this Privacy Policy or your personal data, please contact us
            through the App's support channels or via the repository hosting this project.
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
            I Understand
          </span>
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
