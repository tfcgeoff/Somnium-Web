import { getItem, setItem } from './storageService';

const OWNED_THEMES_KEY = 'owned_themes';

/**
 * Get all owned themes
 * Returns array of theme identifiers that the user has unlocked
 */
export async function getOwnedThemes(): Promise<string[]> {
  try {
    const owned = await getItem(OWNED_THEMES_KEY);
    return owned ? JSON.parse(owned) : [];
  } catch (error) {
    console.error('Failed to get owned themes:', error);
    return [];
  }
}

/**
 * Check if a specific theme is owned
 * @param themeId - The theme identifier (e.g., "Fantasy - High", "Science Fiction - Hard")
 */
export async function isThemeOwned(themeId: string): Promise<boolean> {
  const owned = await getOwnedThemes();
  return owned.includes(themeId);
}

/**
 * Add a theme to owned themes (after watching ad or purchasing)
 * @param themeId - The theme identifier to unlock
 */
export async function unlockTheme(themeId: string): Promise<void> {
  try {
    const owned = await getOwnedThemes();
    if (!owned.includes(themeId)) {
      owned.push(themeId);
      await setItem(OWNED_THEMES_KEY, JSON.stringify(owned));
    }
  } catch (error) {
    console.error('Failed to unlock theme:', error);
    throw error;
  }
}

/**
 * Check if a theme is free (first theme in free categories)
 * @param themeFullId - The full theme identifier (e.g., "Fantasy - Low")
 */
export function isFreeTheme(themeFullId: string): boolean {
  const freeThemes = [
    'Fantasy - Low',
    'Science Fiction - Soft',
    'Present Day - Realistic',
  ];
  return freeThemes.includes(themeFullId);
}

/**
 * Determine if a theme can be used without watching an ad
 * @param themeFullId - The full theme identifier
 */
export async function canUseTheme(themeFullId: string): Promise<boolean> {
  // Free themes are always available
  if (isFreeTheme(themeFullId)) {
    return true;
  }
  // Premium themes require ownership
  return await isThemeOwned(themeFullId);
}
