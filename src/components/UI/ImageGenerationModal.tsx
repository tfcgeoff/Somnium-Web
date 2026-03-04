/**
 * Shared ImageGenerationModal Component (Pure Web)
 *
 * Modal for generating scene images with ad-based unlock system
 *
 * Web version - ads auto-unlock for testing/development
 * TODO: Implement web ads (Google AdSense) if web becomes production
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../services/ThemeContext';

interface ImageGenerationModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (specifics: string) => void;
  onWatchAd: () => void; // Callback when user earns reward from watching ad
  isLoading: boolean;
  canGenerate: boolean; // Whether user can generate now
  isDebug: boolean; // Debug mode bypasses restrictions
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  visible,
  onClose,
  onGenerate,
  onWatchAd,
  isLoading,
  canGenerate,
  isDebug,
}) => {
  const { currentTheme: colors } = useTheme();
  const [specifics, setSpecifics] = useState('');

  // Reset state when modal opens - web auto-unlocks immediately
  useEffect(() => {
    if (visible) {
      setSpecifics('');

      // WEB PLATFORM: Testing only - auto-unlock immediately
      // TODO: Implement web ads (Google AdSense) if web becomes production
      if (!canGenerate && !isDebug) {
        console.log('[ImageGenerationModal] Web/testing mode - auto-unlocking image generation');
        onWatchAd();
      }
    }
  }, [visible, canGenerate, isDebug, onWatchAd]);

  const handleWatchAd = () => {
    // WEB PLATFORM: Testing only - auto-grant ad reward
    console.log('[ImageGenerationModal] Web/testing mode - auto-granting ad reward');
    onWatchAd();
  };

  const handleGenerate = () => {
    if (!canGenerate && !isDebug) {
      return;
    }
    onGenerate(specifics);
  };

  if (!visible) return null;

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  };

  const closeButtonStyle: React.CSSProperties = {
    fontSize: 24,
    padding: '0 8px',
    background: 'transparent',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    color: colors.textMuted,
  };

  const contentStyle: React.CSSProperties = {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const lockedBoxStyle: React.CSSProperties = {
    width: '100%',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  };

  const lockIconStyle: React.CSSProperties = {
    fontSize: 48,
    marginBottom: 12,
    color: colors.textMuted,
  };

  const lockedTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.textMain,
    textAlign: 'center',
  };

  const lockedDescriptionStyle: React.CSSProperties = {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: '20px',
    color: colors.textMuted,
  };

  const settingsNoteStyle: React.CSSProperties = {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.textMuted,
  };

  const unlockedBoxStyle: React.CSSProperties = {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  };

  const unlockIconStyle: React.CSSProperties = {
    fontSize: 32,
    marginBottom: 8,
    color: colors.primary,
  };

  const unlockedTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.primary,
    textAlign: 'center',
  };

  const unlockedSubtextStyle: React.CSSProperties = {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textMuted,
  };

  const debugBoxStyle: React.CSSProperties = {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FFA500',
    backgroundColor: '#FFA50020',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  };

  const debugTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFA500',
  };

  const debugSubtextStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: '20px',
    color: colors.textMain,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: colors.background,
    color: colors.textMain,
    boxSizing: 'border-box',
    resize: 'vertical',
  };

  const generateButtonStyle: React.CSSProperties = {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: colors.primary,
    border: 'none',
    cursor: 'pointer',
  };

  const generateButtonTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.isDark ? colors.background : '#fff',
  };

  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  };

  const loadingTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textMuted,
  };

  const spinnerStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    border: '2px solid ' + colors.primary,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={headerStyle}>
            <span style={titleStyle}>Generate Scene Image</span>
            <button onClick={onClose} disabled={isLoading} style={closeButtonStyle}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={contentStyle}>
            {/* Status Section */}
            {!canGenerate && !isDebug ? (
              <>
                {/* Locked State - Watch Ad to Unlock */}
                <div style={lockedBoxStyle}>
                  <span style={lockIconStyle}>🔒</span>
                  <span style={lockedTitleStyle}>
                    Image Generation Locked
                  </span>
                  <span style={lockedDescriptionStyle}>
                    Watch a short ad to unlock image generation for one image. There's no limit on
                    the number of images you can generate—one ad per image.
                  </span>

                  <button
                    style={{
                      ...generateButtonStyle,
                      marginTop: 16,
                      backgroundColor: colors.primary,
                    }}
                    onClick={handleWatchAd}
                  >
                    <span style={generateButtonTextStyle}>
                      Watch Ad to Unlock
                    </span>
                  </button>
                </div>

                <span style={settingsNoteStyle}>
                  Want instant access? Enter your own API key in Settings.
                </span>
              </>
            ) : (
              <>
                {/* Unlocked State */}
                {!isDebug && (
                  <div style={unlockedBoxStyle}>
                    <span style={unlockIconStyle}>🔓</span>
                    <span style={unlockedTextStyle}>
                      Image Generation Available!
                    </span>
                    <span style={unlockedSubtextStyle}>
                      You've unlocked image generation by watching an ad.
                    </span>
                  </div>
                )}

                {isDebug && (
                  <div style={debugBoxStyle}>
                    <span style={debugTextStyle}>⚠️ DEBUG MODE</span>
                    <span style={debugSubtextStyle}>
                      Restrictions bypassed - image generation unlocked
                    </span>
                  </div>
                )}

                <span style={descriptionStyle}>
                  Describe what you'd like to see in the image. Leave blank for a general scene
                  based on the current story.
                </span>

                <textarea
                  style={inputStyle}
                  value={specifics}
                  onChange={(e) => setSpecifics(e.target.value)}
                  placeholder="e.g., 'A close-up portrait of the protagonist showing their determined expression' or 'The entire room layout showing all characters'"
                  disabled={isLoading}
                />

                {isLoading ? (
                  <div style={loadingContainerStyle}>
                    <div style={spinnerStyle}></div>
                    <span style={loadingTextStyle}>
                      Generating image...
                    </span>
                  </div>
                ) : (
                  <button
                    style={generateButtonStyle}
                    onClick={handleGenerate}
                  >
                    <span style={generateButtonTextStyle}>
                      Generate Image
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageGenerationModal;
