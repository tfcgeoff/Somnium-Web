/**
 * NarrativeUI.web.tsx (Pure Web)
 *
 * Key differences from native:
 * - Sidebar is inline on large screens (!isSmallScreen)
 * - Sidebar is modal overlay on small screens (isSmallScreen)
 * - Responsive behavior based on screen width
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GameMode } from '../../../constants/types';
import type { GameState, InventoryItem, StatProgression } from '../../../constants/types';
import { commonStyles, narrativeUIStyles } from '../../../constants/styles';
import { useNarrativeLogic } from '../../data/NarrativeUI';
import { AdBanner } from './Helpers/AdBanner';
import { useTheme } from '../../../services/ThemeContext';
import { useSettings } from '../../../services/SettingsContext';
import ChoicesDropdown from './ChoicesDropdown.web';
import { exportCharacterSlotToFile, importCharacterSlotFromFile } from '../../../services/characterSlotService';
import { createCharacterSlotFromGame } from '../../../services/characterSlotService';
import { getThresholdForNextStat, getStatProgressionPercent } from '../../../services/statProgressionService';
import FloatingTooltip from './FloatingTooltip.web';
import { HELP_CONTENT } from '../../../constants/helpContent';
import SomniumBackground from '../../../assets/SomniumBackground.png';

interface NarrativeUIProps {
  gameState: GameState;
  onSendMessage: (text: string) => void;
  onSilentContinue: () => void;
  onUpdateDirectives: (text: string) => void;
  onUpdateNegativeDirectives: (text: string) => void;
  onRedo: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onExit: () => void;
  isLoading: boolean;
  onGenerateImage: () => void;
  canGenerateImage: boolean;
  isDebug: boolean;
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
  onOpenSettings: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onUseItem?: (itemId: string) => void;
  onDiscardItem?: (itemId: string) => void;
  onDownloadImage?: (imageUrl: string) => void;
  onSetImageAsBackground?: (imageUrl: string) => void;
}

const NarrativeUI: React.FC<NarrativeUIProps> = props => {
  const { currentTheme: colors } = useTheme();
  const { transparencySettings } = useSettings();

  // Add CSS for placeholder text color
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      textarea::placeholder {
        color: ${colors.textMuted} !important;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [colors.textMuted]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [showHelp, setShowHelp] = useState('');
  const [helpPosition, setHelpPosition] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  const [showCharacterDescModal, setShowCharacterDescModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-collapse sidebar on small screens
  const isSmallScreen = screenWidth < 768;

  const { inputText, setInputText, handleSend, handleKeyPress } =
    useNarrativeLogic({
      gameState: props.gameState,
      onSendMessage: props.onSendMessage,
      onSilentContinue: props.onSilentContinue,
      isLoading: props.isLoading,
      isDebug: props.isDebug,
      scrollRef: scrollRef as any,
    });

  // Track screen width changes for responsive sidebar
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    gameState,
    onSilentContinue,
    onUpdateDirectives,
    onUpdateNegativeDirectives,
    onRedo,
    onSave,
    onExit,
    isLoading,
    onSendMessage,
    onGenerateImage,
    canGenerateImage,
    onToggleSidebar,
    sidebarVisible,
    onOpenSettings,
    onEditMessage,
    onUseItem,
    onDiscardItem,
    onDownloadImage,
    onSetImageAsBackground,
  } = props;

  // Handle long press on message to edit
  const handleLongPressMessage = (messageId: string, content: string, role: string) => {
    if (role !== 'user' || !onEditMessage) return;
    setEditText(content);
    setEditingMessageId(messageId);
  };

  // Confirm edit
  const handleConfirmEdit = () => {
    if (editingMessageId && onEditMessage && editText.trim()) {
      if (confirm('Edit Message: This will regenerate all responses from this point. Continue?')) {
        onEditMessage(editingMessageId, editText.trim());
        setEditingMessageId(null);
        setEditText('');
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  // Save & Exit (regular autosave)
  const handleSaveAndExit = () => {
    onExit();
  };

  // Abandon Story (exit without saving)
  const handleAbandonStory = () => {
    onExit();
  };

  // Export character to file
  const handleExportCharacter = async () => {
    try {
      const slot = await createCharacterSlotFromGame(
        gameState.id,
        gameState.name,
        gameState.characterName,
        gameState.characterDesc,
        gameState.characterStats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        [gameState.theme],
        gameState.characterSlotId
      );
      await exportCharacterSlotToFile(slot);
    } catch (error) {
      console.error('Failed to export character:', error);
    }
  };

  const lastMessage = gameState?.history?.length > 0
    ? gameState.history[gameState.history.length - 1]
    : undefined;
  const actions = useMemo(
    () => lastMessage?.suggestedActions || [],
    [lastMessage?.suggestedActions]
  );

  // Auto-scroll to bottom when content changes
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState?.history?.length, isLoading]);

  const HelpIcon: React.FC<{ topicId: string }> = ({ topicId }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    return (
      <button
        ref={buttonRef}
        onClick={() => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setHelpPosition({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
            setShowHelp(topicId);
          }
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: colors.primary,
          marginLeft: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <span style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold', fontStyle: 'italic' }}>i</span>
      </button>
    );
  };

  const mainContainerStyle: React.CSSProperties = {
    ...commonStyles.mainContainer,
    backgroundColor: `rgba(0, 0, 0, ${(transparencySettings.textAreaOpacity / 100).toFixed(2)})`,
    position: 'relative',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Background image layer */}
        <img
          src={gameState.backgroundImage || SomniumBackground}
          style={backgroundStyle}
          alt="background"
        />

        {/* Semi-transparent overlay to darken the background */}
        <div style={overlayStyle}></div>

        {/* Main content with transparency */}
        <div style={mainContainerStyle}>
          {/* MAIN CONTENT AREA */}
          <div style={commonStyles.contentArea}>
            {/* Header Row - Menu, Title, Settings */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
              borderBottomColor: colors.border,
            }}>
              <button onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 20, color: colors.primary }}>☰</span>
              </button>

              <span style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.primary,
                letterSpacing: 1,
              }}>
                {gameState.name}
              </span>

              <button onClick={onOpenSettings} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 28, color: colors.primary }}>⚙</span>
              </button>
            </div>

            <div
              ref={scrollRef}
              style={{ ...commonStyles.narrativeScroll, paddingBottom: 100 }}
            >
              {(gameState?.history || []).map((m, i) => (
                <div
                  key={m.id || i}
                  style={{ ...commonStyles.messageContainer, ...(m.role === 'user' ? commonStyles.userAlign : commonStyles.modelAlign) }}
                >
                  {m.role === 'user' && onEditMessage ? (
                    <button
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                      onDoubleClick={() => handleLongPressMessage(m.id, m.content, m.role)}
                    >
                      <div
                        style={{ ...commonStyles.userBubble, backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}4D`, borderStyle: 'solid' }}
                      >
                        <span style={{ ...commonStyles.messageText, color: colors.textMain }}>
                          {m.content}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div
                      style={{
                        ...(m.role === 'user' ? commonStyles.userBubble : commonStyles.modelBubble),
                        backgroundColor: m.role === 'user' ? `${colors.primary}1A` : 'transparent',
                        borderColor: m.role === 'user' ? `${colors.primary}4D` : 'transparent',
                        borderStyle: m.role === 'user' ? 'solid' : 'none',
                      }}
                    >
                      <span style={{ ...commonStyles.messageText, color: colors.textMain, fontWeight: '500' }}>
                        {m.content}
                      </span>
                      {m.imageUrl && (
                        <div style={{ alignItems: 'center', marginVertical: 8, width: '100%', alignSelf: 'stretch' }}>
                          {onSetImageAsBackground && (
                            <button
                              style={{
                                backgroundColor: colors.primary,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6,
                                marginBottom: 8,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() => onSetImageAsBackground(m.imageUrl!)}
                            >
                              <span style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                                Set as Background
                              </span>
                            </button>
                          )}
                          <img
                            src={m.imageUrl}
                            style={narrativeUIStyles.sceneImage}
                            alt="scene"
                          />
                          {onDownloadImage && (
                            <button
                              style={{
                                backgroundColor: colors.border,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6,
                                marginTop: 8,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() => onDownloadImage(m.imageUrl!)}
                            >
                              <span style={{ color: colors.textMain, fontSize: 12, fontWeight: '600' }}>
                                Download
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                  <span style={{ color: colors.textMuted, fontStyle: 'italic', marginLeft: 8 }}>
                    Crafting your {props.gameState.mode === GameMode.DND ? 'Adventure' : 'story'}...
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar & Input Footer */}
            <div
              style={{ ...commonStyles.footer, backgroundColor: `${colors.background}E6`, borderTopColor: colors.border, borderTopStyle: 'solid' }}
            >
              {/* Suggested Actions */}
              {!isLoading && actions.length > 0 && (
                <div style={{ ...commonStyles.actionRow, flexWrap: 'wrap' }}>
                  {isSmallScreen ? (
                    <ChoicesDropdown actions={actions} onSelectAction={onSendMessage} />
                  ) : (
                    <>
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          style={{
                            backgroundColor: colors.surface,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: colors.primary,
                            marginRight: 8,
                            marginBottom: 8,
                            cursor: 'pointer',
                          }}
                          onClick={() => onSendMessage(action)}
                        >
                          <span style={{ color: colors.primary, fontSize: 13 }}>{action}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Redo + Generate buttons above input, aligned right */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  {gameState.mode === GameMode.DND && (
                    <button
                      style={{ ...commonStyles.iconButton, ...narrativeUIStyles.inputControlButton, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
                      onClick={() => setShowInventoryModal(true)}
                    >
                      <span style={{ ...commonStyles.buttonTextSmall, color: colors.primary }}>🎒</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{ ...commonStyles.iconButton, ...narrativeUIStyles.inputControlButton, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
                    onClick={onRedo}
                    disabled={isLoading || !gameState?.history || gameState.history.length === 0}
                  >
                    <span style={{ ...commonStyles.buttonTextSmall, color: colors.textMain }}>Redo</span>
                  </button>

                  <button
                    style={{ ...commonStyles.iconButton, ...narrativeUIStyles.inputControlButton, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
                    onClick={onGenerateImage}
                    disabled={isLoading}
                  >
                    <span style={{ ...commonStyles.buttonTextSmall, color: colors.textMain }}>
                      Generate
                    </span>
                  </button>
                </div>
              </div>

              {/* Text Input Area with Continue Button */}
              <div
                style={{ ...narrativeUIStyles.inputControlWrapper, backgroundColor: colors.background, borderColor: colors.border, borderStyle: 'solid' }}
              >
                <textarea
                  style={{ ...commonStyles.mainTextInput, color: colors.textMain, flex: 1, border: 'none', background: 'transparent', outline: 'none', resize: 'none' }}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="What do you do? (blank to continue story)"
                  onKeyDown={(e) => handleKeyPress(e as React.KeyboardEvent<any>)}
                />

                <button
                  style={{ ...commonStyles.iconButton, ...narrativeUIStyles.inputControlButton, backgroundColor: colors.primary, borderColor: colors.primary, borderStyle: 'solid' }}
                  onClick={() => {
                    const trimmedInput = inputText.trim();
                    if (trimmedInput !== '') {
                      onSendMessage(trimmedInput);
                    } else {
                      onSilentContinue();
                    }
                    setInputText('');
                  }}
                  disabled={isLoading}
                >
                  <span
                    style={{ ...commonStyles.buttonTextSmall, color: colors.isDark ? colors.background : colors.textMain }}
                  >
                    Continue
                  </span>
                </button>
              </div>

              {/* Full Width Ad Banner */}
              <AdBanner onClose={() => {}} />
            </div>
          </div>
        </div>

        {/* Edit Message Modal */}
        {editingMessageId && (
          <div style={{ ...narrativeUIStyles.editModalOverlay, backgroundColor: `${colors.background}CC` }}>
            <div
              style={{ ...narrativeUIStyles.editModalContainer, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
            >
              <span style={{ ...narrativeUIStyles.editModalTitle, color: colors.primary }}>Edit Message</span>
              <span style={{ ...narrativeUIStyles.editModalSubtitle, color: colors.textMuted }}>
                Double-click user messages to edit. This will regenerate all responses from this point.
              </span>
              <textarea
                style={{ ...narrativeUIStyles.editModalInput, backgroundColor: colors.background, borderColor: colors.border, color: colors.textMain, borderStyle: 'solid' }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                placeholder="Edit your message..."
              />
              <div style={narrativeUIStyles.editModalButtons}>
                <button
                  style={{ ...narrativeUIStyles.editModalButton, ...narrativeUIStyles.editModalCancelButton, backgroundColor: colors.border, border: 'none' }}
                  onClick={handleCancelEdit}
                >
                  <span style={{ ...narrativeUIStyles.editModalButtonText, color: colors.textMain }}>Cancel</span>
                </button>
                <button
                  style={{ ...narrativeUIStyles.editModalButton, ...narrativeUIStyles.editModalSaveButton, backgroundColor: colors.primary, border: 'none' }}
                  onClick={handleConfirmEdit}
                >
                  <span
                    style={{ ...narrativeUIStyles.editModalButtonText, color: colors.isDark ? colors.background : colors.textMain }}
                  >
                    Save & Regenerate
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal */}
        {showInventoryModal && gameState.mode === GameMode.DND && (
          <div style={{ ...narrativeUIStyles.inventoryOverlay, backgroundColor: `${colors.background}CC`, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}>
            <div
              style={{ ...narrativeUIStyles.inventoryContainer, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
            >
              <div style={narrativeUIStyles.inventoryHeader}>
                <span style={{ ...narrativeUIStyles.inventoryTitle, color: colors.primary }}>🎒 Inventory</span>
                <button onClick={() => setShowInventoryModal(false)} style={{ background: 'transparent', border: 'none' }}>
                  <span style={{ fontSize: 24, color: colors.textMuted }}>✕</span>
                </button>
              </div>

              {/* Character Stats Section */}
              {gameState.characterStats && (
                <div style={{ ...narrativeUIStyles.statsSection, borderBottomColor: colors.border, borderBottomStyle: 'solid' }}>
                  {gameState.statProgression ? (
                    <div style={narrativeUIStyles.compactStatsGrid}>
                      {[
                        { key: 'strength', label: 'STR', value: gameState.characterStats.strength },
                        { key: 'dexterity', label: 'DEX', value: gameState.characterStats.dexterity },
                        { key: 'constitution', label: 'CON', value: gameState.characterStats.constitution },
                        { key: 'intelligence', label: 'INT', value: gameState.characterStats.intelligence },
                        { key: 'wisdom', label: 'WIS', value: gameState.characterStats.wisdom },
                        { key: 'charisma', label: 'CHA', value: gameState.characterStats.charisma },
                      ].map(stat => (
                        <div key={stat.key} style={narrativeUIStyles.compactStatItem}>
                          <div style={narrativeUIStyles.compactStatLabelRow}>
                            <span style={{ ...narrativeUIStyles.compactStatLabel, color: colors.textMuted }}>{stat.label}</span>
                            <span style={{ ...narrativeUIStyles.compactStatValue, color: colors.primary }}>{stat.value}</span>
                          </div>
                          <div style={{ ...narrativeUIStyles.compactProgressBarBackground, backgroundColor: colors.background }}>
                            <div style={{ ...narrativeUIStyles.compactProgressBarFill, width: `${getStatProgressionPercent(gameState.statProgression, stat.key as keyof StatProgression, stat.value)}%`, backgroundColor: colors.primary }} />
                          </div>
                          <span style={{ ...narrativeUIStyles.compactProgressText, color: colors.textMuted }}>
                            {Math.floor(gameState.statProgression[stat.key as keyof StatProgression])}/{getThresholdForNextStat(stat.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div style={narrativeUIStyles.statsRow}>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>STR</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.strength}</span>
                        </div>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>DEX</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.dexterity}</span>
                        </div>
                      </div>
                      <div style={narrativeUIStyles.statsRow}>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>CON</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.constitution}</span>
                        </div>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>INT</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.intelligence}</span>
                        </div>
                      </div>
                      <div style={narrativeUIStyles.statsRow}>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>WIS</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.wisdom}</span>
                        </div>
                        <div style={narrativeUIStyles.statItem}>
                          <span style={{ ...narrativeUIStyles.statLabel, color: colors.textMuted }}>CHA</span>
                          <span style={{ ...narrativeUIStyles.statValue, color: colors.primary }}>{gameState.characterStats.charisma}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div style={{ ...narrativeUIStyles.inventoryContent, overflowY: 'auto' }}>
                {gameState.inventory && gameState.inventory.length > 0 ? (
                  gameState.inventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedInventoryItem(item)}
                      style={{ ...narrativeUIStyles.inventoryItemSmall, backgroundColor: colors.background, borderColor: colors.border, borderStyle: 'solid', cursor: 'pointer' }}
                    >
                      <div style={narrativeUIStyles.inventoryItemHeaderSmall}>
                        <span style={{ ...narrativeUIStyles.inventoryItemNameSmall, color: colors.textMain }}>
                          {item.name}
                        </span>
                        {item.quantity !== undefined && item.quantity > 1 && (
                          <span style={{ ...narrativeUIStyles.inventoryItemQtySmall, color: colors.textMuted }}>
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      {item.type && (
                        <span style={{ ...narrativeUIStyles.inventoryItemType, color: colors.textMuted, marginTop: 2 }}>
                          {item.type}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <span style={{ ...narrativeUIStyles.inventoryEmpty, color: colors.textMuted }}>
                    No items yet. Items will be added as you adventure.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Item Detail Modal */}
        {selectedInventoryItem && (
          <div
            style={{ ...narrativeUIStyles.inventoryDetailOverlay, backgroundColor: `${colors.background}CC`, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2001 }}
            onClick={() => setSelectedInventoryItem(null)}
          >
            <div
              style={{ ...narrativeUIStyles.inventoryDetailContainer, backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'solid' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ ...narrativeUIStyles.inventoryDetailTitle, color: colors.primary }}>
                {selectedInventoryItem.name}
              </span>
              {selectedInventoryItem.type && (
                <span style={{ ...narrativeUIStyles.inventoryDetailType, color: colors.textMuted }}>
                  {selectedInventoryItem.type}
                </span>
              )}
              {selectedInventoryItem.description && (
                <span style={{ ...narrativeUIStyles.inventoryDetailDesc, color: colors.textMain }}>
                  {selectedInventoryItem.description}
                </span>
              )}
              <div style={narrativeUIStyles.inventoryDetailButtons}>
                <button
                  style={{ ...narrativeUIStyles.inventoryDetailButton, backgroundColor: colors.primary, border: 'none' }}
                  onClick={() => {
                    onUseItem?.(selectedInventoryItem.id);
                    setSelectedInventoryItem(null);
                  }}
                >
                  <span
                    style={{ ...narrativeUIStyles.inventoryDetailButtonText, color: colors.isDark ? colors.background : colors.textMain }}
                  >
                    Use
                  </span>
                </button>
                <button
                  style={{ ...narrativeUIStyles.inventoryDetailButton, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border, borderStyle: 'solid' }}
                  onClick={() => {
                    onDiscardItem?.(selectedInventoryItem.id);
                    setSelectedInventoryItem(null);
                  }}
                >
                  <span style={{ ...narrativeUIStyles.inventoryDetailButtonText, color: colors.textMain }}>
                    Discard
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Character Description Modal */}
        {showCharacterDescModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
              zIndex: 2002,
            }}
            onClick={() => setShowCharacterDescModal(false)}
          >
            <div
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
                maxWidth: 400,
                width: '100%',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: colors.border,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: colors.primary, fontSize: 20, fontWeight: 'bold' }}>
                  {gameState.characterName}
                </span>
                <button onClick={() => setShowCharacterDescModal(false)} style={{ background: 'transparent', border: 'none' }}>
                  <span style={{ fontSize: 24, color: colors.textMuted }}>✕</span>
                </button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <span style={{ color: colors.textMain, fontSize: 15, lineHeight: '22px' }}>
                  {gameState.characterDesc}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR OVERLAY */}
      {sidebarVisible && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
            }}
            onClick={onToggleSidebar}
          />
          <div
            style={{ ...commonStyles.sidebar, ...narrativeUIStyles.mobileSidebar, backgroundColor: colors.surface, borderRightColor: colors.border, borderRightStyle: 'solid', borderRightWidth: 1, position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 9999 }}
          >
            <div style={{ ...commonStyles.sidebarHeader, borderBottomColor: colors.border, borderBottomStyle: 'solid', borderBottomWidth: 1 }}>
              <span
                style={{ ...commonStyles.title, color: colors.primary, fontSize: 24, marginBottom: 10 }}
              >
                {gameState.name}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...commonStyles.label, color: colors.textMuted }}>
                  {gameState.characterName}
                </span>
                <button onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none' }}>
                  <span style={{ color: colors.textMuted, fontSize: 20 }}>✕</span>
                </button>
              </div>
            </div>

            <div style={{ ...commonStyles.sidebarScroll, overflowY: 'auto' }}>
              <span style={{ ...commonStyles.label, color: colors.textMuted, marginTop: 20 }}>
                Active Directives
              </span>
              <textarea
                style={{ ...commonStyles.directiveInput, backgroundColor: colors.background, borderColor: colors.border, color: colors.textMain, borderStyle: 'solid', borderWidth: 1, height: 120 }}
                value={gameState.directives}
                onChange={(e) => onUpdateDirectives(e.target.value)}
                placeholder="What the AI should do..."
              />

              <span style={{ ...commonStyles.label, color: colors.textMuted, marginTop: 20 }}>
                Avoid (Negative Directives)
              </span>
              <textarea
                style={{ ...commonStyles.directiveInput, backgroundColor: colors.background, borderColor: `${colors.primary}40`, color: colors.textMain, borderStyle: 'solid', borderWidth: 1, height: 120 }}
                value={gameState.negativeDirectives || ''}
                onChange={(e) => onUpdateNegativeDirectives(e.target.value)}
                placeholder="What the AI should NOT do..."
              />
            </div>

            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                style={{ ...commonStyles.secondaryButton, backgroundColor: colors.primary, border: 'none' }}
                onClick={handleSaveAndExit}
              >
                <span
                  style={{ ...commonStyles.secondaryButtonText, color: colors.isDark ? colors.background : colors.textMain, fontSize: 14 }}
                >
                  Save & Exit
                </span>
              </button>

              <button
                style={{ ...commonStyles.secondaryButton, backgroundColor: colors.border, paddingVertical: 8, border: 'none' }}
                onClick={onSave}
              >
                <span style={{ ...commonStyles.buttonTextSmall, color: colors.textMain }}>
                  Export Dream
                </span>
              </button>

              {gameState.mode === GameMode.DND && (
                <button
                  style={{ ...commonStyles.secondaryButton, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.primary, borderStyle: 'solid' }}
                  onClick={handleExportCharacter}
                >
                  <span
                    style={{ ...commonStyles.secondaryButtonText, color: colors.primary, fontSize: 13 }}
                  >
                    Export Character
                  </span>
                </button>
              )}

              {gameState.characterDesc && (
                <button
                  style={{ ...commonStyles.secondaryButton, backgroundColor: colors.border, border: 'none' }}
                  onClick={() => setShowCharacterDescModal(true)}
                >
                  <span
                    style={{ ...commonStyles.secondaryButtonText, color: colors.textMain, fontSize: 14 }}
                  >
                    View Character Description
                  </span>
                </button>
              )}

              <button
                style={{ ...commonStyles.secondaryButton, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.textMuted, marginTop: 16, marginBottom: 40, borderStyle: 'solid' }}
                onClick={handleAbandonStory}
              >
                <span
                  style={{ ...commonStyles.secondaryButtonText, color: colors.textMuted, fontSize: 13 }}
                >
                  Abandon Story (Exit Without Saving)
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Help Tooltip */}
      <FloatingTooltip
        visible={!!showHelp}
        onClose={() => setShowHelp('')}
        content={HELP_CONTENT[showHelp as keyof typeof HELP_CONTENT] || HELP_CONTENT.general}
        triggerPosition={helpPosition}
      />
    </div>
  );
};

export default NarrativeUI;
