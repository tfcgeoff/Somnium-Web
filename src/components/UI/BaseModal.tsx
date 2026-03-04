/**
 * Shared BaseModal Component (Pure Web)
 *
 * Reusable base modal component with overlay, container, and optional title/close button
 */

import React from 'react';
import { useTheme } from '../../services/ThemeContext';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

/**
 * Reusable base modal component with overlay, container, and optional title/close button
 */
const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  const { currentTheme: colors } = useTheme();

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
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

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
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
    flex: 1,
    color: colors.primary,
  };

  const closeButtonStyle: React.CSSProperties = {
    padding: 4,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const closeIconStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textMuted,
  };

  const contentStyle: React.CSSProperties = {
    padding: 16,
    overflowY: 'auto',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header with title and close button */}
        {(title || showCloseButton) && (
          <div style={headerStyle}>
            {title && <span style={titleStyle}>{title}</span>}
            {showCloseButton && (
              <button onClick={onClose} style={closeButtonStyle}>
                <span style={closeIconStyle}>✕</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={contentStyle}>{children}</div>
      </div>
    </div>
  );
};

export default BaseModal;
