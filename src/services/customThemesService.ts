/**
 * customThemesService.ts
 *
 * Manages custom genre/theme persistence in local storage.
 * Users can add custom genres which are saved and available across sessions.
 */

const CUSTOM_THEMES_STORAGE_KEY = 'somnium_custom_themes';

export type CustomTheme = {
  name: string;
  createdAt: number;
};

// Helper to get/set storage (web-only)
const getItem = async (key: string): Promise<string | null> => {
  return Promise.resolve(localStorage.getItem(key));
};

const setItem = async (key: string, value: string): Promise<void> => {
  localStorage.setItem(key, value);
  return Promise.resolve();
};

/**
 * Get all custom themes from storage
 */
export async function getCustomThemes(): Promise<CustomTheme[]> {
  try {
    const data = await getItem(CUSTOM_THEMES_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load custom themes:', error);
    return [];
  }
}

/**
 * Get all custom theme names (for use in dropdowns)
 */
export async function getCustomThemeNames(): Promise<string[]> {
  const themes = await getCustomThemes();
  return themes.map(t => t.name);
}

/**
 * Add a new custom theme
 */
export async function addCustomTheme(name: string): Promise<CustomTheme> {
  // Validate name
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Theme name cannot be empty');
  }

  // Check for duplicates (case-insensitive)
  const existingThemes = await getCustomThemes();
  const lowerName = trimmedName.toLowerCase();
  if (existingThemes.some(t => t.name.toLowerCase() === lowerName)) {
    throw new Error('Theme already exists');
  }

  const newTheme: CustomTheme = {
    name: trimmedName,
    createdAt: Date.now(),
  };

  const updatedThemes = [...existingThemes, newTheme];
  await setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updatedThemes));

  return newTheme;
}

/**
 * Remove a custom theme by name
 */
export async function removeCustomTheme(name: string): Promise<void> {
  const themes = await getCustomThemes();
  const filtered = themes.filter(t => t.name !== name);
  await setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Check if a theme is a custom theme
 */
export async function isCustomTheme(themeName: string): Promise<boolean> {
  const themes = await getCustomThemes();
  return themes.some(t => t.name === themeName);
}

/**
 * Get all themes (default + custom) for the picker
 */
export async function getAllThemes(): Promise<string[]> {
  const customNames = await getCustomThemeNames();
  const { DEFAULT_THEMES, CUSTOM_THEME_KEY } = await import('../constants/variables');
  return [...DEFAULT_THEMES, ...customNames, CUSTOM_THEME_KEY];
}
