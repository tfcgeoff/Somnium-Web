/**
 * ChoicesDropdown.web.tsx
 *
 * PLATFORM: Web (Pure - no react-native)
 *
 * Dropdown modal for displaying narrative action choices
 */

import React, { useState } from 'react';
import { useTheme } from '../../../services/ThemeContext';

interface ChoicesDropdownProps {
  actions: string[];
  onSelectAction: (action: string) => void;
}

const ChoicesDropdown: React.FC<ChoicesDropdownProps> = ({ actions, onSelectAction }) => {
  const { currentTheme: colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (action: string) => {
    onSelectAction(action);
    setModalVisible(false);
  };

  const buttonStyle: React.CSSProperties = {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: colors.primary,
    color: colors.isDark ? colors.background : colors.textMain,
    fontSize: 16,
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  };

  const centeredViewStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  };

  const modalViewStyle: React.CSSProperties = {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    backgroundColor: colors.surface,
    maxHeight: '50vh',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.25)',
  };

  const itemButtonStyle: React.CSSProperties = {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    color: colors.textMain,
    cursor: 'pointer',
    background: 'transparent',
    textAlign: 'left',
    fontSize: 16,
  };

  const closeButtonStyle: React.CSSProperties = {
    marginTop: 10,
    padding: 15,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
    color: colors.textMain,
    fontSize: 16,
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div>
      <button
        style={buttonStyle}
        onClick={() => setModalVisible(true)}
      >
        Show Choices
      </button>

      {modalVisible && (
        <div style={centeredViewStyle} onClick={() => setModalVisible(false)}>
          <div
            style={modalViewStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {actions.map((item, index) => (
                <li key={index}>
                  <button
                    style={itemButtonStyle}
                    onClick={() => handleSelect(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
            <button
              style={closeButtonStyle}
              onClick={() => setModalVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoicesDropdown;
