/**
 * statProgressionService.ts
 *
 * Handles VERY SLOW stat progression for D&D characters.
 * Stats increase based on explicit usage reported by AI during narrative gameplay.
 *
 * Progression Rules:
 * - Proficiency is tracked internally (0-1000+ scale per stat)
 * - AI reports which stats were used each turn via statUsage JSON
 * - Average ~57 turns for first stat point (500 proficiency threshold)
 * - Threshold scales +20% per stat point to prevent late-game inflation
 * - Unused stats slowly decay (0.05 per turn for stats above 50 proficiency)
 * - Stats are capped at min 3, max 20
 */

import type { CharacterStats, StatProgression, StatUsage } from '../constants/types';

// New constants for progression balance (1 stat point/hour target)
const BASE_PROFICIENCY_GAIN = 8;         // +8 guaranteed per use
const BONUS_CHANCE = 0.15;                // 15% chance for bonus
const BONUS_PROFICIENCY = 5;              // +5 bonus on success
// Average: 8 + (0.15 * 5) = 8.75 proficiency per use
// ~57 turns for first stat point (500 proficiency)
const DECAY_PER_TURN = 0.05;             // -0.05 proficiency per turn (very slow)
const DECAY_MIN_THRESHOLD = 50;          // Only decay if above 50 proficiency
const MAX_STAT_VALUE = 20;               // Hard cap on stats
const MIN_STAT_VALUE = 3;                // Hard minimum on stats
const BASE_THRESHOLD = 500;              // Base threshold for first stat point
const THRESHOLD_SCALING = 1.2;           // +20% per stat point

/**
 * Calculate the proficiency threshold needed for the next stat point
 * Threshold increases by 20% each time to prevent inflation
 */
export function getThresholdForNextStat(currentStatValue: number): number {
  // First point: 500, second: 600, third: 720, fourth: 864, etc.
  if (currentStatValue < 10) return BASE_THRESHOLD;
  const pointsAboveBase = currentStatValue - 10;
  return Math.floor(BASE_THRESHOLD * Math.pow(THRESHOLD_SCALING, pointsAboveBase));
}

/**
 * Calculate proficiency percentage toward next stat point
 */
export function getStatProgressionPercent(progression: StatProgression, stat: keyof CharacterStats, currentStatValue: number): number {
  const threshold = getThresholdForNextStat(currentStatValue);
  return Math.min(100, Math.floor((progression[stat] / threshold) * 100));
}

/**
 * Create a new stat progression tracker
 */
export function createStatProgression(): StatProgression {
  return {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
    totalTurns: 0,
    lastProgressionTurn: 0,
  };
}

/**
 * Apply RNG bonus to proficiency gain
 * 15% chance to gain +5 additional proficiency
 */
function applyBonusGain(baseGain: number): number {
  if (Math.random() < BONUS_CHANCE) {
    return baseGain + BONUS_PROFICIENCY;
  }
  return baseGain;
}

/**
 * Process a turn of gameplay using explicit stat usage reported by AI
 * Returns the updated stats, progression, and list of stats that increased
 */
export function processStatProgressionWithUsage(
  currentStats: CharacterStats,
  progression: StatProgression,
  statUsage: StatUsage
): {
  stats: CharacterStats;
  progression: StatProgression;
  changed: boolean;
  statIncreases: string[];
} {
  // Create copies to modify
  const newProgression = { ...progression };
  const newStats = { ...currentStats };
  let changed = false;
  const statIncreases: string[] = [];

  // Increment turn counter
  newProgression.totalTurns++;

  // Track which stats were used this turn
  const usedStats = new Set<keyof CharacterStats>();

  // Apply proficiency gains for reported usage
  for (const [stat, count] of Object.entries(statUsage) as Array<[keyof CharacterStats, number]>) {
    if (count > 0) {
      usedStats.add(stat);
      // Base gain + RNG bonus, multiplied by usage count (capped at 3 per turn)
      const cappedCount = Math.min(count, 3);
      const totalGain = cappedCount * applyBonusGain(BASE_PROFICIENCY_GAIN);
      newProgression[stat] += totalGain;
    }
  }

  // Apply decay to stats that weren't used this turn
  for (const stat of Object.keys(currentStats) as Array<keyof CharacterStats>) {
    if (!usedStats.has(stat) && newProgression[stat] > DECAY_MIN_THRESHOLD) {
      newProgression[stat] = Math.max(0, newProgression[stat] - DECAY_PER_TURN);
    }
  }

  // Check for stat increases
  for (const stat of Object.keys(currentStats) as Array<keyof CharacterStats>) {
    const threshold = getThresholdForNextStat(newStats[stat]);

    // Check if we have enough proficiency to increase
    while (newProgression[stat] >= threshold && newStats[stat] < MAX_STAT_VALUE) {
      newProgression[stat] -= threshold;
      newStats[stat]++;
      changed = true;
      newProgression.lastProgressionTurn = newProgression.totalTurns;
      statIncreases.push(stat);
    }
  }

  return {
    stats: newStats,
    progression: newProgression,
    changed,
    statIncreases,
  };
}

/**
 * Legacy function - analyze narrative text to detect which stats were used
 * Kept for backward compatibility, but prefer processStatProgressionWithUsage
 *
 * NOTE: This keyword-based approach is unreliable.
 * Use processStatProgressionWithUsage with AI-reported statUsage instead.
 */
export function processStatProgression(
  currentStats: CharacterStats,
  progression: StatProgression,
  userMessage: string,
  aiResponse: string
): { stats: CharacterStats; progression: StatProgression; changed: boolean } {
  // Keywords that indicate stat usage in narrative text
  const STAT_KEYWORDS = {
    strength: [
      'lift', 'carry', 'push', 'pull', 'break', 'smash', 'crush', 'force', 'power',
      'muscle', 'strong', 'athletic', 'grapple', 'wrestle', 'punch', 'kick', 'leap',
      'climb', 'jump', 'swim', 'struggle', 'exert', 'haul', 'heave', 'shove'
    ],
    dexterity: [
      'dodge', 'sneak', 'stealth', 'hide', 'pick', 'lock', 'trap', 'catch',
      'throw', 'aim', 'shoot', 'balance', 'tumble', 'acrobatic', 'agile', 'quick',
      'reflex', 'react', 'deflect', 'parry', 'sleight', 'pickpocket', 'disarm'
    ],
    constitution: [
      'endure', 'resist', 'survive', 'stamina', 'tough', 'fortitude', 'poison',
      'disease', 'exhaustion', 'fatigue', 'weather', 'hold breath', 'starve',
      'thirst', 'pain', 'injury', 'wound', 'heal', 'recover', 'withstand'
    ],
    intelligence: [
      'analyze', 'deduce', 'investigate', 'research', 'study', 'learn', 'recall',
      'memory', 'knowledge', 'history', 'arcana', 'puzzle', 'riddle', 'logic',
      'calculate', 'figure', 'understand', 'comprehend', 'decipher', 'identify'
    ],
    wisdom: [
      'perceive', 'notice', 'observe', 'insight', 'sense', 'intuition', 'wisdom',
      'medic', 'heal', 'nature', 'survival', 'animal', 'insight', 'read emotions',
      'predict', 'foresight', 'aware', 'alert', 'listen', 'smell', 'taste'
    ],
    charisma: [
      'persuade', 'convince', 'charm', 'intimidate', 'deceive', 'bluff', 'negotiate',
      'barter', 'trade', 'lead', 'inspire', 'perform', 'act', 'sing', 'speech',
      'diplomacy', 'gather information', 'friend', 'influence', 'command'
    ]
  };

  function detectStatUsage(text: string): Partial<Record<keyof CharacterStats, number>> {
    const lowerText = text.toLowerCase();
    const usage: Partial<Record<keyof CharacterStats, number>> = {};

    for (const [stat, keywords] of Object.entries(STAT_KEYWORDS) as Array<[keyof CharacterStats, string[]]>) {
      let count = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          count += matches.length;
        }
      }
      if (count > 0) {
        usage[stat] = Math.min(count, 5);
      }
    }

    return usage;
  }

  // Create copies to modify
  const newProgression = { ...progression };
  const newStats = { ...currentStats };
  let changed = false;

  // Increment turn counter
  newProgression.totalTurns++;

  // Analyze both user message and AI response for stat usage
  const combinedText = `${userMessage} ${aiResponse}`;
  const detectedUsage = detectStatUsage(combinedText);

  // Convert detected usage to StatUsage format
  const statUsage: StatUsage = {
    strength: detectedUsage.strength || 0,
    dexterity: detectedUsage.dexterity || 0,
    constitution: detectedUsage.constitution || 0,
    intelligence: detectedUsage.intelligence || 0,
    wisdom: detectedUsage.wisdom || 0,
    charisma: detectedUsage.charisma || 0,
  };

  // Use the new logic
  const result = processStatProgressionWithUsage(newStats, newProgression, statUsage);
  return {
    stats: result.stats,
    progression: result.progression,
    changed: result.changed,
  };
}

/**
 * Get turns until next stat point (estimated based on current proficiency)
 */
export function getTurnsUntilNextPoint(progression: StatProgression, stat: keyof CharacterStats, currentStatValue: number): number {
  const threshold = getThresholdForNextStat(currentStatValue);
  const remaining = threshold - progression[stat];
  return Math.ceil(remaining / BASE_PROFICIENCY_GAIN); // Assuming 1 use per turn
}
