/**
 * FloatingTooltip.web.tsx
 *
 * Web version of FloatingTooltip - pure web, no react-native.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { renderHelpText } from '../../../constants/helpContent';
import type { HelpSection } from '../../../constants/helpContent';

interface FloatingTooltipProps {
  visible: boolean;
  onClose: () => void;
  content: HelpSection;
  triggerPosition?: { x: number; y: number; width: number; height: number };
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  visible,
  onClose,
  content,
  triggerPosition,
}) => {
  const { currentTheme: colors } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 280, height: 200 });
  const [didDrag, setDidDrag] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Render rich text for web
  const renderRichText = (nodes: ReturnType<typeof renderHelpText>) => (
    <>
      {nodes.map((node: any) => {
        if (node.type === 'text') {
          return <span key={node.key}>{node.content}</span>;
        }
        if (node.bold && node.italic) {
          return <strong key={node.key}><em>{node.content}</em></strong>;
        }
        if (node.bold) {
          return <strong key={node.key}>{node.content}</strong>;
        }
        if (node.italic) {
          return <em key={node.key}>{node.content}</em>;
        }
        return <span key={node.key}>{node.content}</span>;
      })}
    </>
  );

  // Reset didDrag when modal opens/closes
  useEffect(() => {
    if (visible) {
      setDidDrag(false);
    }
  }, [visible]);

  // Measure tooltip size after render
  useEffect(() => {
    if (visible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width: rect.width || 280, height: rect.height || 200 });
    }
  }, [visible]);

  // Calculate initial position based on trigger
  const getInitialPosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (triggerPosition) {
      let x = triggerPosition.x;
      let y = triggerPosition.y + triggerPosition.height + 8;

      if (x + tooltipSize.width > screenWidth - 16) {
        x = screenWidth - tooltipSize.width - 16;
      }
      if (x < 16) x = 16;
      if (y + tooltipSize.height > screenHeight - 16) {
        y = triggerPosition.y - tooltipSize.height - 8;
      }
      if (y < 16) y = 16;

      return { x, y };
    }
    return {
      x: (screenWidth - tooltipSize.width) / 2,
      y: (screenHeight - tooltipSize.height) / 2,
    };
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDidDrag(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
        setDidDrag(true);
      }

      newX = Math.max(0, Math.min(screenWidth - tooltipSize.width, newX));
      newY = Math.max(0, Math.min(screenHeight - tooltipSize.height, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, tooltipSize, position]);

  // Prevent closing if user just finished dragging
  const handleBackdropPress = () => {
    if (!didDrag) {
      onClose();
    }
  };

  if (!visible) return null;

  const currentPosition = position.x === 0 && position.y === 0 ? getInitialPosition() : position;

  const tooltipContainerStyle: React.CSSProperties = {
    position: 'fixed',
    left: currentPosition.x,
    top: currentPosition.y,
    width: Math.min(tooltipSize.width, window.innerWidth - 32),
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    maxWidth: 320,
    userSelect: 'none',
    zIndex: 2000,
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1999,
  };

  const dragHandleStyle: React.CSSProperties = {
    height: 24,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    backgroundColor: colors.border,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const dragHandleBarStyle: React.CSSProperties = {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  };

  const titleBarStyle: React.CSSProperties = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  };

  const contentContainerStyle: React.CSSProperties = {
    maxHeight: 250,
  };

  const scrollViewStyle: React.CSSProperties = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflowY: 'auto',
    maxHeight: 250,
  };

  const contentTextStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    color: colors.textMain,
  };

  const tipsBoxStyle: React.CSSProperties = {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  };

  const tipsLabelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.primary,
  };

  const tipItemStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: '18px',
    marginBottom: 3,
    color: colors.textMain,
  };

  const closeHintStyle: React.CSSProperties = {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    display: 'flex',
    alignItems: 'center',
  };

  const closeHintTextStyle: React.CSSProperties = {
    fontSize: 11,
    textAlign: 'center',
    color: colors.textMuted,
  };

  return (
    <div style={backdropStyle} onClick={handleBackdropPress}>
      <div
        ref={tooltipRef}
        style={tooltipContainerStyle}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle indicator */}
        <div style={dragHandleStyle}>
          <div style={dragHandleBarStyle}></div>
        </div>

        {/* Title bar */}
        <div style={titleBarStyle}>
          <span style={titleStyle}>{content.title}</span>
        </div>

        {/* Content */}
        <div style={contentContainerStyle}>
          <div style={scrollViewStyle}>
            <p style={contentTextStyle}>
              {renderRichText(renderHelpText(content.content))}
            </p>

            {content.tips && (
              <div style={tipsBoxStyle}>
                <span style={tipsLabelStyle}>💡 Tips:</span>
                {content.tips.map((tip, i) => (
                  <p key={i} style={tipItemStyle}>
                    • {renderRichText(renderHelpText([tip]))}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close hint */}
        <div style={closeHintStyle}>
          <span style={closeHintTextStyle}>
            Tap outside to close • Drag to move
          </span>
        </div>
      </div>
    </div>
  );
};

export default FloatingTooltip;
