// services/storageService.ts
import type { GameState } from '../constants/types';

// Helper to get localStorage
export const getItem = async (key: string): Promise<string | null> => {
  return Promise.resolve(localStorage.getItem(key));
};

export const setItem = async (key: string, value: string): Promise<void> => {
  localStorage.setItem(key, value);
  return Promise.resolve();
};

export const removeItem = async (key: string): Promise<void> => {
  localStorage.removeItem(key);
  return Promise.resolve();
};

const GAME_FILE_EXTENSION = '.dream';
const AUTOSAVE_LIST_KEY = 'dream_catcher_autosaves_list';

export async function saveImageToLocal(
  imageDataOrUrl: string,
  filename = `somnium_image_${Date.now()}.png`
): Promise<string> {
  try {
    if (imageDataOrUrl.startsWith('data:') || imageDataOrUrl.includes('/9j/')) {
      // Base64 data: on web, we can't directly save to local filesystem without user interaction.
      // We'll return a blob URL if possible, otherwise throw an error.
      const base64 = imageDataOrUrl.split(',')[1] || imageDataOrUrl;
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' }); // Assuming PNG for base64
      const url = URL.createObjectURL(blob);
      return url;
    } else if (imageDataOrUrl.startsWith('http')) {
      // URL - just return it as it's already accessible
      return imageDataOrUrl;
    } else {
      throw new Error('Invalid image format');
    }
  } catch (error) {
    console.error('Image save failed:', error);
    throw error;
  }
}

export const importGameState = async (): Promise<GameState | null> => {
  try {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = GAME_FILE_EXTENSION;
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const importedState = JSON.parse(e.target?.result as string);
            resolve(importedState as GameState);
          } catch (err) {
            console.error('Failed to parse save file', err);
            window.alert('Error', 'Failed to parse save file. It might be corrupted.');
            reject(err);
          }
        };
        reader.onerror = err => {
          console.error('File reader error', err);
          window.alert('Error', 'Failed to read file.');
          reject(err);
        };
        reader.readAsText(file);
      };
      input.click();
    });
  } catch (error) {
    console.error('Error importing game state:', error);
    window.alert('Error', 'Could not import game state.');
    return null;
  }
};

export const exportGameState = async (
  gameState: GameState,
  format: 'json' | 'markdown'
): Promise<void> => {
  try {
    let content = '';
    let fileName = `${gameState.name.replace(/\s+/g, '_')}`;
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(gameState, null, 2);
      fileName += GAME_FILE_EXTENSION;
      mimeType = 'application/json';
    } else {
      // Build improved markdown content
      const characterName = gameState.characterName;
      const dreamName = 'Dream';

      // Title and metadata
      content += `# ${gameState.name}\n\n`;
      content += `**Character:** ${characterName}\n`;
      content += `**Theme:** ${gameState.theme}\n`;
      content += `**Mode:** ${gameState.mode}\n`;

      // Add playtime if sessionMinutes is tracked (would need to be passed in)
      // content += `**Play Time:** ${formatTime(sessionMinutes)}\n`;

      content += `\n---\n\n`;

      // Build story content with proper formatting
      gameState.history.forEach((m, index) => {
        const roleName = m.role === 'user' ? characterName : dreamName;

        // Add turn number for user actions
        if (m.role === 'user') {
          content += `## Turn ${Math.ceil(index / 2) + 1}\n\n`;
        }

        // Add character action if present
        if (m.characterAction) {
          content += `*${m.characterAction}*\n\n`;
        }

        // Add main content with proper paragraph spacing
        // Split by double newlines to preserve paragraph structure
        const paragraphs = m.content.split('\n\n');
        content += `**${roleName}:**\n\n`;

        paragraphs.forEach(para => {
          const trimmed = para.trim();
          if (trimmed) {
            content += `${trimmed}\n\n`;
          }
        });

        // Add image reference if present
        if (m.imageUrl) {
          content += `*[Scene Image](${m.imageUrl})*\n\n`;
        }

        // Add spacing between messages
        content += `---\n\n`;
      });

      fileName += '.md';
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting game state:', error);
    window.alert('Error', 'Could not export game state.');
  }
};

export interface AutosaveMetadata {
  id: string;
  name: string;
  characterName: string;
  timestamp: number;
  turns: number;
  sessionMinutes: number;
  mode: string;
  characterSlotId?: string; // Link to character slot if this is a DND game
  theme?: string; // Story theme for this save
}

export const saveAutosave = async (
  gameState: GameState,
  sessionMinutes: number = 0
): Promise<void> => {
  try {
    const autosaveId = gameState.id; // Use game state ID as autosave ID
    const autosaveKey = `dream_catcher_autosave_${autosaveId}`;
    await setItem(autosaveKey, JSON.stringify(gameState));

    // Update master list of autosaves
    const listJson = await getItem(AUTOSAVE_LIST_KEY);
    let autosaves: AutosaveMetadata[] = listJson ? JSON.parse(listJson) : [];

    const newMetadata: AutosaveMetadata = {
      id: gameState.id,
      name: gameState.name,
      characterName: gameState.characterName,
      timestamp: Date.now(),
      turns: gameState.history.length,
      sessionMinutes: sessionMinutes,
      mode: gameState.mode,
      characterSlotId: gameState.characterSlotId,
      theme: gameState.theme,
    };

    const existingIndex = autosaves.findIndex(as => as.id === autosaveId);
    if (existingIndex > -1) {
      // Preserve sessionMinutes from existing entry if not provided
      const existingSessionMinutes = autosaves[existingIndex].sessionMinutes || 0;
      newMetadata.sessionMinutes = sessionMinutes > 0 ? sessionMinutes : existingSessionMinutes;
      autosaves[existingIndex] = newMetadata; // Update existing entry
    } else {
      autosaves.push(newMetadata); // Add new entry
    }
    await setItem(AUTOSAVE_LIST_KEY, JSON.stringify(autosaves));
  } catch (error) {
    console.error('Failed to save autosave:', error);
  }
};

export const loadAutosave = async (id: string): Promise<GameState | null> => {
  try {
    const autosaveKey = `dream_catcher_autosave_${id}`;
    const gameStateJson = await getItem(autosaveKey);
    return gameStateJson ? JSON.parse(gameStateJson) : null;
  } catch (error) {
    console.error('Failed to load autosave:', error);
    return null;
  }
};

export const listAutosaves = async (): Promise<AutosaveMetadata[]> => {
  try {
    const listJson = await getItem(AUTOSAVE_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Failed to list autosaves:', error);
    return [];
  }
};

export const deleteAutosave = async (id: string): Promise<void> => {
  try {
    // Remove the game state itself
    const autosaveKey = `dream_catcher_autosave_${id}`;
    await removeItem(autosaveKey);

    // Update master list
    const listJson = await getItem(AUTOSAVE_LIST_KEY);
    console.log("Autosave list JSON:", listJson);
    let autosaves: AutosaveMetadata[] = listJson ? JSON.parse(listJson) : [];
    autosaves = autosaves.filter(as => as.id !== id);
    await setItem(AUTOSAVE_LIST_KEY, JSON.stringify(autosaves));
  } catch (error) {
    console.error('Failed to delete autosave:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Get the active autosave for a specific character slot
 * Returns the autosave if found, null otherwise
 */
export const getAutosaveForCharacterSlot = async (characterSlotId: string): Promise<AutosaveMetadata | null> => {
  try {
    const autosaves = await listAutosaves();
    return autosaves.find(as => as.characterSlotId === characterSlotId) || null;
  } catch (error) {
    console.error('Failed to get autosave for character slot:', error);
    return null;
  }
};
