import { useState } from 'react';
import type { CharacterStats } from '../../constants/types';

interface UseCharacterCreatorProps {
  initialStats?: CharacterStats;
  onStatsChange: (stats: CharacterStats) => void;
}

export type StatAllocationMethod = 'roll' | 'point-buy';

const DEFAULT_STATS: CharacterStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const POINT_BUY_MAX_POINTS = 27;
const POINT_BUY_MIN_STAT = 8;
const POINT_BUY_MAX_STAT = 15;

// Point buy cost table: stat value -> cost
const POINT_BUY_COSTS: { [stat: number]: number } = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

// Roll 4d6, drop lowest
const rollStat = (): number => {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2]; // Sum of top 3
};

// Roll all 6 stats at once
const rollAllStats = (): CharacterStats => ({
  strength: rollStat(),
  dexterity: rollStat(),
  constitution: rollStat(),
  intelligence: rollStat(),
  wisdom: rollStat(),
  charisma: rollStat(),
});

export const useCharacterCreator = ({
  initialStats,
  onStatsChange,
}: UseCharacterCreatorProps) => {
  const [stats, setStats] = useState<CharacterStats>(initialStats || DEFAULT_STATS);
  const [method, setMethod] = useState<StatAllocationMethod>('roll');
  const [pointBuyRemaining, setPointBuyRemaining] = useState(POINT_BUY_MAX_POINTS);
  const [isRolling, setIsRolling] = useState(false);

  const updateStat = (statName: keyof CharacterStats, value: number) => {
    const newStats = { ...stats, [statName]: value };
    setStats(newStats);
    onStatsChange(newStats);
  };

  const rollAll = async () => {
    setIsRolling(true);
    // Simulate rolling animation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const newStats = rollAllStats();
    setStats(newStats);
    onStatsChange(newStats);
    setIsRolling(false);
  };

  const rollSingle = async (statName: keyof CharacterStats) => {
    setIsRolling(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    const value = rollStat();
    updateStat(statName, value);
    setIsRolling(false);
  };

  // Calculate point buy cost for current stats
  const calculatePointBuyCost = (): number => {
    return Object.values(stats).reduce((total, stat) => {
      if (stat < POINT_BUY_MIN_STAT || stat > POINT_BUY_MAX_STAT) {
        return total + 999; // Invalid
      }
      return total + (POINT_BUY_COSTS[stat] || 0);
    }, 0);
  };

  const canIncrementStat = (statName: keyof CharacterStats): boolean => {
    if (method !== 'point-buy') return false;
    if (stats[statName] >= POINT_BUY_MAX_STAT) return false;
    const currentValue = stats[statName];
    const nextValue = currentValue + 1;
    const currentCost = POINT_BUY_COSTS[currentValue] || 0;
    const nextCost = POINT_BUY_COSTS[nextValue] || 0;
    return pointBuyRemaining >= (nextCost - currentCost);
  };

  const canDecrementStat = (statName: keyof CharacterStats): boolean => {
    if (method !== 'point-buy') return false;
    return stats[statName] > POINT_BUY_MIN_STAT;
  };

  const incrementStat = (statName: keyof CharacterStats) => {
    if (!canIncrementStat(statName)) return;
    const currentValue = stats[statName];
    const nextValue = currentValue + 1;
    const currentCost = POINT_BUY_COSTS[currentValue] || 0;
    const nextCost = POINT_BUY_COSTS[nextValue] || 0;
    const cost = nextCost - currentCost;
    setPointBuyRemaining(pointBuyRemaining - cost);
    updateStat(statName, nextValue);
  };

  const decrementStat = (statName: keyof CharacterStats) => {
    if (!canDecrementStat(statName)) return;
    const currentValue = stats[statName];
    const nextValue = currentValue - 1;
    const currentCost = POINT_BUY_COSTS[currentValue] || 0;
    const nextCost = POINT_BUY_COSTS[nextValue] || 0;
    const refund = currentCost - nextCost;
    setPointBuyRemaining(pointBuyRemaining + refund);
    updateStat(statName, nextValue);
  };

  const setMethodAndReset = (newMethod: StatAllocationMethod) => {
    setMethod(newMethod);
    if (newMethod === 'point-buy') {
      setStats(DEFAULT_STATS);
      onStatsChange(DEFAULT_STATS);
      setPointBuyRemaining(POINT_BUY_MAX_POINTS);
    }
  };

  const getModifier = (stat: number): string => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return {
    stats,
    method,
    pointBuyRemaining,
    isRolling,
    setMethod: setMethodAndReset,
    rollAll,
    rollSingle,
    incrementStat,
    decrementStat,
    canIncrementStat,
    canDecrementStat,
    getModifier,
    POINT_BUY_MAX_POINTS,
  };
};
