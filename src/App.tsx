/**
 * @platform web
 */
import React, { useState, useEffect, useRef } from 'react';
import SetupWizard from './components/UI/Web/SetupWizard.web';
import NarrativeUI from './components/UI/Web/NarrativeUI.web';
import SettingsMenu from './components/UI/Web/SettingsMenu.web';
import CharacterCreator from './components/UI/CharacterCreator';
import ImageGenerationModal from './components/UI/ImageGenerationModal';
import ErrorModal from './components/UI/ErrorModal';
import DropdownFix from './components/UI/Web/Helpers/DropdownFix.web';
import IntroScreen from './components/UI/IntroScreen';
import { ThemeProvider, useTheme } from './services/ThemeContext';
import { SettingsProvider, useSettings } from './services/SettingsContext';
import { FontProvider } from './services/FontProvider';
import { AchievementsProvider, useAchievements } from './services/AchievementsContext';
import type { GameState, Message, AIHistoryMessage, CharacterStats, StatProgression } from './constants/types';
import { GameMode } from './constants/types';
import { appStyles, commonStyles } from './constants/styles';
import { fetchAIResponse, generateSceneImage, summarizeConversation, sanitizeCharacterDescription } from './services/aiService';
import { INITIAL_PROMPT, DEBUG } from './constants/variables';
import logger from './services/logger';
import {
  importGameState,
  exportGameState,
  saveAutosave,
  loadAutosave,
  listAutosaves,
  deleteAutosave,
} from './services/storageService';
import { updateCharacterProgression, createCharacterSlotFromGame, updateCharacterStats } from './services/characterSlotService';
import { createStatProgression, processStatProgression, processStatProgressionWithUsage } from './services/statProgressionService';
import { getUserId } from './services/userIdService';

function AppContent() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // Show intro screen on first load
  const [showImageModal, setShowImageModal] = useState(false); // Image generation modal state
  const [imageGenUnlockedByAd, setImageGenUnlockedByAd] = useState(false); // Track if unlocked by watching an ad
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pendingGameState, setPendingGameState] = useState<Partial<GameState> | null>(null); // Holds config before character creation
  const [characterStats, setCharacterStats] = useState<CharacterStats | undefined>(undefined);
  const [statProgression, setStatProgression] = useState<StatProgression | undefined>(undefined);

  // Animation for SetupWizard slide-up - starts from near bottom (button position) instead of full height
  const [setupWizardSlideIn, setSetupWizardSlideIn] = useState(false);

  // Start slide-up animation when SetupWizard appears (after intro is dismissed)
  useEffect(() => {
    if (!showIntro && !gameState) {
      const timer = setTimeout(() => {
        setSetupWizardSlideIn(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSetupWizardSlideIn(false);
    }
  }, [showIntro, gameState]);

  // Error modal state
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  // Helper function to show errors
  const showError = (title: string, message: string) => {
    setErrorModal({ visible: true, title, message });
  };

  // Session time tracking for playtime calculations (autosave timestamps, D&D progression)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track session time when game is active
  useEffect(() => {
    if (gameState?.status === 'playing') {
      // Start timer - increment every second
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    } else {
      // Reset session time when game is not active
      setSessionSeconds(0);
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
  }, [gameState?.id, gameState?.status]);

  const { currentTheme: colors } = useTheme();
  const { allApiKeys, selectedImageProvider, narrativeSettings } = useSettings();
  const {
    recordTurn,
    recordStoryCompleted,
    recordWordsWritten,
    setGameActive,
  } = useAchievements();

  // Track achievements playtime when game is active
  useEffect(() => {
    if (gameState?.status === 'playing') {
      setGameActive(true);
      return () => {
        setGameActive(false);
      };
    }
  }, [gameState?.id, gameState?.status, setGameActive]);

  // Initialize persistent user ID on app mount
  useEffect(() => {
    getUserId().then((id) => {
      console.log('User ID initialized:', id);
    }).catch((err) => {
      console.error('Failed to initialize user ID:', err);
    });
  }, []);

  // Centralized AI call handler
  const getAI = async (state: GameState, history: AIHistoryMessage[]) => {
    // Create optimized history for AI: if we have a summary, only send recent messages
    // Otherwise send full history
    const optimizedHistory = state.summary
      ? history.slice(-narrativeSettings.summarizeAfterTurns)  // Keep only recent N messages
      : history;

    return await fetchAIResponse(
      state.mode as GameMode,
      state.theme,
      `${state.characterName}: ${state.characterDesc}`,
      state.directives,
      state.negativeDirectives,
      optimizedHistory,
      narrativeSettings,
      state.summary,
      state.characterStats
    );
  };

      const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback: timestamp + random string
      return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    };

  const handleStartGame = async (initialState: GameState) => {
    // Reset sidebar when starting new game
    setSidebarVisible(false);

    // Generate ID first - use fallback for browsers that don't support crypto.randomUUID

    const newGameId = initialState.id || generateId();
    let stateWithId = { ...initialState, id: newGameId, history: [], turnNumber: 0 };

    // Sanitize character description to PG-13 standards FIRST (before any other operations)
    // This ensures the sanitized version is used everywhere, not the original
    const sanitizedDesc = await sanitizeCharacterDescription(initialState.characterDesc);
    stateWithId = { ...stateWithId, characterDesc: sanitizedDesc };

    // Use default directives from settings if none provided
    if (!stateWithId.directives && narrativeSettings.defaultDirectives) {
      stateWithId = { ...stateWithId, directives: narrativeSettings.defaultDirectives };
    }

    // Initialize empty inventory for D&D mode
    if (stateWithId.mode === GameMode.DND && !stateWithId.inventory) {
      stateWithId = { ...stateWithId, inventory: [] };
    }

    // For D&D mode with stats but no slot, create a character slot
    if (stateWithId.mode === GameMode.DND && stateWithId.characterStats && !stateWithId.characterSlotId) {
      const characterSlotId = `char_${newGameId}`;
      // Create new stat progression
      const newStatProgression = createStatProgression();
      const characterSlot = await createCharacterSlotFromGame(
        characterSlotId,
        stateWithId.name,
        stateWithId.characterName,
        stateWithId.characterDesc, // Now uses sanitized description
        stateWithId.characterStats,
        [stateWithId.theme], // Initial adventure style
        undefined,
        newStatProgression
      );
      stateWithId = { ...stateWithId, characterSlotId: characterSlot.id, statProgression: newStatProgression };
    }

    // For D&D mode without stats, show character creator first
    if (stateWithId.mode === GameMode.DND && !stateWithId.characterStats) {
      setPendingGameState(stateWithId);
      setCharacterStats(undefined);
      setStatProgression(undefined);
      return;
    }

    // Generate character image seed for consistency (using sanitized description)
    const characterImageSeed = `${stateWithId.characterName}-${sanitizedDesc}`.substring(0, 64);
    stateWithId = { ...stateWithId, characterImageSeed };

    // For non-D&D modes or when stats are already set, start the game
    setGameState(stateWithId);
    setIsLoading(true);

    try {
      let startPromptText = INITIAL_PROMPT(initialState.mode, sanitizedDesc, initialState.theme);

      const formattedHistory: AIHistoryMessage[] = [
        {
          role: 'user',
          parts: [{ text: startPromptText }],
        },
      ];

      const aiRes = await getAI(stateWithId, formattedHistory);

      const firstMsg: Message = {
        id: generateId(),
        role: 'model',
        content: aiRes.storyText,
        characterAction: aiRes.characterAction,
        suggestedActions: aiRes.suggestedActions,
        timestamp: Date.now(),
        parts: [{ text: JSON.stringify(aiRes) }],
        tokenUsage: aiRes.tokenUsage,
        provider: aiRes.provider, // Assign provider to message
      };

      logger.debug('Provider:', firstMsg.provider);

      setGameState(prev => {
        if (!prev) return null;
        const updatedState = {
          ...prev,
          history: [firstMsg],
          provider: aiRes.provider,
          ...(aiRes.inventory && { inventory: aiRes.inventory }),
        };
        saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
        return updatedState;
      });
      setPendingGameState(null);
      setCharacterStats(undefined);
    } catch (error) {
      logger.logGameStateError('Failed to start game', error, stateWithId, 'handleStartGame');
      showError('Error', 'Could not connect to the dream realm.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterStatsChange = (stats: CharacterStats) => {
    setCharacterStats(stats);
  };

  const handleConfirmCharacterStats = async () => {
    if (!pendingGameState || !characterStats) return;

    const newGameId = generateId();
    const characterSlotId = `char_${newGameId}`;

    // Create new stat progression for this character
    const newStatProgression = createStatProgression();

    const characterSlot = await createCharacterSlotFromGame(
      characterSlotId,
      pendingGameState.name || 'Unnamed Adventure',
      pendingGameState.characterName || 'Unknown Hero',
      pendingGameState.characterDesc || 'A mysterious adventurer',
      characterStats,
      [pendingGameState.theme || 'Fantasy'], // Initial adventure style
      undefined, // No existing slot (new character)
      newStatProgression // Include stat progression
    );

    const stateWithStats: GameState = {
      ...pendingGameState,
      id: newGameId,
      characterStats,
      characterSlotId: characterSlot.id,
      statProgression: newStatProgression,
      history: [],
      status: 'setup',
    } as GameState;

    handleStartGame(stateWithStats);
  };

  const handleBackToSetup = () => {
    setPendingGameState(null);
    setCharacterStats(undefined);
    setStatProgression(undefined);
  };

  const handleSendMessage = async (
    text: string,
    isSilent: boolean = false,
    overrideHistory?: Message[]
  ) => {
    if (!gameState || isLoading) return;
    const intentDirection = text?.trim() || 'Continue the scene.';
    setIsLoading(true);

    let currentHistory = overrideHistory || gameState.history;

    const newUserMessageContent = intentDirection; // Keep original for display

    // Add new user message to the full history (with original content for display)
    if (!isSilent) {
      currentHistory = [
        ...currentHistory,
        {
          id: generateId(),
          role: 'user',
          content: newUserMessageContent,
          timestamp: Date.now(),
        },
      ];
    }

    // Determine history for AI call (send full history - Grok maintains state server-side)
    const relevantHistoryForAI = currentHistory.map(m => ({
      role: m.role as 'user' | 'model',
      parts: [{ text: m.content }],
      response_id: m.response_id, // Include Grok response ID for server-side state
    }));

    try {
      const aiRes = await getAI(gameState, relevantHistoryForAI);

      // If AI rewrote the user's input, update the user message in history with the rewritten version
      if (aiRes.rewrittenUserText && !isSilent) {
        // Replace the content of the last user message with the rewritten text
        currentHistory = currentHistory.map((msg, idx) =>
          idx === currentHistory.length - 1 && msg.role === 'user'
            ? { ...msg, content: aiRes.rewrittenUserText! }
            : msg
        );
      }

      // Update state synchronously with the new message
      setGameState(prev => {
        if (!prev) return null;

        // Process stat progression for D&D games BEFORE creating the model message
        let newStats = prev.characterStats;
        let newProgression = prev.statProgression;
        let storyTextWithStatIncrease = aiRes.storyText;

        if (prev.mode === GameMode.DND && prev.characterStats && prev.statProgression) {
          // Use statUsage from AI response if available, otherwise fall back to keyword detection
          let statUsage = aiRes.statUsage;
          if (!statUsage) {
            // Fallback to keyword-based detection if AI didn't provide statUsage
            const legacyResult = processStatProgression(
              prev.characterStats,
              prev.statProgression,
              newUserMessageContent,
              aiRes.storyText
            );
            newStats = legacyResult.stats;
            newProgression = legacyResult.progression;
          } else {
            // Use the new statUsage-based progression
            const progressionResult = processStatProgressionWithUsage(
              prev.characterStats,
              prev.statProgression,
              statUsage
            );

            newStats = progressionResult.stats;
            newProgression = progressionResult.progression;

            // Add narrative messages for stat increases
            if (progressionResult.statIncreases.length > 0) {
              const statIncreaseMessages: Record<string, string> = {
                strength: 'You feel stronger!',
                dexterity: 'Your movements feel more agile!',
                constitution: 'You feel hardier!',
                intelligence: 'Your mind feels sharper!',
                wisdom: 'Your perceptions heighten!',
                charisma: 'You feel more confident!',
              };
              const messages = progressionResult.statIncreases.map(stat => statIncreaseMessages[stat]);
              // Append to story text
              storyTextWithStatIncrease = aiRes.storyText + '\n\n' + messages.join(' ');
            }

            // If stats changed, update the character slot
            if (progressionResult.changed && prev.characterSlotId) {
              updateCharacterStats(prev.characterSlotId, newStats!, newProgression);
            }
          }
        }

        // Create model message with potentially updated story text
        const modelMessage: Message = {
          id: generateId(),
          role: 'model',
          content: storyTextWithStatIncrease,
          characterAction: aiRes.characterAction,
          suggestedActions: aiRes.suggestedActions,
          timestamp: Date.now(),
          parts: [{ text: JSON.stringify(aiRes) }],
          tokenUsage: aiRes.tokenUsage,
          provider: aiRes.provider,
          response_id: aiRes.response_id, // Store Grok response ID for server-side state
        };

        const updatedState = {
          ...prev,
          history: [...currentHistory, modelMessage],
          provider: aiRes.provider,
          characterStats: newStats,
          statProgression: newProgression,
          turnNumber: prev.turnNumber + 1, // Increment turn counter
        };
        saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
        return updatedState;
      });

      // Record turn for achievements
      recordTurn();
    } catch (error) {
      logger.logGameStateError('Narrative error', error, gameState, 'handleSendMessage');
      showError('Error', 'The narrative was interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  // Silent continue: Let AI continue story without adding user message to history
  const handleSilentContinue = () => {
    handleSendMessage('', true);
  };

  // Track processed turn numbers to avoid duplicate summarization
  const processedTurnsRef = useRef<Set<number>>(new Set());

  // Trigger summarization every 10 turns
  useEffect(() => {
    if (!gameState || gameState.turnNumber === 0) return;

    const shouldSummarize = gameState.turnNumber % 10 === 0;
    const alreadyProcessed = processedTurnsRef.current.has(gameState.turnNumber);

    if (shouldSummarize && !alreadyProcessed) {
      // Mark this turn as processed
      processedTurnsRef.current.add(gameState.turnNumber);

      const performSummarization = async () => {
        try {
          setIsLoading(true);

          // Determine which messages to summarize
          // If we already have a summary, summarize the messages since the last summary
          // Otherwise, summarize all messages except the last 10
          const messagesToSummarize = gameState.summary
            ? gameState.history.slice(0, -10) // Summarize older messages
            : gameState.history.slice(0, -10); // Keep recent 10 messages

          if (messagesToSummarize.length === 0) {
            console.log('[Summarization] No messages to summarize');
            return;
          }

          console.log(`[Summarization] Summarizing ${messagesToSummarize.length} messages at turn ${gameState.turnNumber}`);

          const newSummary = await summarizeConversation(
            messagesToSummarize,
            gameState.summary,
            gameState.directives
          );

          // Update state with new summary
          setGameState(prev => {
            if (!prev) return null;
            const updatedState = { ...prev, summary: newSummary };
            saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
            return updatedState;
          });

          console.log(`[Summarization] Summary updated at turn ${gameState.turnNumber}`);
        } catch (error) {
          console.error('[Summarization] Failed:', error);
          // Don't show error to user - summarization failure is non-critical
        } finally {
          setIsLoading(false);
        }
      };

      performSummarization();
    }
  }, [gameState?.turnNumber, gameState?.history, gameState?.summary, gameState?.directives]);

  const handleRedo = async () => {
    if (!gameState || isLoading) return;
    const newHistory = [...gameState.history];
    if (newHistory.length === 0) return;

    // First turn special case: only 1 model message, regenerate it
    if (newHistory.length === 1 && newHistory[0].role === 'model') {
      await handleSendMessage(INITIAL_PROMPT(gameState.mode, gameState.characterDesc, gameState.theme), true, []);
      return;
    }

    if (newHistory[newHistory.length - 1].role === 'model') {
      newHistory.pop();

      const lastUserMsgIndex = newHistory.map(m => m.role).lastIndexOf('user');
      if (lastUserMsgIndex !== -1) {
        const redoFromHistory = newHistory.slice(0, lastUserMsgIndex + 1);
        const lastUserMsg = redoFromHistory[redoFromHistory.length - 1];

        setGameState(prev => {
          if (!prev) return null;
          const updatedState = { ...prev, history: redoFromHistory };
          saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
          return updatedState;
        });
        await handleSendMessage(lastUserMsg.content, true, redoFromHistory);
      } else {
        showError('Redo', 'No previous user turns to redo. Starting a new game.');
        setGameState(null);
      }
    }
  };

  const handleRefreshSuggestions = async () => {
    if (!gameState || isLoading || gameState.history.length === 0) return;

    // Find the last model message with suggestions
    const lastModelIndex = [...gameState.history].map(m => m.role).lastIndexOf('model');
    if (lastModelIndex === -1) return;

    const currentHistory = [...gameState.history];
    const lastModelMessage = currentHistory[lastModelIndex];

    // Re-send the last AI prompt to get new suggestions
    try {
      setIsLoading(true);
      // Transform Message[] to AIHistoryMessage[] by filtering messages with parts
      const historyForAI: AIHistoryMessage[] = currentHistory
        .slice(0, lastModelIndex)
        .filter((msg): msg is Message & { parts: { text: string }[] } => msg.parts !== undefined)
        .map(msg => ({
          role: msg.role,
          parts: msg.parts,
          response_id: msg.response_id,
        }));
      const aiRes = await getAI(gameState, historyForAI);

      const newHistory = [...currentHistory];
      // Update only the suggestedActions of the last model message
      newHistory[lastModelIndex] = {
        ...lastModelMessage,
        suggestedActions: aiRes.suggestedActions,
      };

      setGameState(prev => {
        if (!prev) return null;
        const updatedState = { ...prev, history: newHistory };
        saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
        return updatedState;
      });
    } catch (error) {
      logger.logGameStateError(
        'Failed to refresh suggestions',
        error,
        gameState,
        'handleRefreshSuggestions'
      );
      showError('Error', 'Could not refresh suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!gameState || isLoading) return;

    // Find the message index
    const messageIndex = gameState.history.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Create a new history array to avoid direct mutation
    const newHistory = [...gameState.history];

    // Update the content of the message at the found index
    newHistory[messageIndex] = {
      ...newHistory[messageIndex],
      content: newContent,
      timestamp: Date.now(),
    };

    // Truncate the history after the edited message
    const truncatedHistory = newHistory.slice(0, messageIndex + 1);

    // Update game state with truncated history
    setGameState(prev => {
      if (!prev) return null;
      const updatedState = { ...prev, history: truncatedHistory };
      saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
      return updatedState;
    });

    // Regenerate from this point
    await handleSendMessage(newContent, true, truncatedHistory);
  };

  const handleImportGame = async () => {
    setIsLoading(true);
    try {
      const importedState = await importGameState();
      if (importedState) {
        setGameState(importedState);
      }
    } catch (error) {
      logger.error('Failed to import game', error, { userAction: 'handleImportGame' });
      showError('Error', 'Could not import game state.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'json' | 'markdown') => {
    if (!gameState) return;
    await exportGameState(gameState, type);
  };

  // Calculate if user can generate image based on:
  // 1. Debug mode (always yes)
  // 2. Has custom API key (always yes)
  // 3. Unlocked by watching an ad (one-time use)
  // Note: Localhost detection is in ImageGenerationModal for auto-unlock behavior
  const canGenerateImage =
    DEBUG ||
    Object.values(allApiKeys).some(key => key && key.trim() !== '') ||
    imageGenUnlockedByAd;

  // Opens the image generation modal
  const handleGenerateImage = () => {
    if (!gameState || isGeneratingImage) {
      return;
    }
    setShowImageModal(true);
  };

  // Actually generates the image after modal is submitted
  const handleDoGenerateImage = async (imageSpecifics: string) => {
    if (!gameState) return;

    // Check if user can generate (must have watched ad or have API key or DEBUG)
    if (
      !DEBUG &&
      !Object.values(allApiKeys).some(key => key && key.trim() !== '') &&
      !imageGenUnlockedByAd
    ) {
      showError(
        'Cannot Generate Image',
        'You need to watch an ad to unlock image generation, or add your own API key in Settings.'
      );
      return;
    }

    // Reset the ad unlock state after using it (one-time use)
    setImageGenUnlockedByAd(false);

    // Determine which API key to use (user's custom key or Grok's default)
    let imageProvider: 'GROK' | 'OpenRouter' | 'StabilityAI' | 'OpenAI' | 'ZAI' = 'GROK';
    // Initialize apiKeyToUse as empty string - proxy server will use its default key
    let apiKeyToUse: string = '';

    // Check if user has a custom image API key
    const customProviders: Array<{
      provider: 'OpenRouter' | 'StabilityAI' | 'OpenAI' | 'ZAI';
      key: string;
    }> = [
      { provider: 'OpenRouter', key: allApiKeys.OpenRouter || '' },
      { provider: 'StabilityAI', key: allApiKeys.StabilityAI || '' },
      { provider: 'OpenAI', key: allApiKeys.OpenAI || '' },
      { provider: 'ZAI', key: allApiKeys.ZAI || '' },
    ];

    for (const { provider, key } of customProviders) {
      if (key && key.trim() !== '') {
        imageProvider = provider;
        apiKeyToUse = key;
        break;
      }
    }

    // Note: Empty apiKeyToUse is valid - proxy server will use its default key

    setIsGeneratingImage(true);
    try {
      const storyContext = gameState.history.map(m => m.content).join('\n');

      const imageUrl = await generateSceneImage(
        imageProvider,
        apiKeyToUse,
        gameState.characterName,
        gameState.characterDesc,
        storyContext,
        gameState.theme,
        imageSpecifics,
        gameState.characterImageSeed
      );

      if (imageUrl) {
        setGameState(prev => {
          if (!prev) return null;
          const newHistory = [...prev.history];
          const updatedLastMessage = { ...newHistory[newHistory.length - 1], imageUrl };
          newHistory[newHistory.length - 1] = updatedLastMessage;
          const updatedState = { ...prev, history: newHistory };
          saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
          return updatedState;
        });

        // Reset the one-time unlock after using it
        setImageGenUnlockedByAd(false);
        setShowImageModal(false);
      } else {
        showError('Image Generation Failed', 'Could not generate an image. Please try again.');
      }
    } catch (error) {
      logger.logGameStateError('Image generation error', error, gameState || undefined, 'handleDoGenerateImage');
      showError('Error', 'An unexpected error occurred during image generation.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleLoadSelectedAutosave = async (id: string) => {
    setIsLoading(true);
    try {
      const loadedGame = await loadAutosave(id);
      if (loadedGame) {
        setGameState(loadedGame);
      } else {
        showError('Load Failed', 'Could not load the selected game.');
      }
    } catch (error) {
      logger.error('Error loading autosave', error, {
        userAction: 'handleLoadSelectedAutosave',
        additionalData: { id: 'selectedAutosave' },
      });
      showError('Error', 'Could not load game.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewGame = () => {
    setGameState(null);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Animation is started by useEffect when showIntro changes
  };

  const handleCloseSetupWizard = () => {
    setSetupWizardSlideIn(false);
    setShowIntro(true);
  };

  const handleExitGame = async () => {
    // Record story completion for achievements (only if the game has started)
    if (gameState && gameState.history.length > 0) {
      recordStoryCompleted(gameState.theme);

      // Update character progression for D&D games
      if (gameState.mode === GameMode.DND && gameState.characterSlotId) {
        const sessionPlaytimeMs = sessionSeconds * 1000;
        await updateCharacterProgression(
          gameState.characterSlotId,
          sessionPlaytimeMs,
          gameState.theme // Track adventure style preference
        );
      }
    }
    setGameState(null);
  };

  // Handle using an inventory item
  const handleUseItem = (itemId: string) => {
    setGameState(prev => {
      if (!prev || !prev.inventory) return null;
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item) return null;

      // Reduce quantity or remove item
      let newInventory: typeof prev.inventory;
      if (item.quantity && item.quantity > 1) {
        newInventory = prev.inventory.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity! - 1 } : i
        );
      } else {
        newInventory = prev.inventory.filter(i => i.id !== itemId);
      }

      const updatedState = { ...prev, inventory: newInventory };
      saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
      return updatedState;
    });
  };

  // Handle discarding an inventory item
  const handleDiscardItem = (itemId: string) => {
    setGameState(prev => {
      if (!prev || !prev.inventory) return null;
      const newInventory = prev.inventory.filter(i => i.id !== itemId);
      const updatedState = { ...prev, inventory: newInventory };
      saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
      return updatedState;
    });
  };

  // Handle downloading an image
  const handleDownloadImage = async (imageUrl: string) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `dream-catcher-${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logger.error('Error downloading image', error, {
        userAction: 'handleDownloadImage',
        additionalData: { imageUrl },
      });
      alert('Could not download the image.');
    }
  };

  // Handle setting image as background
  const handleSetImageAsBackground = (imageUrl: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const updatedState = { ...prev, backgroundImage: imageUrl };
      saveAutosave(updatedState, Math.floor(sessionSeconds / 60));
      return updatedState;
    });
  };

  const appContentStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  } as React.CSSProperties;

  const safeAreaStyles = {
    maxWidth: '50%',
    width: '100%',
    height: '100%',
    maxHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties;

  return (
    <div style={appContentStyles}>
      <DropdownFix />
      {/* No SafeAreaView needed on web - using regular div instead */}
      <div style={safeAreaStyles}>
        {isSettingsOpen && <SettingsMenu onClose={() => setIsSettingsOpen(false)} />}

        {showIntro ? (
          <IntroScreen onBegin={handleIntroComplete} />
        ) : pendingGameState && pendingGameState.mode === GameMode.DND ? (
          <div style={{ flex: 1 }}>
            <div style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <button
                onClick={handleBackToSetup}
                style={{ marginRight: 12, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 24, color: colors.primary }}>←</span>
              </button>
              <h1 style={{ ...commonStyles.title, color: colors.primary, flex: 1 }}>
                Create Your Character
              </h1>
            </div>
            <div style={{ flex: 1 }}>
              <CharacterCreator
                initialStats={characterStats}
                onStatsChange={handleCharacterStatsChange}
              />
            </div>
            <div style={{ padding: 16, backgroundColor: colors.surface }}>
              <button
                style={{
                  ...commonStyles.primaryButton,
                  backgroundColor: colors.primary,
                  opacity: !characterStats ? 0.5 : 1,
                }}
                onClick={handleConfirmCharacterStats}
                disabled={!characterStats}
              >
                <span style={commonStyles.buttonText}>
                  Begin Adventure
                </span>
              </button>
            </div>
          </div>
        ) : !gameState ? (
          <div
            style={{
              flex: 1,
              transform: `translateY(${setupWizardSlideIn ? 0 : '200px'})`,
              transition: 'transform 600ms',
            }}
          >
            <SetupWizard
              onStart={handleStartGame}
              onImport={handleImportGame}
              isDebug={DEBUG}
              onLoadGame={handleLoadSelectedAutosave}
              onClose={handleCloseSetupWizard}
            />
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <NarrativeUI
              gameState={gameState}
              onSendMessage={handleSendMessage}
              onSilentContinue={handleSilentContinue}
              onUpdateDirectives={val =>
                setGameState(prev => (prev ? { ...prev, directives: val } : null))
              }
              onUpdateNegativeDirectives={val =>
                setGameState(prev => (prev ? { ...prev, negativeDirectives: val } : null))
              }
              onRedo={handleRedo}
              onSave={() => handleExport('json')}
              onExportMarkdown={() => handleExport('markdown')}
              onExit={handleExitGame}
              isLoading={isLoading || isGeneratingImage}
              onGenerateImage={handleGenerateImage}
              canGenerateImage={canGenerateImage}
              isDebug={DEBUG}
              onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
              sidebarVisible={sidebarVisible}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onEditMessage={handleEditMessage}
              onUseItem={handleUseItem}
              onDiscardItem={handleDiscardItem}
              onDownloadImage={handleDownloadImage}
              onSetImageAsBackground={handleSetImageAsBackground}
            />
          </div>
        )}

        {/* Image Generation Modal */}
        <ImageGenerationModal
          visible={showImageModal}
          onClose={() => setShowImageModal(false)}
          onGenerate={handleDoGenerateImage}
          onWatchAd={() => {
            // Called when user earns the reward from watching the ad
            console.log('User earned reward from watching ad for image generation');
            // Unlock image generation for one use
            setImageGenUnlockedByAd(true);
            // Don't close modal - let user generate the image
          }}
          isLoading={isGeneratingImage}
          canGenerate={canGenerateImage}
          isDebug={DEBUG}
        />

        {/* Error Modal */}
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          message={errorModal.message}
          onDismiss={() => setErrorModal({ ...errorModal, visible: false })}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <FontProvider>
          <AchievementsProvider>
            <AppContent />
          </AchievementsProvider>
        </FontProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
