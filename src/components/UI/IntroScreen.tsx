/**
 * Shared IntroScreen Component
 *
 * Intro screen with Somnium title and begin button
 *
 * Previously platform-split as IntroScreen.web.tsx and IntroScreen.native.tsx
 * Consolidated because code is nearly identical; minor differences handled via Platform.OS
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../services/ThemeContext';
import { commonStyles, introScreenStyles } from '../../constants/styles';
import backgroundImg from '../../assets/SomniumBackground.png';

// Platform-specific import for HelpModal (web version)
import HelpModal from './Web/HelpModal.web';

interface IntroScreenProps {
  onBegin: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onBegin }) => {
  const { currentTheme: colors } = useTheme();
  const [fadeAndSlide, setFadeAndSlide] = useState(false); // State to trigger CSS transitions
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setFadeAndSlide(true);
    }, 100); // Small delay to allow initial render before animating
    return () => clearTimeout(timer);
  }, []);

  const handleBegin = () => {
    onBegin();
  };

  const { innerWidth: width } = window; // Use window.innerWidth for responsiveness

  // Responsive font sizes
  const isSmallScreen = width < 400;
  const isMediumScreen = width < 768;

  const titleFontSize = isSmallScreen ? 40 : isMediumScreen ? 50 : 60;
  const hookFontSize = isSmallScreen ? 18 : 20;

  // Helper function to darken a hex color by a percentage (moved from outside component)
  function darkenColor(color: string, percent: number): string {
    let hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  const styles = {
    helpIcon: {
      width: 28,
      height: 28,
      borderRadius: '50%', // Use '50%' for perfect circle
      borderWidth: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.primary,
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 10,
      background: 'none',
      cursor: 'pointer',
    },
    helpIconText: {
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: colors.primary,
    },
  };

  const backgroundImageStyle = {
    ...introScreenStyles.backgroundImage,
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: 'contain', // Changed from resizeMode 'contain'
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'relative',
        maxWidth: 500,
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
      }}>
        <div style={{ ...backgroundImageStyle, ...introScreenStyles.container }}>
          {/* Dark overlay */}
          <div style={{ ...introScreenStyles.darkOverlay, backgroundColor: colors.background }} />

          {/* Help icon - top right */}
          <button
            style={styles.helpIcon}
            onClick={() => setShowHelp(true)}
          >
            <span style={styles.helpIconText}>i</span>
          </button>

          {/* Title and Hook - positioned at 1/3 from top, centered */}
          <div style={introScreenStyles.titleSection}>
            <div
              style={{
                opacity: fadeAndSlide ? 1 : 0,
                transform: `translateY(${fadeAndSlide ? 0 : '300px'})`,
                transition: 'opacity 800ms ease-out, transform 800ms ease-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: 'EagleLake',
                  fontWeight: '400',
                  fontStyle: 'normal',
                  textAlign: 'center',
                  textShadow: '4px -1.5px 6px #d4af37',
                  marginBottom: 12,
                  color: '#4a90e2',
                  fontSize: titleFontSize,
                  display: 'block',
                }}
              >
                Somnium
              </span>

              <span
                style={{
                  fontFamily: 'EagleLake',
                  fontWeight: '400',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  textShadow: '2px 2px 4px #999999',
                  color: '#e0e0e0',
                  fontSize: hookFontSize,
                  display: 'block',
                }}
              >
                Stories do not begin. They awaken.
              </span>
            </div>
          </div>

          {/* Begin Button - stays at bottom */}
          <div style={introScreenStyles.content}>
            <div style={introScreenStyles.buttonContainer}>
              <div
                style={{
                  opacity: fadeAndSlide ? 1 : 0,
                  transform: `translateY(${fadeAndSlide ? 0 : '300px'})`,
                  transition: 'opacity 800ms ease-out, transform 800ms ease-out',
                }}
              >
                <button
                  data-testid="intro-begin-button"
                  style={{
                    ...introScreenStyles.beginButton,
                    backgroundColor: darkenColor(colors.primary, 20),
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={handleBegin}
                >
                  <span style={{ ...introScreenStyles.beginButtonText, fontSize: isSmallScreen ? 16 : 18 }}>
                    Begin
                  </span>
                </button>
              </div>
            </div>
          </div>

          <HelpModal
            visible={showHelp}
            onClose={() => setShowHelp(false)}
            topicId="gameOverview"
          />
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
