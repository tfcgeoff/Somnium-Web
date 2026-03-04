/**
 * CharacterCreator Component (Pure Web)
 *
 * Character stats creation UI with roll/point-buy methods
 */

import React from 'react';
import type { CharacterStats } from '../../constants/types';
import { commonStyles } from '../../constants/styles';
import { useTheme } from '../../services/ThemeContext';
import { useCharacterCreator } from '../data/CharacterCreator';
import type { StatAllocationMethod } from '../data/CharacterCreator';

interface CharacterCreatorProps {
  initialStats?: CharacterStats;
  onStatsChange: (stats: CharacterStats) => void;
}

const STAT_NAMES: { [K in keyof CharacterStats]: string } = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
};

const STAT_ABBREVS: { [K in keyof CharacterStats]: string } = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  initialStats,
  onStatsChange,
}) => {
  const { currentTheme: colors } = useTheme();
  const {
    stats,
    method,
    pointBuyRemaining,
    isRolling,
    setMethod,
    rollAll,
    rollSingle,
    incrementStat,
    decrementStat,
    canIncrementStat,
    canDecrementStat,
    getModifier,
    POINT_BUY_MAX_POINTS,
  } = useCharacterCreator({ initialStats, onStatsChange });

  const StatRow: React.FC<{
    name: keyof CharacterStats;
    label: string;
    abbrev: string;
    value: number;
  }> = ({ name, label, abbrev, value }) => {
    const modifier = getModifier(value);

    const statRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.border,
      backgroundColor: colors.surface,
    };

    const statInfoStyle: React.CSSProperties = {
      flex: 1,
    };

    const statAbbrevStyle: React.CSSProperties = {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    };

    const statNameStyle: React.CSSProperties = {
      fontSize: 12,
      marginTop: 2,
      color: colors.textMuted,
    };

    const statValueRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    };

    const statValueStyle: React.CSSProperties = {
      fontSize: 24,
      fontWeight: 'bold',
      minWidth: 40,
      textAlign: 'center',
      color: colors.textMain,
    };

    const statModifierStyle: React.CSSProperties = {
      fontSize: 14,
      minWidth: 50,
      color: colors.textMuted,
    };

    const rollSingleBtnStyle: React.CSSProperties = {
      width: 36,
      height: 36,
      borderRadius: 6,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}20`,
      cursor: isRolling ? 'not-allowed' : 'pointer',
    };

    const rollSingleBtnTextStyle: React.CSSProperties = {
      fontSize: 16,
      color: colors.primary,
    };

    const pointBuyRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    };

    const pointBtnStyle = (enabled: boolean): React.CSSProperties => ({
      width: 40,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: enabled ? colors.secondary : colors.border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: enabled ? `${colors.secondary}20` : colors.background,
      cursor: enabled ? 'pointer' : 'not-allowed',
    });

    const pointBtnTextStyle = (enabled: boolean): React.CSSProperties => ({
      fontSize: 20,
      fontWeight: 'bold',
      color: enabled ? colors.secondary : colors.textMuted,
    });

    const statValueDisplayStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 100,
      justifyContent: 'center',
    };

    return (
      <div style={statRowStyle}>
        <div style={statInfoStyle}>
          <span style={statAbbrevStyle}>{abbrev}</span>
          <span style={statNameStyle}>{label}</span>
        </div>

        {method === 'roll' ? (
          <div style={statValueRowStyle}>
            <span style={statValueStyle}>{value}</span>
            <span style={statModifierStyle}>({modifier})</span>
            <button
              style={rollSingleBtnStyle}
              onClick={() => rollSingle(name)}
              disabled={isRolling}
            >
              <span style={rollSingleBtnTextStyle}>{isRolling ? '...' : '🎲'}</span>
            </button>
          </div>
        ) : (
          <div style={pointBuyRowStyle}>
            <button
              style={pointBtnStyle(canDecrementStat(name))}
              onClick={() => decrementStat(name)}
              disabled={!canDecrementStat(name)}
            >
              <span style={pointBtnTextStyle(canDecrementStat(name))}>-</span>
            </button>

            <div style={statValueDisplayStyle}>
              <span style={statValueStyle}>{value}</span>
              <span style={statModifierStyle}>({modifier})</span>
            </div>

            <button
              style={pointBtnStyle(canIncrementStat(name))}
              onClick={() => incrementStat(name)}
              disabled={!canIncrementStat(name)}
            >
              <span style={pointBtnTextStyle(canIncrementStat(name))}>+</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    ...commonStyles.scrollContainer,
    backgroundColor: colors.background,
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

  const methodSelectorStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  };

  const methodBtnStyle = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: selected ? colors.primary : colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: selected ? `${colors.primary}30` : colors.background,
    cursor: 'pointer',
  });

  const methodBtnTextStyle = (selected: boolean): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: '600',
    color: selected ? colors.primary : colors.textMuted,
  });

  const pointsRemainingBoxStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${colors.secondary}50`,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
  };

  const pointsRemainingTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  };

  const rollAllBtnStyle: React.CSSProperties = {
    paddingVertical: 12,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: colors.primary,
    opacity: isRolling ? 0.5 : 1,
    border: 'none',
    cursor: isRolling ? 'not-allowed' : 'pointer',
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  };

  const statsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8,
  };

  const instructionsBoxStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    marginTop: 16,
    backgroundColor: colors.background,
  };

  const instructionsTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textMuted,
  };

  const instructionsTextStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: '18px',
    color: colors.textMain,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Character Stats</h2>

        {/* Method Selection */}
        <div style={methodSelectorStyle}>
          <button
            style={methodBtnStyle(method === 'roll')}
            onClick={() => setMethod('roll')}
          >
            <span style={methodBtnTextStyle(method === 'roll')}>Roll 4d6</span>
          </button>

          <button
            style={methodBtnStyle(method === 'point-buy')}
            onClick={() => setMethod('point-buy')}
          >
            <span style={methodBtnTextStyle(method === 'point-buy')}>Point Buy</span>
          </button>
        </div>

        {/* Point Buy Remaining Points */}
        {method === 'point-buy' && (
          <div style={pointsRemainingBoxStyle}>
            <span style={pointsRemainingTextStyle}>
              Points Remaining: {pointBuyRemaining} / {POINT_BUY_MAX_POINTS}
            </span>
          </div>
        )}

        {/* Roll All Button */}
        {method === 'roll' && (
          <button
            style={rollAllBtnStyle}
            onClick={rollAll}
            disabled={isRolling}
          >
            {isRolling ? 'Rolling...' : '🎲 Roll All Stats'}
          </button>
        )}

        {/* Stats Grid */}
        <div style={statsContainerStyle}>
          {(Object.keys(stats) as Array<keyof CharacterStats>).map(key => (
            <StatRow
              key={key}
              name={key}
              label={STAT_NAMES[key]}
              abbrev={STAT_ABBREVS[key]}
              value={stats[key]}
            />
          ))}
        </div>

        {/* Instructions */}
        <div style={instructionsBoxStyle}>
          <span style={instructionsTitleStyle}>
            {method === 'roll' ? 'Roll 4d6 Method' : 'Point Buy System'}
          </span>
          <p style={instructionsTextStyle}>
            {method === 'roll'
              ? 'Each stat is rolled using 4d6, dropping the lowest die. Click 🎲 to reroll individual stats.'
              : `You have ${POINT_BUY_MAX_POINTS} points to spend. Stats cost more as they increase (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9).`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;
