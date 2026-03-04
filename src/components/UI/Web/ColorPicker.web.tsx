/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: ColorPicker.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review ColorPicker.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - Uses react-colorful library (web-only) for gradient picker
 * - Native version uses custom gradient grid implementation
 * - Uses React Portal to render picker outside component hierarchy
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { useTheme } from '../../../services/ThemeContext';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  label?: string;
}

interface DraggablePickerProps {
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  initialPosition: { x: number; y: number };
  label?: string;
}

const DraggablePicker: React.FC<DraggablePickerProps> = ({
  color,
  onColorChange,
  onClose,
  initialPosition,
  label,
}) => {
  const { currentTheme: colors } = useTheme();
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header
    if ((e.target as HTMLElement).dataset.draggable === 'true') {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        });
      }
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
  }, [isDragging]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 999999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '280px',
        }}
      >
        {/* Header for dragging */}
        <div
          data-draggable="true"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <span style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>
            {label ? `${label} Color` : 'Color Picker'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.textMuted, fontSize: 24 }}>✕</span>
          </button>
        </div>

        {/* React-colorful picker */}
        <HexColorPicker color={color} onChange={onColorChange} style={{ width: '100%', height: 200 }} />

        {/* Current color with hex input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              backgroundColor: color,
              border: `1px solid ${colors.border}`,
            }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.background,
              color: colors.textMain,
              padding: '0 12px',
              fontSize: 14,
              fontFamily: 'monospace',
              minWidth: 0,
            }}
            maxLength={9}
          />
        </div>

        {/* Select button */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              backgroundColor: colors.primary,
              color: colors.textMain,
              fontSize: 16,
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange, label }) => {
  const { currentTheme: colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 100, y: 100 });

  const handleShowPicker = () => {
    setShowPicker(true);
  };

  return (
    <div style={{ marginBottom: 16, width: '100%' }}>
      {label && <span style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.textMain }}>{label}</span>}

      {/* Color Preview - Clickable */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 8,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          width: '75%',
          cursor: 'pointer',
        }}
        onClick={handleShowPicker}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: color,
          }}
        />
        <input
          type="text"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            padding: '0 12px',
            fontSize: 14,
            fontFamily: 'monospace',
            minWidth: 0,
            backgroundColor: colors.background,
            color: colors.textMain,
          }}
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          placeholder="#000000"
        />
      </div>

      {/* Draggable Color Picker - rendered via Portal to body */}
      {showPicker && (
        <DraggablePicker
          color={color}
          onColorChange={onColorChange}
          onClose={() => setShowPicker(false)}
          initialPosition={pickerPosition}
          label={label}
        />
      )}
    </div>
  );
};

export default ColorPicker;
