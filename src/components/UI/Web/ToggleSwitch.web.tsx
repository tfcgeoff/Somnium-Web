/**
 * ToggleSwitch.tsx
 *
 * Custom toggle switch component for web platform.
 * Smooth animated toggle for binary choices.
 */

import React from 'react';
import { StyleSheet, css } from 'aphrodite'; // or use inline styles

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  primaryColor: string;
  backgroundColor: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  primaryColor,
  backgroundColor,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: value ? primaryColor : backgroundColor,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        padding: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: value ? '26px' : '2px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
};

export default ToggleSwitch;
