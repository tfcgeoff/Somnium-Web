/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: RandomizeAdModal.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review RandomizeAdModal.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - WEB IS FOR TESTING ONLY - auto-grants ad reward without showing ads
 * - TODO: Implement Google AdSense integration if web becomes production
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../services/ThemeContext';

interface RandomizeAdModalProps {
  visible: boolean;
  remaining: number;
  onWatchAd: () => void;
  onClose: () => void;
}

const RandomizeAdModal: React.FC<RandomizeAdModalProps> = ({
  visible,
  remaining,
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

  return createPortal(
    <div style={{
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
    }}>
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <button onClick={onClose} style={{
            padding: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            <span style={{ color: colors.primary, fontSize: 18, lineHeight: '22px' }}>← Back</span>
          </button>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>🎲 Randomize</span>
          <div style={{ width: 50 }} />
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {remaining > 0 ? (
            <>
              <span style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center', display: 'block', color: colors.textMain }}>
                Watch a short ad to unlock an additional randomize?
              </span>
              <span style={{ fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: '20px', display: 'block', color: colors.textMuted }}>
                You have {remaining} free randomize{remaining !== 1 ? 's' : ''} remaining for this story.
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center', display: 'block', color: colors.textMain }}>
                No more free randomizes remaining
              </span>
              <span style={{ fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: '20px', display: 'block', color: colors.textMuted }}>
                {isLocalhost
                  ? 'Development mode: Randomize will be unlocked automatically.'
                  : 'Watch a short ad to unlock 1 additional randomize for this story.'}
              </span>
            </>
          )}

          {/* Ad Placeholder */}
          <div style={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 8,
            borderWidth: 2,
            borderStyle: 'dashed',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}>
            <span style={{ fontSize: 24, marginBottom: 4, color: colors.textMuted }}>
              {isLocalhost ? '🛠️ Dev Mode' : '📺 Video Ad'}
            </span>
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              {isLocalhost ? 'Auto-unlocked' : '15 seconds'}
            </span>
          </div>

          {/* Info box */}
          <div style={{
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            marginBottom: 8,
            backgroundColor: colors.background + '40',
            borderColor: colors.border,
          }}>
            <span style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, display: 'block', color: colors.primary }}>How it works:</span>
            <span style={{ fontSize: 13, lineHeight: '18px', marginBottom: 4, display: 'block', color: colors.textMuted }}>
              • Each story starts with 5 free randomizes
            </span>
            <span style={{ fontSize: 13, lineHeight: '18px', marginBottom: 4, display: 'block', color: colors.textMuted }}>
              • After using all 5, watch an ad to unlock 1 more
            </span>
            <span style={{ fontSize: 13, lineHeight: '18px', display: 'block', color: colors.textMuted }}>
              • Randomizes apply to: Name, Character Name, Theme, Description, or All
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'row', padding: 16, gap: 12 }}>
          <button
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: 'transparent',
              borderColor: colors.border,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            <span style={{ fontSize: 16, fontWeight: '600', color: colors.textMain }}>Cancel</span>
          </button>
          <button
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 0,
              backgroundColor: colors.primary,
              cursor: 'pointer',
            }}
            onClick={onWatchAd}
          >
            <span style={{ fontSize: 16, fontWeight: '600', color: colors.background }}>
              {isLocalhost ? 'Unlock' : 'Watch Ad'}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RandomizeAdModal;
