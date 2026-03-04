import { getItem, setItem } from './storageService';

const RANDOMIZE_USES_KEY = 'randomize_uses';
const MAX_FREE_RANDOMIZES = 5;

interface RandomizeUses {
  [storyId: string]: number; // storyId -> remaining free randomizes
}

/**
 * Get remaining randomize uses for a story
 * @param storyId - The autosave ID of the story
 */
export async function getRandomizeUses(storyId: string): Promise<number> {
  try {
    const uses = await getItem(RANDOMIZE_USES_KEY);
    const allUses: RandomizeUses = uses ? JSON.parse(uses) : {};
    return allUses[storyId] ?? MAX_FREE_RANDOMIZES;
  } catch (error) {
    console.error('Failed to get randomize uses:', error);
    return MAX_FREE_RANDOMIZES;
  }
}

/**
 * Check if randomize is available (has remaining uses)
 * @param storyId - The autosave ID of the story
 */
export async function canRandomize(storyId: string): Promise<boolean> {
  const remaining = await getRandomizeUses(storyId);
  return remaining > 0;
}

/**
 * Use a randomize (decrement counter)
 * @param storyId - The autosave ID of the story
 */
export async function useRandomize(storyId: string): Promise<void> {
  try {
    const uses = await getItem(RANDOMIZE_USES_KEY);
    const allUses: RandomizeUses = uses ? JSON.parse(uses) : {};
    const current = allUses[storyId] ?? MAX_FREE_RANDOMIZES;

    if (current > 0) {
      allUses[storyId] = current - 1;
      await setItem(RANDOMIZE_USES_KEY, JSON.stringify(allUses));
    }
  } catch (error) {
    console.error('Failed to use randomize:', error);
    throw error;
  }
}

/**
 * Reset randomize uses for a story (for testing or after watching ad)
 * @param storyId - The autosave ID of the story
 * @param count - Optional count to set (defaults to MAX_FREE_RANDOMIZES)
 */
export async function resetRandomizeUses(storyId: string, count?: number): Promise<void> {
  try {
    const uses = await getItem(RANDOMIZE_USES_KEY);
    const allUses: RandomizeUses = uses ? JSON.parse(uses) : {};
    allUses[storyId] = count ?? MAX_FREE_RANDOMIZES;
    await setItem(RANDOMIZE_USES_KEY, JSON.stringify(allUses));
  } catch (error) {
    console.error('Failed to reset randomize uses:', error);
    throw error;
  }
}

/**
 * Add randomize uses (for rewarding user or after watching ad)
 * @param storyId - The autosave ID of the story
 * @param amount - Number of uses to add
 */
export async function addRandomizeUses(storyId: string, amount: number): Promise<void> {
  try {
    const uses = await getItem(RANDOMIZE_USES_KEY);
    const allUses: RandomizeUses = uses ? JSON.parse(uses) : {};
    const current = allUses[storyId] ?? MAX_FREE_RANDOMIZES;
    allUses[storyId] = Math.min(MAX_FREE_RANDOMIZES, current + amount);
    await setItem(RANDOMIZE_USES_KEY, JSON.stringify(allUses));
  } catch (error) {
    console.error('Failed to add randomize uses:', error);
    throw error;
  }
}

/**
 * Check if we're in a story context (has storyId)
 * For setup wizard, we don't have a storyId yet, so we use 'setup' as a special key
 */
export function getSetupWizardId(): string {
  return 'setup';
}
