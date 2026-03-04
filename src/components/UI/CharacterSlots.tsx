/**
 * CharacterSlots Component (Pure Web)
 *
 * Character slot management UI for loading/deleting/importing characters
 */

import React, { useState, useEffect } from 'react';
import { commonStyles } from '../../constants/styles';
import { useTheme } from '../../services/ThemeContext';
import type { CharacterSlot, CharacterStats } from '../../constants/types';
import {
  listCharacterSlots,
  loadCharacterSlot,
  deleteCharacterSlot,
  importCharacterSlot,
} from '../../services/characterSlotService';

interface CharacterSlotsProps {
  onSelectSlot: (slot: CharacterSlot) => void;
  onCreateNew: () => void;
  currentCharacterName?: string;
  currentCharacterDesc?: string;
  currentStats?: CharacterStats;
}

const CharacterSlots: React.FC<CharacterSlotsProps> = ({
  onSelectSlot,
  onCreateNew,
  currentCharacterName,
  currentCharacterDesc,
  currentStats,
}) => {
  const { currentTheme: colors } = useTheme();
  const [slots, setSlots] = useState<CharacterSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{slotId: string, slotName: string} | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setIsLoading(true);
    const savedSlots = await listCharacterSlots();
    setSlots(savedSlots.sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0)));
    setIsLoading(false);
  };

  const handleSelectSlot = (slot: CharacterSlot) => {
    onSelectSlot(slot);
  };

  const handleDeleteSlot = async (slotId: string, slotName: string) => {
    setShowDeleteConfirm({ slotId, slotName });
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteCharacterSlot(showDeleteConfirm.slotId);
      loadSlots();
      setShowDeleteConfirm(null);
    }
  };

  const handleImportSlot = () => {
    setShowImportModal(true);
    setImportText('');
    setImportMessage(null);
  };

  const confirmImport = async () => {
    if (!importText.trim()) return;
    const slot = await importCharacterSlot(importText.trim());
    if (slot) {
      setImportMessage({ type: 'success', text: `"${slot.name}" has been imported.` });
      loadSlots();
      setTimeout(() => {
        setShowImportModal(false);
        setImportMessage(null);
      }, 1500);
    } else {
      setImportMessage({ type: 'error', text: 'Invalid character code.' });
    }
  };

  const getModifier = (stat: number): string => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const containerStyle: React.CSSProperties = {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    minHeight: '100vh',
  };

  const cardStyle: React.CSSProperties = {
    ...commonStyles.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderStyle: 'solid',
  };

  const titleStyle: React.CSSProperties = {
    ...commonStyles.title,
    color: colors.primary,
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...commonStyles.secondaryButton,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderStyle: 'solid',
    paddingVertical: 12,
    cursor: 'pointer',
  };

  const slotsListStyle: React.CSSProperties = {
    maxHeight: 400,
    overflowY: 'auto',
  };

  const renderSlot = (slot: CharacterSlot) => {
    const slotCardStyle: React.CSSProperties = {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.border,
      marginBottom: 12,
      backgroundColor: colors.surface,
    };

    const slotHeaderStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    };

    const slotInfoStyle: React.CSSProperties = {
      flex: 1,
    };

    const slotNameStyle: React.CSSProperties = {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    };

    const slotAdventureNameStyle: React.CSSProperties = {
      fontSize: 13,
      marginTop: 2,
      color: colors.textMuted,
    };

    const slotLevelStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    };

    const levelTextStyle: React.CSSProperties = {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.secondary,
    };

    const xpTextStyle: React.CSSProperties = {
      fontSize: 12,
      marginTop: 2,
      color: colors.textMuted,
    };

    const slotStatsStyle: React.CSSProperties = {
      marginBottom: 12,
    };

    const statLabelStyle: React.CSSProperties = {
      fontSize: 12,
      marginBottom: 4,
      color: colors.textMuted,
    };

    const statTextStyle: React.CSSProperties = {
      fontSize: 11,
      lineHeight: '16px',
      color: colors.textMain,
    };

    const slotActionsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    };

    const slotActionButtonStyle: React.CSSProperties = {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
    };

    const lastPlayedStyle: React.CSSProperties = {
      fontSize: 11,
      textAlign: 'right',
      color: colors.textMuted,
    };

    return (
      <div key={slot.id} style={slotCardStyle}>
        <div style={slotHeaderStyle}>
          <div style={slotInfoStyle}>
            <span style={slotNameStyle}>{slot.characterName}</span>
            <span style={slotAdventureNameStyle}>{slot.name}</span>
          </div>
          <div style={slotLevelStyle}>
            <span style={levelTextStyle}>Lv.{slot.level}</span>
            <span style={xpTextStyle}>{slot.xp} XP</span>
          </div>
        </div>

        <div style={slotStatsStyle}>
          <span style={statLabelStyle}>Stats:</span>
          <p style={statTextStyle}>
            STR {slot.stats.strength} ({getModifier(slot.stats.strength)}) |
            DEX {slot.stats.dexterity} ({getModifier(slot.stats.dexterity)}) |
            CON {slot.stats.constitution} ({getModifier(slot.stats.constitution)})
          </p>
          <p style={statTextStyle}>
            INT {slot.stats.intelligence} ({getModifier(slot.stats.intelligence)}) |
            WIS {slot.stats.wisdom} ({getModifier(slot.stats.wisdom)}) |
            CHA {slot.stats.charisma} ({getModifier(slot.stats.charisma)})
          </p>
        </div>

        <div style={slotActionsStyle}>
          <button
            style={{...slotActionButtonStyle, backgroundColor: colors.primary}}
            onClick={() => handleSelectSlot(slot)}
          >
            <span style={{color: colors.background, fontSize: 12, fontWeight: '600'}}>Play</span>
          </button>

          <button
            style={{...slotActionButtonStyle, backgroundColor: '#ff4444'}}
            onClick={() => handleDeleteSlot(slot.id, slot.characterName)}
          >
            <span style={{color: '#fff', fontSize: 12, fontWeight: '600'}}>Delete</span>
          </button>
        </div>

        <span style={lastPlayedStyle}>
          Last played: {new Date(slot.lastPlayedAt || 0).toLocaleDateString()}
        </span>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Character Slots</h2>

        <div style={buttonRowStyle}>
          <button
            style={{...secondaryButtonStyle, borderColor: colors.border}}
            onClick={onCreateNew}
          >
            <span style={{color: colors.textMain, fontSize: 18, fontWeight: 'bold'}}>
              Create New Character
            </span>
          </button>

          <button
            style={{...secondaryButtonStyle, borderColor: colors.secondary}}
            onClick={handleImportSlot}
          >
            <span style={{color: colors.secondary, fontSize: 18, fontWeight: 'bold'}}>
              Import Character
            </span>
          </button>
        </div>

        <div style={slotsListStyle}>
          {isLoading ? (
            <p style={{textAlign: 'center', padding: 32, fontSize: 14, color: colors.textMuted}}>
              Loading...
            </p>
          ) : slots.length === 0 ? (
            <p style={{textAlign: 'center', padding: 32, fontSize: 14, color: colors.textMuted}}>
              No saved characters yet. Create one to start your adventure!
            </p>
          ) : (
            slots.map(renderSlot)
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
        }} onClick={() => setShowDeleteConfirm(null)}>
          <div
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 16,
              maxWidth: 400,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{color: colors.primary, marginBottom: 16}}>Delete Character</h3>
            <p style={{color: colors.textMain, marginBottom: 24}}>
              Are you sure you want to delete "{showDeleteConfirm.slotName}"? This cannot be undone.
            </p>
            <div style={{display: 'flex', gap: 12}}>
              <button
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.border,
                  border: 'none',
                  color: colors.textMain,
                  cursor: 'pointer',
                }}
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#ff4444',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
        }} onClick={() => setShowImportModal(false)}>
          <div
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 16,
              maxWidth: 500,
              width: '90%',
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{color: colors.primary, marginBottom: 8}}>Import Character</h3>
            <p style={{color: colors.textMuted, marginBottom: 16}}>Paste your character code below:</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste character code here..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 12,
                borderRadius: 8,
                backgroundColor: colors.background,
                color: colors.textMain,
                border: `1px solid ${colors.border}`,
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                fontSize: 12,
              }}
            />
            {importMessage && (
              <p style={{
                marginBottom: 16,
                color: importMessage.type === 'success' ? colors.tertiary : '#ff4444',
              }}>
                {importMessage.text}
              </p>
            )}
            <div style={{display: 'flex', gap: 12}}>
              <button
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.border,
                  border: 'none',
                  color: colors.textMain,
                  cursor: 'pointer',
                }}
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  border: 'none',
                  color: colors.background,
                  cursor: 'pointer',
                }}
                onClick={confirmImport}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSlots;
