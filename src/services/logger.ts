import { DEBUG } from '../constants/variables';
import type { GameState } from '../constants/types';

// Server endpoint for error logging
const LOGGING_ENDPOINT = 'http://localhost:3001/api/logs';

interface ErrorContext {
  gameState?: {
    name: string;
    mode: string;
    historyLength: number;
    turns: number;
  };
  userAction?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Logging utility that can be disabled in production
 * Logs are only output when DEBUG mode is enabled
 * Errors are sent to server endpoint for tracking
 */
const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) {
      console.log('[Somnium]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (DEBUG) {
      console.warn('[Somnium]', ...args);
    }
    // Always log warnings in production for debugging
    if (!DEBUG) {
      console.warn(...args);
    }
  },

  error: (message: string, error?: unknown, context?: ErrorContext) => {
    // Always log errors to console
    console.error('[Somnium]', message, error, context);

    // Send error to server for tracking (only in production or if DEBUG is enabled with server)
    if (!DEBUG || DEBUG) {
      void sendToServer('error', message, error, context);
    }
  },

  info: (...args: unknown[]) => {
    if (DEBUG) {
      console.info('[Somnium]', ...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (DEBUG) {
      console.debug('[Somnium]', ...args);
    }
  },

  /**
   * Log an error with game state context
   */
  logGameStateError: (
    message: string,
    error: unknown,
    gameState?: GameState,
    userAction?: string
  ) => {
    const context: ErrorContext = {
      userAction,
    };

    if (gameState) {
      context.gameState = {
        name: gameState.name,
        mode: gameState.mode,
        historyLength: gameState.history.length,
        turns: gameState.history.length,
      };
    }

    logger.error(message, error, context);
  },

  /**
   * Log a user action with context
   */
  logAction: (action: string, data?: Record<string, unknown>) => {
    if (DEBUG) {
      console.log('[Somnium] Action:', action, data);
    }
    // Send important actions to server
    void sendToServer('info', action, undefined, { additionalData: data });
  },
};

/**
 * Send log to server endpoint
 */
async function sendToServer(
  level: 'error' | 'info' | 'warn',
  message: string,
  error?: unknown,
  context?: ErrorContext
): Promise<void> {
  try {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      context,
    };

    await fetch(LOGGING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(err => {
      // Silent fail for server logging errors to prevent infinite loops
      // Only log in debug mode
      if (DEBUG) {
        console.warn('[Somnium] Failed to send log to server:', err);
      }
    });
  } catch (err) {
    // Silent fail
  }
}

export default logger;
