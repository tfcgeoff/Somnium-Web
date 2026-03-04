import type { CharacterSlot, CharacterStats, StatProgression } from '../constants/types';
import { getItem, setItem, removeItem } from './storageService';

const CHARACTER_SLOTS_KEY = 'somnium_character_slots';
const ENCRYPTION_KEY = 'somnium_encryption_key'; // In production, use proper key management

// Simple XOR encryption for demo purposes (not secure for production)
// For production, use crypto-js
function encrypt(data: string): string {
  const key = 'Somnium2025'; // Simple key
  return btoa(
    data
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join('')
  );
}

function decrypt(data: string): string {
  const key = 'Somnium2025';
  const decoded = atob(data);
  return decoded
    .split('')
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

export async function listCharacterSlots(): Promise<CharacterSlot[]> {
  try {
    const data = await getItem(CHARACTER_SLOTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to list character slots:', error);
    return [];
  }
}

export async function saveCharacterSlot(slot: CharacterSlot): Promise<void> {
  try {
    const slots = await listCharacterSlots();
    const existingIndex = slots.findIndex(s => s.id === slot.id);

    if (existingIndex >= 0) {
      slots[existingIndex] = slot;
    } else {
      slots.push(slot);
    }

    await setItem(CHARACTER_SLOTS_KEY, JSON.stringify(slots));
  } catch (error) {
    console.error('Failed to save character slot:', error);
    throw error;
  }
}

export async function loadCharacterSlot(id: string): Promise<CharacterSlot | null> {
  try {
    const slots = await listCharacterSlots();
    return slots.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Failed to load character slot:', error);
    return null;
  }
}

export async function deleteCharacterSlot(id: string): Promise<void> {
  try {
    const slots = await listCharacterSlots();
    const filtered = slots.filter(s => s.id !== id);
    await setItem(CHARACTER_SLOTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete character slot:', error);
    throw error;
  }
}

export async function exportCharacterSlot(slot: CharacterSlot): Promise<string> {
  try {
    const data = JSON.stringify(slot);
    const encrypted = encrypt(data);
    return btoa(encrypted); // Double encode for safe transport
  } catch (error) {
    console.error('Failed to export character slot:', error);
    throw error;
  }
}

export async function importCharacterSlot(encryptedData: string): Promise<CharacterSlot | null> {
  try {
    const decoded = atob(encryptedData);
    const decrypted = decrypt(decoded);
    const slot = JSON.parse(decrypted) as CharacterSlot;

    // Validate slot structure
    if (
      !slot.id ||
      !slot.name ||
      !slot.characterName ||
      !slot.stats ||
      typeof slot.createdAt !== 'number'
    ) {
      throw new Error('Invalid character slot data');
    }

    // Save to storage
    await saveCharacterSlot(slot);
    return slot;
  } catch (error) {
    console.error('Failed to import character slot:', error);
    return null;
  }
}

// File-based export/import for encrypted character slots
const CHARACTER_FILE_EXTENSION = '.char';

/**
 * Export character slot to an encrypted file
 * Creates a downloadable file with encrypted character data
 */
export async function exportCharacterSlotToFile(slot: CharacterSlot): Promise<void> {
  try {
    const data = JSON.stringify(slot, null, 2);
    const encrypted = encrypt(data);
    const content = btoa(encrypted); // Double encode for safe transport

    const fileName = `${slot.characterName.replace(/\s+/g, '_')}${CHARACTER_FILE_EXTENSION}`;
    const mimeType = 'application/octet-stream';

    // Web: Create downloadable file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export character slot to file:', error);
    window.alert('Export Failed', 'Could not export character file.');
    throw error;
  }
}

/**
 * Import character slot from an encrypted file
 * Prompts user to select a .char file and imports it
 */
export async function importCharacterSlotFromFile(): Promise<CharacterSlot | null> {
  try {
    // Web: Use file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = CHARACTER_FILE_EXTENSION;
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const fileContent = e.target?.result as string;
            const decoded = atob(fileContent);
            const decrypted = decrypt(decoded);
            const slot = JSON.parse(decrypted) as CharacterSlot;

            // Validate slot structure
            if (
              !slot.id ||
              !slot.name ||
              !slot.characterName ||
              !slot.stats ||
              typeof slot.createdAt !== 'number'
            ) {
              throw new Error('Invalid character slot data');
            }

            // Save to storage
            saveCharacterSlot(slot).then(() => resolve(slot));
          } catch (err) {
            console.error('Failed to parse character file', err);
            window.alert('Import Failed', 'The character file is corrupted or invalid.');
            resolve(null);
          }
        };
        reader.onerror = () => {
          window.alert('Import Failed', 'Could not read the file.');
          resolve(null);
        };
        reader.readAsText(file);
      };
      input.click();
    });
  } catch (error) {
    console.error('Failed to import character slot from file:', error);
    window.alert('Import Failed', 'Could not import character file.');
    return null;
  }
}

export async function createCharacterSlotFromGame(
  id: string,
  name: string,
  characterName: string,
  characterDesc: string,
  stats: CharacterStats,
  adventureStyles: string[],
  existingSlotId?: string,
  statProgression?: StatProgression
): Promise<CharacterSlot> {
  const now = Date.now();

  if (existingSlotId) {
    // Update existing slot
    const existing = await loadCharacterSlot(existingSlotId);
    if (existing) {
      const updated: CharacterSlot = {
        ...existing,
        name,
        characterName,
        characterDesc,
        stats,
        statProgression: statProgression || existing.statProgression,
        lastPlayedAt: now,
        adventureStyles: mergeAdventureStyles(existing.adventureStyles, adventureStyles),
      };
      await saveCharacterSlot(updated);
      return updated;
    }
  }

  // Create new slot
  const newSlot: CharacterSlot = {
    id,
    name,
    characterName,
    characterDesc,
    stats,
    statProgression,
    createdAt: now,
    lastPlayedAt: now,
    totalPlaytimeMs: 0,
    adventureStyles,
    level: 1,
    xp: 0,
  };

  await saveCharacterSlot(newSlot);
  return newSlot;
}

function mergeAdventureStyles(existing: string[], newStyles: string[]): string[] {
  const merged = [...existing];
  for (const style of newStyles) {
    if (!merged.includes(style)) {
      merged.push(style);
    }
  }
  return merged;
}

export async function updateCharacterProgression(
  slotId: string,
  playtimeMs: number,
  adventureStyle?: string
): Promise<void> {
  const slot = await loadCharacterSlot(slotId);
  if (!slot) return;

  slot.totalPlaytimeMs += playtimeMs;
  slot.lastPlayedAt = Date.now();

  if (adventureStyle && !slot.adventureStyles.includes(adventureStyle)) {
    slot.adventureStyles.push(adventureStyle);
  }

  // Simple XP and level system
  // 1 XP per minute of playtime
  const minutesPlayed = Math.floor(playtimeMs / 60000);
  slot.xp += minutesPlayed;

  // Level up every 60 XP (1 hour of play)
  const newLevel = Math.floor(slot.xp / 60) + 1;
  if (newLevel > slot.level) {
    slot.level = newLevel;
    // Could add stat increases on level up here
  }

  await saveCharacterSlot(slot);
}

/**
 * Update character stats and progression in a slot
 * Called when stats change during gameplay
 */
export async function updateCharacterStats(
  slotId: string,
  newStats: CharacterStats,
  newProgression: StatProgression
): Promise<void> {
  const slot = await loadCharacterSlot(slotId);
  if (!slot) return;

  slot.stats = newStats;
  slot.statProgression = newProgression;
  slot.lastPlayedAt = Date.now();

  await saveCharacterSlot(slot);
}
