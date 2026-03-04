/**
 * CharacterCreationModal.web.tsx (Pure Web)
 *
 * Modal for creating D&D characters with:
 * - Name and background
 * - D&D stats (STR, DEX, CON, INT, WIS, CHA)
 * - Roll 4d6 drop lowest, then redistribute points (max 60 total)
 * - Up/down buttons for stat adjustment
 */

import React, { useState, useRef, useEffect } from 'react';
import { GameMode } from '../../../constants/types';
import type { CharacterStats } from '../../../constants/types';
import { commonStyles } from '../../../constants/styles';
import { useTheme } from '../../../services/ThemeContext';
import FloatingTooltip from './FloatingTooltip.web';

interface CharacterCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (characterName: string, characterDesc: string, stats: CharacterStats) => void;
  initialName?: string;
  initialDesc?: string;
}

const RandomizeButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => {
  const { currentTheme: colors } = useTheme();
  const btnStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    opacity: disabled ? 0.5 : 1,
  };
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={btnStyle}
    >
      <span style={{ color: colors.primary, fontSize: 18 }}>🎲</span>
    </button>
  );
};

// Helper function to fetch random values from AI
async function fetchRandomValues() {
  const prompt = `Generate a unique, creative character for an interactive narrative RPG.

IMPORTANT: Draw inspiration from names around the world—African, Asian, European, Indigenous, Middle Eastern, and beyond. Embrace cultural diversity, invented names, and meaningful combinations that bring characters to life.

Create in JSON format only (no markdown, no extra text):
{
  "characterName": "Unique character name inspired by diverse world cultures",
  "characterDesc": "Brief but intriguing character background (2-3 sentences, include a unique trait or ability)"
}

Be creative and original. Avoid clichés. Respond ONLY with valid JSON.`;

  try {
    const { fetchSimpleAIResponse } = await import('../../../services/aiService');
    const { text: response } = await fetchSimpleAIResponse(prompt, undefined, {
      jsonMode: true,
      timeout: 120000, // 2 minutes for character creation (users are waiting interactively)
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.warn('AI generation failed, using local fallback:', error);
    // Local fallback
    const localNames = [
      'Jaxom', 'Mirelle', 'Oryn', 'Xanthe', 'Voryn', 'Kymethra', 'Zylas', 'Aurelius',
      'Cerys', 'Draven', 'Elowen', 'Fenrix', 'Glyndis', 'Haldor', 'Ilyria', 'Joryn',
    ];
    const localDescs = [
      'A wanderer with a mysterious past and strange powers.',
      'An outcast seeking redemption for a forgotten crime.',
      'A scholar who discovered secrets that were meant to stay buried.',
      'A mercenary with a code of honor, haunted by a mission gone wrong.',
      'A street-smart survivor who knows every secret in the city.',
    ];
    const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
      characterName: getRandomElement(localNames),
      characterDesc: getRandomElement(localDescs),
    };
  }
}

// Roll 4d6 and drop lowest
function rollStat(): number {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  rolls.sort((a, b) => b - a); // Sort descending
  return rolls[0] + rolls[1] + rolls[2]; // Sum top 3
}

// Roll all 6 stats and cap total at 60
function rollAllStatsCapped(): CharacterStats {
  let rolled = {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat(),
  };

  // Calculate total
  let total = rolled.strength + rolled.dexterity + rolled.constitution +
              rolled.intelligence + rolled.wisdom + rolled.charisma;

  // If over 60, reduce proportionally
  if (total > 60) {
    const scale = 60 / total;
    rolled.strength = Math.max(3, Math.floor(rolled.strength * scale));
    rolled.dexterity = Math.max(3, Math.floor(rolled.dexterity * scale));
    rolled.constitution = Math.max(3, Math.floor(rolled.constitution * scale));
    rolled.intelligence = Math.max(3, Math.floor(rolled.intelligence * scale));
    rolled.wisdom = Math.max(3, Math.floor(rolled.wisdom * scale));
    rolled.charisma = Math.max(3, Math.floor(rolled.charisma * scale));
  }

  return rolled;
}

// Default stats (all 10s = 60 total)
const defaultStats: CharacterStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const MAX_TOTAL_POINTS = 60;
const MIN_STAT_VALUE = 3;
const MAX_STAT_VALUE = 18;

const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  visible,
  onClose,
  onCreate,
  initialName = '',
  initialDesc = '',
}) => {
  const { currentTheme: colors } = useTheme();
  const [characterName, setCharacterName] = useState(initialName);
  const [characterDesc, setCharacterDesc] = useState(initialDesc);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats
  const [stats, setStats] = useState<CharacterStats>(defaultStats);

  // Help tooltip state
  const [showHelp, setShowHelp] = useState('');
  const [helpPosition, setHelpPosition] = useState<{ x: number; y: number; width: number; height: number } | undefined>();

  const characterNameInputRef = useRef<HTMLInputElement>(null);

  // Reset and focus when modal opens, or update when initial values change
  useEffect(() => {
    if (visible) {
      setCharacterName(initialName);
      setCharacterDesc(initialDesc);
      setStats(defaultStats);
      setTimeout(() => {
        characterNameInputRef.current?.focus();
      }, 100);
    }
  }, [visible, initialName, initialDesc]);

  // Calculate modifier
  const getModifier = (stat: number): number => Math.floor((stat - 10) / 2);

  // Calculate total points used
  const getTotalPoints = (): number => {
    return stats.strength + stats.dexterity + stats.constitution +
           stats.intelligence + stats.wisdom + stats.charisma;
  };

  // Get remaining points
  const getRemainingPoints = (): number => {
    return MAX_TOTAL_POINTS - getTotalPoints();
  };

  // Handle stat change with point redistribution
  const handleStatChange = (stat: keyof CharacterStats, newValue: number) => {
    const currentTotal = getTotalPoints();
    const currentValue = stats[stat];
    const difference = newValue - currentValue;

    // Check if we have enough points remaining for increase
    if (difference > 0 && getRemainingPoints() < difference) {
      return; // Not enough points
    }

    setStats(prev => ({ ...prev, [stat]: newValue }));
  };

  // Roll all stats (capped at 60 total)
  const handleRollAll = () => {
    const rolled = rollAllStatsCapped();
    setStats(rolled);
  };

  const handleRandomizeName = async () => {
    setIsGenerating(true);
    try {
      const randoms = await fetchRandomValues();
      setCharacterName(randoms.characterName || '');
    } catch (error) {
      console.error('Failed to randomize:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomizeDesc = async () => {
    setIsGenerating(true);
    try {
      const randoms = await fetchRandomValues();
      setCharacterDesc(randoms.characterDesc || 'A mysterious figure.');
    } catch (error) {
      console.error('Failed to randomize:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    if (characterName.trim() && characterDesc.trim()) {
      onCreate(characterName.trim(), characterDesc.trim(), stats);
    }
  };

  const canCreate = () => {
    return characterName.trim() && characterDesc.trim() && getTotalPoints() <= MAX_TOTAL_POINTS;
  };

  const StatRow: React.FC<{
    label: string;
    stat: keyof CharacterStats;
    index: number;
  }> = ({ label, stat, index }) => {
    const statRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderColor: colors.border,
      backgroundColor: index % 2 === 1 ? colors.background + '10' : 'transparent',
    };

    const statLabelContainerStyle: React.CSSProperties = {
      flex: 1,
    };

    const statLabelStyle: React.CSSProperties = {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    };

    const statModifierSmallStyle: React.CSSProperties = {
      fontSize: 11,
      marginTop: 2,
      color: colors.textMuted,
    };

    const statControlsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    };

    const statButtonStyle = (enabled: boolean): React.CSSProperties => ({
      width: 32,
      height: 32,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.secondary + '30',
      border: 'none',
      cursor: enabled ? 'pointer' : 'not-allowed',
      opacity: enabled ? 1 : 0.5,
    });

    const statButtonTextStyle: React.CSSProperties = {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondary,
    };

    const statValueStyle: React.CSSProperties = {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textMain,
      minWidth: 40,
      textAlign: 'center',
    };

    return (
      <div style={statRowStyle}>
        <div style={statLabelContainerStyle}>
          <span style={statLabelStyle}>{label}</span>
          <span style={statModifierSmallStyle}>
            Mod: {getModifier(stats[stat]) >= 0 ? '+' : ''}{getModifier(stats[stat])}
          </span>
        </div>

        <div style={statControlsStyle}>
          <button
            style={statButtonStyle(stats[stat] > MIN_STAT_VALUE)}
            onClick={() => handleStatChange(stat, Math.max(MIN_STAT_VALUE, stats[stat] - 1))}
            disabled={stats[stat] <= MIN_STAT_VALUE}
          >
            <span style={statButtonTextStyle}>−</span>
          </button>

          <span style={statValueStyle}>
            {stats[stat]}
          </span>

          <button
            style={statButtonStyle(getRemainingPoints() > 0 && stats[stat] < MAX_STAT_VALUE)}
            onClick={() => handleStatChange(stat, Math.min(MAX_STAT_VALUE, stats[stat] + 1))}
            disabled={getRemainingPoints() <= 0 || stats[stat] >= MAX_STAT_VALUE}
          >
            <span style={statButtonTextStyle}>+</span>
          </button>
        </div>
      </div>
    );
  };

  // Help icon component
  const HelpIcon: React.FC<{ topicId: string }> = ({ topicId }) => (
    <button
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        cursor: 'pointer',
      }}
      onClick={(e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        setHelpPosition({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
        setShowHelp(topicId);
      }}
    >
      <span style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold', fontStyle: 'italic' }}>i</span>
    </button>
  );

  if (!visible) return null;

  const modalContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b',
    zIndex: 1000,
  };

  const modalContentWrapperStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: 600,
    margin: '0 auto',
    height: '100%',
  };

  const modalContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  };

  const backButtonStyle: React.CSSProperties = {
    padding: 4,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const backButtonTextStyle: React.CSSProperties = {
    fontSize: 16,
    color: colors.textMuted,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  };

  const placeholderStyle: React.CSSProperties = {
    width: 60,
  };

  const scrollContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
  };

  const scrollContentContainerStyle: React.CSSProperties = {
    padding: 16,
  };

  const pointsDisplayCardStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    borderColor: colors.secondary + '30',
  };

  const pointsTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  };

  const fieldContainerStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textMuted,
  };

  const rowWithIconStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 16,
    minHeight: 45,
    color: '#fff',
    backgroundColor: '#0f172a',
    borderColor: colors.border,
    boxSizing: 'border-box',
  };

  const textAreaStyle: React.CSSProperties = {
    minHeight: 100,
    resize: 'vertical',
  };

  const statsContainerStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const statsHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    minHeight: 40,
  };

  const statsTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  };

  const rollButtonStyle: React.CSSProperties = {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    border: 'none',
    cursor: 'pointer',
  };

  const rollButtonTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  };

  const statsInstructionsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: -4,
    left: 0,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textMuted,
  };

  const statsListStyle: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: colors.border,
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    backgroundColor: '#0f172a',
  };

  const createButtonStyle: React.CSSProperties = {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    border: 'none',
    cursor: 'pointer',
    opacity: canCreate() ? 1 : 0.5,
  };

  const createButtonTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background,
  };

  return (
    <>
      <div style={modalContainerStyle}>
        <div style={modalContentWrapperStyle}>
          <div style={modalContentStyle}>
            {/* Header */}
            <div style={headerStyle}>
              <button onClick={onClose} style={backButtonStyle}>
                <span style={backButtonTextStyle}>Cancel</span>
              </button>
              <span style={titleStyle}>Create Your Character</span>
              <div style={placeholderStyle}></div>
            </div>

            <div style={scrollContentStyle}>
              <div style={scrollContentContainerStyle}>
                {/* Points Display */}
                <div style={pointsDisplayCardStyle}>
                  <span style={pointsTextStyle}>
                    Available Points: {getRemainingPoints()}
                  </span>
                </div>

                {/* Character Name */}
                <div style={fieldContainerStyle}>
                  <span style={labelStyle}>Character Name</span>
                  <div style={rowWithIconStyle}>
                    <input
                      ref={characterNameInputRef}
                      style={inputStyle}
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="Who are you?"
                    />
                    <RandomizeButton onPress={handleRandomizeName} disabled={isGenerating} />
                  </div>
                </div>

                {/* Character Background */}
                <div style={fieldContainerStyle}>
                  <span style={labelStyle}>Character Background</span>
                  <div style={rowWithIconStyle}>
                    <HelpIcon topicId="characterBackground" />
                    <textarea
                      style={{ ...inputStyle, ...textAreaStyle, marginLeft: 8, flex: 1 }}
                      value={characterDesc}
                      onChange={(e) => setCharacterDesc(e.target.value)}
                      placeholder="Describe your origins, skills, and appearance..."
                    />
                    <div style={{ justifyContent: 'flex-start', paddingTop: 12 }}>
                      <RandomizeButton onPress={handleRandomizeDesc} disabled={isGenerating} />
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div style={statsContainerStyle}>
                  <div style={statsHeaderStyle}>
                    <span style={statsTitleStyle}>Ability Scores</span>
                    <button
                      style={rollButtonStyle}
                      onClick={handleRollAll}
                    >
                      <span style={rollButtonTextStyle}>
                        Roll Stats 🎲
                      </span>
                    </button>
                    <span style={statsInstructionsStyle}>
                      Adjust ability points to mold your character
                    </span>
                  </div>

                  <div style={statsListStyle}>
                    <StatRow label="Strength (STR)" stat="strength" index={0} />
                    <StatRow label="Dexterity (DEX)" stat="dexterity" index={1} />
                    <StatRow label="Constitution (CON)" stat="constitution" index={2} />
                    <StatRow label="Intelligence (INT)" stat="intelligence" index={3} />
                    <StatRow label="Wisdom (WIS)" stat="wisdom" index={4} />
                    <StatRow label="Charisma (CHA)" stat="charisma" index={5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div style={footerStyle}>
              <button
                style={createButtonStyle}
                onClick={handleCreate}
                disabled={!canCreate() || isGenerating}
              >
                <span style={createButtonTextStyle}>
                  {isGenerating ? 'Generating...' : 'Create Character'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help tooltip */}
      <FloatingTooltip
        visible={Boolean(showHelp)}
        onClose={() => setShowHelp('')}
        content={{ title: showHelp, content: [], tips: [] }}
        triggerPosition={helpPosition}
      />
    </>
  );
};

export default CharacterCreationModal;
