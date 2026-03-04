import { PROXY_SERVER_URL } from '../constants/variables';

const USER_ID_KEY = 'dream_catcher_user_id';

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback UUID generation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a persistent user ID on web
 *
 * @returns Promise<string> The persistent user ID
 */
export async function getUserId(): Promise<string> {
  try {
    const existingId = localStorage.getItem(USER_ID_KEY);
    if (existingId) {
      logUserIdToServer(existingId, false);
      return existingId;
    }

    // Generate new ID and store it
    const newId = generateUUID();
    localStorage.setItem(USER_ID_KEY, newId);
    logUserIdToServer(newId, true);
    return newId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback: generate a temporary UUID
    return generateUUID();
  }
}

/**
 * Logs user ID to console
 */
async function logUserIdToServer(userId: string, isNew: boolean): Promise<void> {
  // Log to client console
  console.log(`[User ID] ${isNew ? 'NEW' : 'EXISTING'}: ${userId}`);
}

/**
 * Clears the stored user ID (for testing/reset purposes)
 */
export async function clearUserId(): Promise<void> {
  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error clearing user ID:', error);
  }
}
