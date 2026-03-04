import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Achievement, AchievementId, GameplayStats } from '../constants/types';

// Prerequisite: achievement IDs that must be unlocked before this one
interface AchievementWithPrereqs extends Omit<Achievement, 'unlocked' | 'unlockedAt'> {
  prerequisites?: AchievementId[];
}

// Achievement definitions with prerequisites
export const ACHIEVEMENT_DEFINITIONS: AchievementWithPrereqs[] = [
  {
    id: 'first_chapter',
    name: 'First Chapter',
    description: 'Complete 20 turns in a single story',
    icon: '',
    requirement: { type: 'turns', value: 20 },
  },
  {
    id: 'dreamer',
    name: 'Dreamer',
    description: 'Play for 30 minutes total',
    icon: '',
    requirement: { type: 'playtime', value: 30 * 60 * 1000 }, // 30 minutes in ms
  },
  {
    id: 'worldbuilder',
    name: 'Worldbuilder',
    description: 'Play 5 different stories',
    icon: '',
    requirement: { type: 'stories', value: 5 },
    prerequisites: ['first_chapter'], // Must complete First Chapter first
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Complete 100 turns across all stories',
    icon: '',
    requirement: { type: 'turns', value: 100 },
    prerequisites: ['first_chapter'],
  },
  {
    id: 'dedicated_dreamer',
    name: 'Dedicated Dreamer',
    description: 'Play for 2 hours total',
    icon: '',
    requirement: { type: 'playtime', value: 2 * 60 * 60 * 1000 }, // 2 hours in ms
    prerequisites: ['dreamer'], // Must earn Dreamer first
  },
  {
    id: 'veteran_adventurer',
    name: 'Veteran Adventurer',
    description: 'Complete 500 turns across all stories',
    icon: '',
    requirement: { type: 'turns', value: 500 },
    prerequisites: ['storyteller'], // Must earn Storyteller first
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Play for 1 hour in a single session',
    icon: '',
    requirement: { type: 'single_session', value: 60 * 60 * 1000 }, // 1 hour in ms
    prerequisites: ['dreamer'],
  },
  {
    id: 'endless_explorer',
    name: 'Endless Explorer',
    description: 'Play 20 different stories',
    icon: '',
    requirement: { type: 'stories', value: 20 },
    prerequisites: ['worldbuilder'],
  },
  // New achievements for variety
  {
    id: 'novelist',
    name: 'Novelist',
    description: 'Write 5,000 words in a single story',
    icon: '',
    requirement: { type: 'words', value: 5000 },
    prerequisites: ['storyteller'],
  },
  {
    id: 'master_novelist',
    name: 'Master Novelist',
    description: 'Write 20,000 words across all stories',
    icon: '',
    requirement: { type: 'total_words', value: 20000 },
    prerequisites: ['novelist'],
  },
  {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Play a story in each available theme',
    icon: '',
    requirement: { type: 'themes', value: 7 }, // All 7 default themes
    prerequisites: ['worldbuilder'],
  },
  {
    id: 'dedicated_wanderer',
    name: 'Dedicated Wanderer',
    description: 'Play for 10 hours total',
    icon: '',
    requirement: { type: 'playtime', value: 10 * 60 * 60 * 1000 }, // 10 hours
    prerequisites: ['dedicated_dreamer'],
  },
];

interface AchievementsContextType {
  achievements: Achievement[];
  stats: GameplayStats;
  unlockedCount: number;
  totalCount: number;
  checkAchievements: () => void;
  resetAchievements: () => void;
  recordTurn: () => void;
  recordStoryCompleted: (theme: string) => void;
  recordWordsWritten: (wordCount: number) => void;
  setGameActive: (active: boolean) => void;
  isGameActive: boolean;
}

const ACHIEVEMENTS_STORAGE_KEY = 'dream_catcher_achievements';
const STATS_STORAGE_KEY = 'dream_catcher_gameplay_stats';

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

const defaultStats: GameplayStats = {
  totalTurns: 0,
  totalPlaytimeMs: 0,
  totalStoriesPlayed: 0,
  longestSessionMs: 0,
  currentSessionMs: 0,
  totalWords: 0,
  themesPlayed: [],
};

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }))
  );
  const [stats, setStats] = useState<GameplayStats>(defaultStats);
  const [isGameActive, setIsGameActive] = useState(false);

  // Ref to track the current session start time
  const sessionStartTimeRef = useRef(Date.now());

  // Use ref to avoid stale closures in the timer
  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Load saved achievements and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedAchievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        const savedStats = localStorage.getItem(STATS_STORAGE_KEY);

        if (savedAchievements) {
          const parsedAchievements = JSON.parse(savedAchievements);
          setAchievements(parsedAchievements);
        }

        if (savedStats) {
          // Merge saved stats with default to handle migrations
          const parsedStats = JSON.parse(savedStats);
          setStats(prevStats => ({
            ...defaultStats,
            ...parsedStats,
            themesPlayed: parsedStats.themesPlayed || [],
          }));
        }
      } catch (error) {
        console.error('Failed to load achievements from storage', error);
      }
    };
    loadData();
  }, []);

  // Save achievements to storage
  const saveAchievements = useCallback((newAchievements: Achievement[]) => {
    try {
      const jsonValue = JSON.stringify(newAchievements);
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save achievements to storage', error);
    }
  }, []);

  // Save stats to storage
  const saveStats = useCallback((newStats: GameplayStats) => {
    try {
      const jsonValue = JSON.stringify(newStats);
      localStorage.setItem(STATS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save stats to storage', error);
    }
  }, []);

  // Check if prerequisites are met for an achievement
  const arePrerequisitesMet = useCallback((achievement: AchievementWithPrereqs, currentAchievements: Achievement[]): boolean => {
    if (!achievement.prerequisites || achievement.prerequisites.length === 0) return true;

    return achievement.prerequisites.every(prereqId =>
      currentAchievements.some(a => a.id === prereqId && a.unlocked)
    );
  }, []);

  // Check and unlock achievements based on current stats
  const checkAchievements = useCallback(() => {
    setAchievements(prevAchievements => {
      const updated = prevAchievements.map((achievement, index) => {
        // Skip if already unlocked
        if (achievement.unlocked) return achievement;

        // Get the full definition with prerequisites
        const def = ACHIEVEMENT_DEFINITIONS[index];
        if (!def) return achievement;

        // Check prerequisites first
        if (!arePrerequisitesMet(def, prevAchievements)) {
          return { ...achievement, lockedReason: 'Complete previous achievements first' };
        }

        let shouldUnlock = false;
        const { type, value } = achievement.requirement;

        switch (type) {
          case 'turns':
            shouldUnlock = statsRef.current.totalTurns >= value;
            break;
          case 'playtime':
            shouldUnlock = statsRef.current.totalPlaytimeMs >= value;
            break;
          case 'stories':
            shouldUnlock = statsRef.current.totalStoriesPlayed >= value;
            break;
          case 'single_session':
            shouldUnlock = statsRef.current.currentSessionMs >= value;
            break;
          case 'words':
            // Track words per story (simplified - uses total for now)
            shouldUnlock = statsRef.current.totalWords >= value;
            break;
          case 'total_words':
            shouldUnlock = statsRef.current.totalWords >= value;
            break;
          case 'themes':
            shouldUnlock = statsRef.current.themesPlayed.length >= value;
            break;
        }

        if (shouldUnlock) {
          return { ...achievement, unlocked: true, unlockedAt: Date.now() };
        }
        return { ...achievement, lockedReason: undefined };
      });

      // Only save if something changed
      const hasChanges = updated.some((a, i) => a.unlocked !== prevAchievements[i].unlocked);
      if (hasChanges) {
        saveAchievements(updated);
      }

      return updated;
    });
  }, [arePrerequisitesMet, saveAchievements]);

  // Timer-based playtime tracking - works on both web and native
  useEffect(() => {
    const timer = setInterval(() => {
      if (isGameActive) {
        const now = Date.now();
        const sessionDuration = now - sessionStartTimeRef.current;

        setStats(prevStats => {
          const newStats = {
            ...prevStats,
            totalPlaytimeMs: prevStats.totalPlaytimeMs + 1000, // Add 1 second
            currentSessionMs: prevStats.currentSessionMs + 1000,
            longestSessionMs: Math.max(prevStats.longestSessionMs, prevStats.currentSessionMs + 1000),
          };

          // Save periodically (every 30 seconds) to avoid excessive writes
          if (newStats.totalPlaytimeMs % 30000 < 1000) {
            saveStats(newStats);
          }

          return newStats;
        });
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [isGameActive, saveStats]);

  // Record a turn taken
  const recordTurn = useCallback(() => {
    setStats(prevStats => {
      const newStats = { ...prevStats, totalTurns: prevStats.totalTurns + 1 };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Record words written
  const recordWordsWritten = useCallback((wordCount: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, totalWords: prevStats.totalWords + wordCount };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Record a story completed with theme
  const recordStoryCompleted = useCallback((theme: string) => {
    setStats(prevStats => {
      const themesPlayed = prevStats.themesPlayed.includes(theme)
        ? prevStats.themesPlayed
        : [...prevStats.themesPlayed, theme];

      const newStats = {
        ...prevStats,
        totalStoriesPlayed: prevStats.totalStoriesPlayed + 1,
        themesPlayed,
      };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Set game active state (called by App when game starts/stops)
  const setGameActive = useCallback((active: boolean) => {
    setIsGameActive(active);
    if (active) {
      // Starting a new session
      sessionStartTimeRef.current = Date.now();
      setStats(prevStats => ({ ...prevStats, currentSessionMs: 0 }));
    } else {
      // Ending session - save final stats
      setStats(prevStats => {
        saveStats(prevStats);
        return { ...prevStats, currentSessionMs: 0 };
      });
    }
  }, [saveStats]);

  // Reset all achievements (for testing)
  const resetAchievements = useCallback(() => {
    const resetAchievementsList = ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: false,
    }));
    setAchievements(resetAchievementsList);
    setStats(defaultStats);
    saveAchievements(resetAchievementsList);
    saveStats(defaultStats);
  }, [saveAchievements, saveStats]);

  // Check achievements whenever stats change
  useEffect(() => {
    checkAchievements();
  }, [stats, checkAchievements]);

  const unlockedCount = useMemo(() => achievements.filter(a => a.unlocked).length, [achievements]);
  const totalCount = achievements.length;

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        stats,
        unlockedCount,
        totalCount,
        checkAchievements,
        resetAchievements,
        recordTurn,
        recordStoryCompleted,
        recordWordsWritten,
        setGameActive,
        isGameActive,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) throw new Error('useAchievements must be used within an AchievementsProvider');
  return context;
};
