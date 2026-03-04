/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: SetupWizard.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review SetupWizard.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - Uses onClick with e.stopPropagation() for delete button (native uses onPress without)
 * - Larger font sizes and padding for desktop viewing
 * - Uses cursor: 'pointer' for interactive elements
 * - Uses custom ToggleSwitch component (native uses Switch)
 * - Uses onContextMenu for character description popup (native uses onLongPress)
 * - Uses CSS background-image for ImageBackground (native uses ImageBackground component)
 */

import React, { useState } from 'react';
import { GameMode } from '../../../constants/types';
import type { GameState, CharacterSlot, CharacterStats, StatProgression } from '../../../constants/types';
import { commonStyles } from '../../../constants/styles';
import { useSetupWizardLogic } from '../../data/SetupWizard';
import { THEMES, CUSTOM_THEME_KEY } from '../../../constants/variables';
import { useTheme } from '../../../services/ThemeContext';
import { useSettings } from '../../../services/SettingsContext';
import CharacterSlots from '../CharacterSlots';
import CharacterCreationModal from './CharacterCreationModal.web';
import GameThemePicker from './GameThemePicker.web';
import RandomizeAdModal from './RandomizeAdModal.web';
import { getAutosaveForCharacterSlot } from '../../../services/storageService';
import type { AutosaveMetadata } from '../../../services/storageService';
import FloatingTooltip from './FloatingTooltip.web';
import { helpTopics } from '../../../constants/helpContent';
import { sanitizeCharacterDescription } from '../../../services/aiService';
import { listCharacterSlots } from '../../../services/characterSlotService';

// Custom Toggle Switch for Web
const ToggleSwitch: React.FC<{
  value: boolean;
  onValueChange: (value: boolean) => void;
  primaryColor: string;
  backgroundColor: string;
  testID?: string;
}> = ({ value, onValueChange, primaryColor, backgroundColor, testID }) => {
  const switchStyle: React.CSSProperties = {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: value ? primaryColor : '#ccc',
    position: 'relative',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  };

  const knobStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    position: 'absolute',
    top: 2,
    left: value ? 26 : 2,
    transition: 'left 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <button
      data-testid={testID}
      onClick={() => onValueChange(!value)}
      style={switchStyle}
    >
      <div style={knobStyle} />
    </button>
  );
};

interface SetupWizardProps {
  onStart: (state: GameState) => void;
  onImport: () => void;
  initialValues?: Partial<GameState>;
  isDebug?: boolean;
  onLoadGame?: (id: string) => void;
  onClose?: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = props => {
  const { currentTheme: colors } = useTheme();
  const { transparencySettings } = useSettings();
  const [showCharacterSlots, setShowCharacterSlots] = useState(false);
  const [showCharacterChoiceModal, setShowCharacterChoiceModal] = useState(false);
  const [showCharacterCreationModal, setShowCharacterCreationModal] = useState(false);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [showGameThemePicker, setShowGameThemePicker] = useState(false);
  const [characterLocked, setCharacterLocked] = useState(false);
  const [selectedCharacterSlotId, setSelectedCharacterSlotId] = useState<string | undefined>();
  const [newCustomThemeName, setNewCustomThemeName] = useState('');
  const [customThemeError, setCustomThemeError] = useState('');
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);

  // Character selection zone state
  const [characterSlots, setCharacterSlots] = useState<CharacterSlot[]>([]);
  const [characterSlotAutosaves, setCharacterSlotAutosaves] = useState<Record<string, AutosaveMetadata>>({});
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const MAX_CHARACTER_SLOTS = 5;

  // Character description popup state
  const [showCharDescPopup, setShowCharDescPopup] = useState(false);
  const [charDescPopupSlot, setCharDescPopupSlot] = useState<CharacterSlot | null>(null);
  const [charDescPopupPosition, setCharDescPopupPosition] = useState<{ x: number; y: number } | undefined>();

  // Help tooltip state
  const [showHelp, setShowHelp] = useState('');
  const [helpPosition, setHelpPosition] = useState<{ x: number; y: number; width: number; height: number } | undefined>();

  const { state, setters, handleStart, handleDeleteAutosave, handleWatchRandomizeAd, handleCloseRandomizeAdModal, handlers, onLoadGame, handleAddCustomTheme: hookAddCustomTheme } = useSetupWizardLogic({
    ...props,
    isDebug: props.isDebug ?? false,
    onImport: props.onImport,
    onLoadGame: props.onLoadGame,
  });

  // Type guard function for GameMode
  const isGameMode = (value: string): value is GameMode => {
    return Object.values(GameMode).includes(value as GameMode);
  };

  // Help icon component
  const HelpIcon: React.FC<{ topicId: string }> = ({ topicId }) => {
    const helpIconStyle: React.CSSProperties = {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderStyle: 'solid',
      borderColor: colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    };

    const helpIconTextStyle: React.CSSProperties = {
      fontSize: 12,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: colors.primary,
    };

    return (
      <button
        style={helpIconStyle}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHelpPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
          setShowHelp(topicId);
        }}
      >
        <span style={helpIconTextStyle}>i</span>
      </button>
    );
  };

  // Show modal when switching to D&D mode if no character is locked yet
  const handleModeChange = (value: string) => {
    if (isGameMode(value)) {
      setters.setMode(value);
    } else {
      console.error(`Invalid GameMode received: "${value}"`);
      return;
    }

    // Hide character info when switching modes
    setShowCharacterInfo(false);

    // Don't show modal immediately - wait for user to try to start game
    if (value === GameMode.DND && characterLocked) {
      // Show character info after a short delay (simulating "lose focus")
      setTimeout(() => {
        setShowCharacterInfo(true);
      }, 500);
    }
  };

  // Handle cancel button on character choice modal
  const handleCancelCharacterChoice = () => {
    setShowCharacterChoiceModal(false);
    // Switch back to STORY mode
    setters.setMode(GameMode.STORY);
  };

  const handleCreateNewCharacter = () => {
    setShowCharacterChoiceModal(false);
    // Clear any existing character data when creating a new character
    setCharacterLocked(false);
    setSelectedCharacterSlotId(undefined);
    setters.setCharacterName('');
    setters.setCharacterDesc('');
    setters.setCharacterStats({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    });
    setShowCharacterCreationModal(true);
  };

  const handleCharacterCreated = async (characterName: string, characterDesc: string, stats: CharacterStats) => {
    // Sanitize character description to conform to content guidelines
    console.log('[SetupWizard] Original characterDesc:', characterDesc);
    const sanitizedDesc = await sanitizeCharacterDescription(characterDesc);
    console.log('[SetupWizard] Sanitized characterDesc:', sanitizedDesc);

    setters.setCharacterName(characterName);
    setters.setCharacterDesc(sanitizedDesc);
    // Store stats in the state
    setters.setCharacterStats(stats);
    setCharacterLocked(true);
    setSelectedCharacterSlotId(undefined);
    setShowCharacterCreationModal(false);
  };

  const handleCancelCharacterCreation = () => {
    setShowCharacterCreationModal(false);
    // Show the choice modal again
    setShowCharacterChoiceModal(true);
  };

  const handleLoadExistingCharacter = () => {
    setShowCharacterChoiceModal(false);
    setShowCharacterSlots(true);
  };

  const handleStartWithExistingSlot = (slot: CharacterSlot) => {
    // Lock the character and load its data
    setCharacterLocked(true);
    setSelectedCharacterSlotId(slot.id);
    setters.setCharacterName(slot.characterName);
    setters.setCharacterDesc(slot.characterDesc);
    // Load stats and stat progression from the slot
    setters.setCharacterStats(slot.stats);
    setters.setStatProgression(slot.statProgression);
    setters.setCharacterSlotId(slot.id);
    setShowCharacterSlots(false);
  };

  // Load character slots on mount
  React.useEffect(() => {
    const loadCharacterSlots = async () => {
      setIsLoadingCharacters(true);
      try {
        const slots = await listCharacterSlots();
        setCharacterSlots(slots);

        // Load autosaves for each character slot
        const autosavesMap: Record<string, AutosaveMetadata> = {};
        await Promise.all(
          slots.map(async (slot) => {
            const autosave = await getAutosaveForCharacterSlot(slot.id);
            if (autosave) {
              autosavesMap[slot.id] = autosave;
            }
          })
        );
        setCharacterSlotAutosaves(autosavesMap);
      } catch (error) {
        console.error('Failed to load character slots:', error);
      } finally {
        setIsLoadingCharacters(false);
      }
    };

    loadCharacterSlots();
  }, []);

  // Handle selecting a character for a new game
  const handleSelectCharacterForNewGame = (slot: CharacterSlot) => {
    // Always show character details in the main setup area (never auto-load)
    setCharacterLocked(true);
    setSelectedCharacterSlotId(slot.id);
    setters.setCharacterName(slot.characterName);
    setters.setCharacterDesc(slot.characterDesc);
    setters.setCharacterStats(slot.stats);
    setters.setStatProgression(slot.statProgression);
    setters.setCharacterSlotId(slot.id);

    // Set the theme to the character's most recent adventure style
    const charTheme = slot.adventureStyles.length > 0
      ? slot.adventureStyles[slot.adventureStyles.length - 1]
      : state.themeChoice;
    setters.setThemeChoice(charTheme);

    // Set adventure name to the character's adventure name
    setters.setAdventureName(slot.name);
  };

  // Handle showing character description popup (right-click on web)
  const handleShowCharDescPopup = (slot: CharacterSlot, event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    setCharDescPopupSlot(slot);
    setCharDescPopupPosition({ x: event.clientX, y: event.clientY });
    setShowCharDescPopup(true);
  };

  // Handle creating a new character
  const handleCreateNewFromZone = () => {
    if (characterSlots.length >= MAX_CHARACTER_SLOTS) {
      return; // Max characters reached
    }
    // Clear any existing character data when creating a new character
    setCharacterLocked(false);
    setSelectedCharacterSlotId(undefined);
    setters.setCharacterName('');
    setters.setCharacterDesc('');
    setters.setCharacterStats({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    });
    setShowCharacterCreationModal(true);
  };

  const handleStartGame = () => {
    // Check if DND mode is selected without a character
    if (state.mode === GameMode.DND && !characterLocked) {
      setShowCharacterChoiceModal(true);
      return;
    }

    // If character is on adventure (has active autosave), load that game
    if (state.mode === GameMode.DND && selectedCharacterSlotId) {
      const activeAutosave = characterSlotAutosaves[selectedCharacterSlotId];
      if (activeAutosave) {
        onLoadGame && onLoadGame(activeAutosave.id);
        return;
      }
    }

    // handleStart uses the hook's internal state, which includes characterStats and statProgression
    handleStart();
  };

  // Custom theme handlers
  const handleThemeChange = (value: string) => {
    setters.setThemeChoice(value);
    if (value === CUSTOM_THEME_KEY) {
      setShowCustomThemeModal(true);
    }
  };

  const handleSelectCustomTheme = (themeName: string) => {
    setters.setThemeChoice(themeName);
    setters.setCustomTheme(themeName);
    setShowCustomThemeModal(false);
  };

  const handleAddNewCustomTheme = async () => {
    setCustomThemeError('');
    const trimmedName = newCustomThemeName.trim();
    if (!trimmedName) {
      setCustomThemeError('Please enter a theme name');
      return;
    }
    try {
      await hookAddCustomTheme(trimmedName);
      setNewCustomThemeName('');
      setShowCustomThemeModal(false);
    } catch (error: any) {
      setCustomThemeError(error.message || 'Failed to add custom theme');
    }
  };

  const RandomizeButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
    const randomizeBtnStyle: React.CSSProperties = {
      width: 40,
      height: 40,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.primary,
      cursor: state.isGeneratingRandom ? 'not-allowed' : 'pointer',
    };

    const randomizeBtnTextStyle: React.CSSProperties = {
      color: colors.primary,
      fontSize: 18,
    };

    return (
      <button
        onClick={onPress}
        style={randomizeBtnStyle}
        disabled={state.isGeneratingRandom}
      >
        <span style={randomizeBtnTextStyle}>🎲</span>
      </button>
    );
  };

  // Helper function to convert opacity percentage (0-100) to hex (0-255)
  const opacityToHex = (opacity: number): string => {
    const alpha = Math.round((opacity / 100) * 255);
    return alpha.toString(16).toUpperCase().padStart(2, '0');
  };

  // Styles
  const outerContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000',
    height: '100%',
    position: 'relative',
  };

  const centerContainerStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/src/assets/SomniumBackground.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 100,
  };

  const closeIconStyle: React.CSSProperties = {
    color: colors.primary,
    fontSize: 20,
  };

  const scrollContainerStyle: React.CSSProperties = {
    ...commonStyles.scrollContainer,
    backgroundColor: 'transparent',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 1,
  };

  const cardStyle: React.CSSProperties = {
    ...commonStyles.card,
    backgroundColor: colors.surface + opacityToHex(transparencySettings.textAreaOpacity),
    borderColor: colors.border,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  };

  const fieldContainerStyle: React.CSSProperties = {
    ...commonStyles.fieldContainer,
    marginBottom: 16,
  };

  const inputGroupStyle: React.CSSProperties = {
    ...commonStyles.inputGroup,
  };

  const rowStyle: React.CSSProperties = {
    ...commonStyles.row,
    display: 'flex',
    marginBottom: 12,
  };

  const flex1Style: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle: React.CSSProperties = {
    ...commonStyles.label,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  };

  const rowWithIconStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textMain,
    fontSize: 14,
    marginLeft: 8,
  };

  const textAreaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 80,
    paddingTop: 8,
    paddingLeft: 8,
    fontFamily: 'inherit',
    resize: 'vertical',
  };

  const pickerWrapperStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginLeft: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  };

  const pickerTextStyle: React.CSSProperties = {
    color: colors.textMain,
    fontSize: 14,
  };

  const downArrowStyle: React.CSSProperties = {
    color: colors.textMuted,
    fontSize: 12,
  };

  const randomizeBtnVerticalStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...commonStyles.primaryButton,
    backgroundColor: colors.primary,
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...commonStyles.secondaryButton,
    borderColor: colors.border,
    borderStyle: 'solid',
    borderWidth: 1,
    padding: '12px 24px',
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  };

  const buttonTextStyle: React.CSSProperties = {
    ...commonStyles.buttonText,
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  };

  const secondaryButtonTextStyle: React.CSSProperties = {
    ...commonStyles.secondaryButtonText,
    color: colors.textMain,
    fontSize: 16,
    fontWeight: '600',
  };

  const buttonRowStyle: React.CSSProperties = {
    ...commonStyles.buttonRow,
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '90%',
  };

  const modalTitleStyle: React.CSSProperties = {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  };

  const modalMessageStyle: React.CSSProperties = {
    color: colors.textMain,
    fontSize: 15,
    marginBottom: 20,
    lineHeight: '22px',
  };

  const modalButtonRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  };

  const modalButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: '600',
  };

  const modalButtonTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: '600',
  };

  const fullModalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  };

  const modalTitleLargeStyle: React.CSSProperties = {
    ...commonStyles.title,
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  };

  const themeNameStyle: React.CSSProperties = {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 8,
  };

  return (
    <div style={outerContainerStyle}>
      <div style={centerContainerStyle}>
        <div style={backgroundStyle}>
      {/* Close button to return to intro */}
      {props.onClose && (
        <button
          onClick={props.onClose}
          style={closeButtonStyle}
        >
          <span style={closeIconStyle}>✕</span>
        </button>
      )}

      <div style={scrollContainerStyle}>
        <div style={cardStyle}>
          {/* Game Mode - AT TOP */}
          <div style={fieldContainerStyle}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <HelpIcon topicId="gameMode" />
              <span style={{ ...labelStyle, marginLeft: 8 }}>Game Mode</span>
              <div style={{ marginLeft: 12 }}>
                <ToggleSwitch
                  testID="setup-mode-toggle"
                  value={state.mode === GameMode.DND}
                  onValueChange={(value) => handleModeChange(value ? GameMode.DND : GameMode.STORY)}
                  primaryColor={colors.primary}
                  backgroundColor={colors.background}
                />
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ color: colors.textMain, fontSize: 16 }}>
                {state.mode}
              </span>
            </div>
          </div>

          {/* Character Gender Selection */}
          <div style={fieldContainerStyle}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <HelpIcon topicId="characterGender" />
              <span style={{ ...labelStyle, marginLeft: 8 }}>Character Gender</span>
              <div style={{ marginLeft: 12 }}>
                <ToggleSwitch
                  testID="setup-gender-toggle"
                  value={state.characterGender === 'Female'}
                  onValueChange={(value) => setters.setCharacterGender(value ? 'Female' : 'Male')}
                  primaryColor={colors.primary}
                  backgroundColor={colors.background}
                />
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ color: colors.textMain, fontSize: 16 }}>
                {state.characterGender}
              </span>
            </div>
          </div>

          {/* Saved Stories (STORY mode only) OR Character Selection (DND mode only) */}
          {state.mode === GameMode.STORY && (
            <>
              {/* Existing Stories Panel - STORY MODE ONLY */}
              {(() => {
                const storySaves = (state.autosaves ?? []).filter(save => save.mode !== 'DND' && save.mode !== GameMode.DND);
                return storySaves.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <button
                      onClick={() => setters.setShowExistingStories(!state.showExistingStories)}
                      style={{
                        ...fieldContainerStyle,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor: colors.background + '40',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: colors.border,
                        width: '100%',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ color: colors.textMain, fontSize: 14, fontWeight: '600' }}>
                        Continue Existing {storySaves.length==1?"Story":"Stories"}{storySaves.length > 0 ? `(${storySaves.length})` : ''}
                      </span>
                      <span style={{ color: colors.primary, fontSize: 18 }}>
                        {state.showExistingStories ? '▼' : '▶'}
                      </span>
                    </button>

                    {state.showExistingStories && (
                      <div style={{
                        marginTop: 10,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: colors.border,
                        borderRadius: 8,
                        backgroundColor: colors.background + '20',
                        maxHeight: 300,
                      }}>
                        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                          {storySaves.map((save) => (
                            <div
                              key={save.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomStyle: 'solid',
                                borderBottomColor: colors.border + '50',
                              }}
                            >
                              <button
                                style={{ flex: 1, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                                onClick={() => onLoadGame && onLoadGame(save.id)}
                              >
                                <div style={{ color: colors.textMain, fontSize: 14, fontWeight: '600' }}>
                                  {save.name}
                                </div>
                                <div style={{ color: colors.textMuted, fontSize: 12 }}>
                                  {save.characterName} • {save.timestamp}
                                </div>
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleDeleteAutosave(save.id);
                                }}
                                style={{
                                  padding: 8,
                                  marginLeft: 8,
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ color: '#ef4444', fontSize: 18 }}>🗑</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Empty state when no stories - STORY MODE ONLY */}
              {((state.autosaves ?? []).filter(a => a.mode !== 'DND' && a.mode !== GameMode.DND).length === 0) && (
                <div style={{
                  marginBottom: 20,
                  padding: 20,
                  backgroundColor: colors.background + '20',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: colors.border,
                  textAlign: 'center',
                }}>
                  <span style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>
                    Create a new world for yourself and begin your story.
                  </span>
                </div>
              )}
            </>
          )}

          {/* Character Selection Zone - DND MODE ONLY */}
          {state.mode === GameMode.DND && (
            <div style={{ ...fieldContainerStyle, marginBottom: 24 }}>
              <span style={{ ...labelStyle, marginBottom: 8 }}>Character Selection</span>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Horizontal scrollable character list */}
                <div
                  style={{
                    flex: 1,
                    maxHeight: 145,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: colors.border,
                    borderRadius: 8,
                    backgroundColor: colors.background + '20',
                    marginBottom: 8,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    display: 'flex',
                    padding: 8,
                    gap: 12,
                  }}
                >
                  {isLoadingCharacters ? (
                    <span style={{ color: colors.textMuted, padding: 16 }}>Loading characters...</span>
                  ) : characterSlots.length === 0 ? (
                    <span style={{ color: colors.textMuted, padding: 16 }}>No characters yet. Create one to begin!</span>
                  ) : (
                    characterSlots.map((slot) => {
                      const activeAutosave = characterSlotAutosaves[slot.id];
                      const isSelected = selectedCharacterSlotId === slot.id;
                      const onAdventure = !!activeAutosave;

                      const cardStyle: React.CSSProperties = {
                        minWidth: 200,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        backgroundColor: colors.surface,
                        flexShrink: 0,
                      };

                      const selectedCardStyle: React.CSSProperties = {
                        ...cardStyle,
                        borderColor: colors.primary,
                      };

                      const unselectedCardStyle: React.CSSProperties = {
                        ...cardStyle,
                        borderColor: colors.border,
                      };

                      return (
                        <div
                          key={slot.id}
                          style={isSelected ? selectedCardStyle : unselectedCardStyle}
                        >
                          {!onAdventure ? (
                            <>
                              <button
                                onClick={() => handleSelectCharacterForNewGame(slot)}
                                onContextMenu={(e) => handleShowCharDescPopup(slot, e)}
                                style={{ position: 'relative', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                              >
                                {/* Character info */}
                                <div style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                                  {slot.characterName}
                                </div>
                                <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 2 }}>
                                  {slot.name}
                                </div>

                                {/* Stats preview */}
                                <div style={{ color: colors.textMain, fontSize: 11 }}>
                                  STR {slot.stats.strength} | DEX {slot.stats.dexterity} | CON {slot.stats.constitution}
                                </div>
                                <div style={{ color: colors.textMain, fontSize: 11 }}>
                                  INT {slot.stats.intelligence} | WIS {slot.stats.wisdom} | CHA {slot.stats.charisma}
                                </div>

                                {/* Selected indicator */}
                                {isSelected && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      backgroundColor: colors.primary,
                                      borderRadius: 10,
                                      width: 20,
                                      height: 20,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ color: colors.background, fontSize: 12, fontWeight: 'bold' }}>✓</span>
                                  </div>
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSelectCharacterForNewGame(slot)}
                              onContextMenu={(e) => handleShowCharDescPopup(slot, e)}
                              style={{ position: 'relative', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                            >
                              {/* Character info with lighter overlay */}
                              <div style={{ position: 'relative', paddingBottom: 36 }}>
                                <div style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                                  {slot.characterName}
                                </div>
                                <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 2 }}>
                                  {slot.name}
                                </div>

                                {/* Stats preview */}
                                <div style={{ color: colors.textMain, fontSize: 11 }}>
                                  STR {slot.stats.strength} | DEX {slot.stats.dexterity} | CON {slot.stats.constitution}
                                </div>
                                <div style={{ color: colors.textMain, fontSize: 11 }}>
                                  INT {slot.stats.intelligence} | WIS {slot.stats.wisdom} | CHA {slot.stats.charisma}
                                </div>
                              </div>

                              {/* Light overlay at bottom with label only */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  borderBottomLeftRadius: 6,
                                  borderBottomRightRadius: 6,
                                  paddingVertical: 6,
                                  paddingHorizontal: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ color: colors.textMain, fontSize: 10, fontWeight: '600' }}>
                                  On adventure
                                </span>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Create New button */}
                <div style={{ marginLeft: 12 }}>
                  <button
                    onClick={handleCreateNewFromZone}
                    disabled={characterSlots.length >= MAX_CHARACTER_SLOTS}
                    style={{
                      width: 120,
                      height: 135,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: colors.surface + '80',
                      cursor: characterSlots.length >= MAX_CHARACTER_SLOTS ? 'not-allowed' : 'pointer',
                      ...(characterSlots.length >= MAX_CHARACTER_SLOTS
                        ? { borderColor: colors.textMuted, opacity: 0.5 }
                        : { borderColor: colors.primary }),
                    }}
                  >
                    {characterSlots.length >= MAX_CHARACTER_SLOTS ? (
                      <>
                        <span style={{ color: colors.textMuted, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                          Too many
                        </span>
                        <span style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                          characters
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: colors.primary, fontSize: 32 }}>+</span>
                        <span style={{ color: colors.primary, fontSize: 14, fontWeight: '600', marginTop: 8 }}>
                          Create New
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={inputGroupStyle}>
          {/* Adventure Name */}
          <div style={rowStyle}>
            <div style={flex1Style}>
              <span style={labelStyle}>Adventure Name</span>
              <div style={rowWithIconStyle}>
                <HelpIcon topicId="storyName" />
                <input
                  data-testid="setup-adventure-name"
                  style={inputStyle}
                  value={state.name}
                  onChange={(e) => setters.setName(e.target.value)}
                  placeholder="Name your dream..."
                  disabled={characterLocked}
                />
                {!characterLocked && <RandomizeButton onPress={handlers.randomizeName} />}
              </div>
            </div>
          </div>

          {/* Character Name - read-only when D&D mode with locked character */}
          <div style={rowStyle}>
            <div style={flex1Style}>
              <span style={labelStyle}>Character Name</span>
              <div style={rowWithIconStyle}>
                <HelpIcon topicId="characterName" />
                <input
                  data-testid="setup-character-name"
                  style={inputStyle}
                  value={state.characterName}
                  onChange={(e) => setters.setCharacterName(e.target.value)}
                  placeholder="Who are you?"
                  disabled={characterLocked}
                />
                {!characterLocked && <RandomizeButton onPress={handlers.randomizeCharacterName} />}
              </div>
            </div>
          </div>

          {/* Story Theme - read-only when D&D mode with locked character */}
          <div style={rowStyle}>
            <div style={flex1Style}>
              <span style={labelStyle}>Story Theme</span>
              <div style={rowWithIconStyle}>
                <HelpIcon topicId="theme" />
                <button
                  data-testid="setup-theme-selector"
                  style={pickerWrapperStyle}
                  onClick={() => !characterLocked && setShowGameThemePicker(true)}
                  disabled={characterLocked}
                >
                  <span style={pickerTextStyle}>
                    {state.themeChoice || 'Select a theme...'}
                  </span>
                  <span style={downArrowStyle}>▼</span>
                </button>
                {!characterLocked && <RandomizeButton onPress={handlers.randomizeTheme} />}
              </div>
            </div>
          </div>

          {/* Character Background - read-only when D&D mode with locked character */}
          <div style={rowStyle}>
            <div style={flex1Style}>
              <span style={labelStyle}>Character Background</span>
              <div style={rowWithIconStyle}>
                <HelpIcon topicId="characterDesc" />
                <textarea
                  data-testid="setup-character-background"
                  style={textAreaStyle}
                  value={state.characterDesc}
                  onChange={(e) => setters.setCharacterDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe your origins, skills, and appearance..."
                  disabled={characterLocked}
                />
                {!characterLocked && (
                  <div style={randomizeBtnVerticalStyle}>
                    <RandomizeButton onPress={handlers.randomizeCharacterDesc} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generate all button - hide when character is locked */}
          {!characterLocked && (
            <button
              data-testid="setup-generate-all"
              style={{
                ...secondaryButtonStyle,
                backgroundColor: colors.secondary + '20',
                borderColor: colors.secondary,
                marginBottom: 16,
                ...(state.isGeneratingRandom && { opacity: 0.5 }),
              }}
              onClick={handlers.randomizeAll}
              disabled={state.isGeneratingRandom}
            >
              <span style={{ color: colors.secondary, fontSize: 16, fontWeight: '600' }}>
                🎲 Generate all
              </span>
            </button>
          )}

          <div style={buttonRowStyle}>
            <button
              data-testid="setup-begin-story"
              style={{ ...primaryButtonStyle, ...(state.isGeneratingRandom && { opacity: 0.5 }) }}
              onClick={handleStartGame}
              disabled={state.isGeneratingRandom || (state.mode === GameMode.DND && characterLocked && !state.characterName)}
            >
              <span style={buttonTextStyle}>
                {state.isGeneratingRandom ? 'Generating...' : (() => {
                  // Check if the selected character has an active autosave
                  if (state.mode === GameMode.DND && selectedCharacterSlotId) {
                    const activeAutosave = characterSlotAutosaves[selectedCharacterSlotId];
                    if (activeAutosave) return 'Continue Story';
                  }
                  return 'Begin Story';
                })()}
              </span>
            </button>

            <button
              data-testid="setup-load-story"
              style={{
                ...secondaryButtonStyle,
                ...(state.isGeneratingRandom && { opacity: 0.5 }),
              }}
              onClick={props.onImport}
              disabled={state.isGeneratingRandom}
            >
              <span style={secondaryButtonTextStyle}>
                Load Story
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Character Choice Modal for Roleplaying Mode */}
      {showCharacterChoiceModal && (
        <div style={modalOverlayStyle} onClick={handleCancelCharacterChoice}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <span style={modalTitleStyle}>Roleplaying Character</span>
            <span style={modalMessageStyle}>
              For Roleplaying mode, you need a character with stats. Would you like to create a new character or load an existing one?
            </span>
            <div style={modalButtonRowStyle}>
              <button
                data-testid="setup-create-new-character"
                style={{ ...modalButtonStyle, backgroundColor: colors.primary }}
                onClick={handleCreateNewCharacter}
              >
                <span style={{ ...modalButtonTextStyle, color: colors.background }}>Create New</span>
              </button>
              <button
                data-testid="setup-load-existing-character"
                style={{ ...modalButtonStyle, backgroundColor: colors.secondary + '30', borderColor: colors.secondary, borderWidth: 1, borderStyle: 'solid' }}
                onClick={handleLoadExistingCharacter}
              >
                <span style={{ ...modalButtonTextStyle, color: colors.secondary }}>Load Existing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Creation Modal */}
      <CharacterCreationModal
        visible={showCharacterCreationModal}
        onClose={handleCancelCharacterCreation}
        onCreate={handleCharacterCreated}
        initialName={state.characterName}
        initialDesc={state.characterDesc}
      />

      {/* Character Slots Modal */}
      {showCharacterSlots && (
        <div style={fullModalStyle}>
          <div style={modalHeaderStyle}>
            <button
              onClick={() => {
                setShowCharacterSlots(false);
                setShowCharacterChoiceModal(true);
              }}
              style={{ background: 'transparent', border: 'none', marginRight: 12, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 24, color: colors.primary }}>←</span>
            </button>
            <span style={modalTitleLargeStyle}>
              Saved Characters
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <CharacterSlots
              onSelectSlot={handleStartWithExistingSlot}
              onCreateNew={handleCreateNewCharacter}
            />
          </div>
        </div>
      )}

      {/* Custom Theme Selection Modal */}
      {showCustomThemeModal && (
        <div style={fullModalStyle}>
          <div style={modalHeaderStyle}>
            <button
              onClick={() => setShowCustomThemeModal(false)}
              style={{ background: 'transparent', border: 'none', marginRight: 12, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 24, color: colors.primary }}>←</span>
            </button>
            <span style={modalTitleLargeStyle}>
              Custom Theme
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {/* Existing custom themes */}
            {state.customThemes && state.customThemes.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ ...modalTitleStyle, color: colors.textMain, marginBottom: 12, display: 'block' }}>
                  Your Custom Themes
                </span>
                {state.customThemes.map(theme => (
                  <button
                    key={theme}
                    style={{
                      ...cardStyle,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      padding: 16,
                      marginBottom: 8,
                      width: '100%',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectCustomTheme(theme)}
                  >
                    <span style={themeNameStyle}>{theme}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Add new custom theme */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ ...modalTitleStyle, color: colors.textMain, marginBottom: 12, display: 'block' }}>
                Create New Theme
              </span>
              <input
                style={{
                  ...inputStyle,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textMain,
                  marginBottom: 8,
                  width: '100%',
                }}
                value={newCustomThemeName}
                onChange={(e) => setNewCustomThemeName(e.target.value)}
                placeholder="Enter theme name..."
              />
              {customThemeError && (
                <span style={errorTextStyle}>{customThemeError}</span>
              )}
              <button
                style={{
                  ...primaryButtonStyle,
                  backgroundColor: colors.primary,
                  marginTop: 8,
                }}
                onClick={handleAddNewCustomTheme}
              >
                <span style={{ ...buttonTextStyle, color: colors.background }}>
                  Add Theme
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Theme Picker Modal */}
      {showGameThemePicker && (
        <GameThemePicker
          onSelect={(theme) => {
            setters.setThemeChoice(theme);
            setShowGameThemePicker(false);
          }}
          onClose={() => setShowGameThemePicker(false)}
          currentTheme={state.themeChoice}
        />
      )}

      {/* Randomize Ad Modal */}
      <RandomizeAdModal
        visible={state.showRandomizeAdModal}
        remaining={state.remainingRandomizes}
        onWatchAd={handleWatchRandomizeAd}
        onClose={handleCloseRandomizeAdModal}
      />

      {/* Help Tooltips */}
      <FloatingTooltip
        visible={showHelp === 'gameMode'}
        onClose={() => setShowHelp('')}
        content={helpTopics.gameMode}
        triggerPosition={helpPosition}
      />
      <FloatingTooltip
        visible={showHelp === 'storyName'}
        onClose={() => setShowHelp('')}
        content={helpTopics.storyName}
        triggerPosition={helpPosition}
      />
      <FloatingTooltip
        visible={showHelp === 'characterName'}
        onClose={() => setShowHelp('')}
        content={helpTopics.characterName}
        triggerPosition={helpPosition}
      />
      <FloatingTooltip
        visible={showHelp === 'theme'}
        onClose={() => setShowHelp('')}
        content={helpTopics.theme}
        triggerPosition={helpPosition}
      />
      <FloatingTooltip
        visible={showHelp === 'characterDesc'}
        onClose={() => setShowHelp('')}
        content={helpTopics.characterDesc}
        triggerPosition={helpPosition}
      />

      {/* Character Description Popup */}
      {showCharDescPopup && (
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
            zIndex: 2000,
          }}
          onClick={() => setShowCharDescPopup(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              maxWidth: 400,
              width: '90%',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: colors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 12, display: 'block' }}>
              {charDescPopupSlot?.characterName}
            </span>
            <span style={{ color: colors.textMuted, fontSize: 14, marginBottom: 16, display: 'block' }}>
              {charDescPopupSlot?.name}
            </span>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <span style={{ color: colors.textMain, fontSize: 14, lineHeight: '20px' }}>
                {charDescPopupSlot?.characterDesc}
              </span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setShowCharDescPopup(false)}
              >
                <span style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
        </div>
      </div>
  );
};

export default SetupWizard;
