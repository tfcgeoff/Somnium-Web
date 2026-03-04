import React, { useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import type { FontFamily } from './SettingsContext';

let styleElement: HTMLStyleElement | null = null;

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fontSettings } = useSettings();
  const appliedSettingsRef = useRef(`${fontSettings.fontSize}-${fontSettings.fontFamily}-${fontSettings.fontWeight}-${fontSettings.fontStyle}`);

  const getFontFamilyValue = (family: FontFamily): string => {
    switch (family) {
      case 'system':
        return 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      case 'system-ui':
        return 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      case 'sans-serif':
        return 'sans-serif';
      case 'serif':
        return 'serif';
      case 'monospace':
        return 'ui-monospace, Monaco, "Cascadia Code", "Roboto Mono", Courier, monospace';
      default:
        // Custom fonts - use the font name directly
        return `"${family}", system-ui, -apple-system, sans-serif`;
    }
  };

  useEffect(() => {
    const currentSettingsKey = `${fontSettings.fontSize}-${fontSettings.fontFamily}-${fontSettings.fontWeight}-${fontSettings.fontStyle}`;
    // Skip if settings haven't changed
    if (appliedSettingsRef.current === currentSettingsKey) {
      return;
    }
    appliedSettingsRef.current = currentSettingsKey;

    const fontSize = fontSettings.fontSize;
    const fontFamily = getFontFamilyValue(fontSettings.fontFamily);
    const fontWeight = fontSettings.fontWeight; // Now a number directly
    const fontStyle = fontSettings.fontStyle;

    if (typeof document !== 'undefined') {
      // Create style element if it doesn't exist
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dream-catcher-font-styles';
        document.head.appendChild(styleElement);
      }

      // CSS to override React Native Web's inline styles
      // React Native Web uses CSS syntax (font-family) in inline styles
      // EXCLUDE titles, headers, and font preview from font overrides
      const css = `
        /* Set base font on html/body */
        html, body {
          font-family: ${fontFamily} !important;
          font-weight: ${fontWeight} !important;
          font-style: ${fontStyle} !important;
        }

        /* Override font-family in body text elements ONLY - exclude titles, special fonts, Eagle Lake font, and font preview */
        [style*="font-family"]:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not([class*="title"]):not([class*="header"]):not([class*="Title"]):not([class*="Header"]):not(.dream-catcher-title):not([style*="EagleLake"]):not([style*="Eagle Lake"]):not(.font-preview-exempt) {
          font-family: ${fontFamily} !important;
          font-weight: ${fontWeight} !important;
          font-style: ${fontStyle} !important;
        }

        /* Apply to span elements (body text) but NOT titles, Eagle Lake font, or font preview */
        span:not([class*="title"]):not([class*="header"]):not([class*="Title"]):not([class*="Header"]):not(.dream-catcher-title):not([style*="EagleLake"]):not([style*="Eagle Lake"]):not(.font-preview-exempt) {
          font-family: ${fontFamily} !important;
          font-weight: ${fontWeight} !important;
          font-style: ${fontStyle} !important;
        }

        /* Regular text elements - not titles/headers/special fonts/Eagle Lake font/font preview */
        p, div:not([class*="title"]):not([class*="header"]):not([class*="Title"]):not([class*="Header"]):not([style*="EagleLake"]):not([style*="Eagle Lake"]):not(.font-preview-exempt), button, label, input, textarea {
          font-family: ${fontFamily} !important;
          font-weight: ${fontWeight} !important;
          font-style: ${fontStyle} !important;
        }

        /* Custom title font - MUST COME LAST to override everything else - ALWAYS Eagle Lake, never changes */
        .dream-catcher-title,
        span.dream-catcher-title,
        [class*="dream-catcher-title"],
        [style*="EagleLake"],
        [style*="Eagle Lake"] {
          font-family: 'Eagle Lake', 'EagleLake', serif !important;
        }
      `;
      styleElement.textContent = css;
    }
  }, [fontSettings.fontSize, fontSettings.fontFamily, fontSettings.fontWeight, fontSettings.fontStyle]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (styleElement && typeof document !== 'undefined') {
        document.head.removeChild(styleElement);
        styleElement = null;
      }
    };
  }, []);

  return <>{children}</>;
};