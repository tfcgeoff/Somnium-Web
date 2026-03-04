import { useState, useEffect } from 'react';
import { GameMode } from '../../constants/types';
import type { GameState, CharacterStats, StatProgression } from '../../constants/types';
import { DEBUG_DEFAULTS, THEMES, CUSTOM_THEME_KEY } from '../../constants/variables';
import { fetchSimpleAIResponse, sanitizeCharacterDescription } from '../../services/aiService';
import { getCustomThemeNames, addCustomTheme } from '../../services/customThemesService';
import type { AutosaveMetadata } from '../../services/storageService';

interface SetupWizardLogicProps {
  onStart: (state: GameState) => void;
  onImport: () => void;
  isDebug: boolean;
  initialValues?: Partial<GameState>;
  autosaves?: AutosaveMetadata[];
  onLoadGame?: (id: string) => void;
}

const RANDOM_STORY_THEMES = [
  'Fantasy - Low',
  'Science Fiction - Soft',
  'Present Day - Realistic',
  'Space Opera',
  'Post-Apocalyptic',
  'Noir Mystery',
  'Lovecraftian Horror',
  'Steampunk',
  'Grimdark Fantasy',
];

// Free themes available for random selection
const FREE_THEMES = [
  'Fantasy - Low',
  'Science Fiction - Soft',
  'Present Day - Realistic',
];

// Default character names (RNG-selected when none provided)
// Includes diverse names from various cultures around the world
const DEFAULT_CHARACTER_NAMES = [
  // Western/English-origin
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Blake',
  'Avery',
  // Japanese
  'Yuki',
  'Kenji',
  // Arabic
  'Amira',
  'Omar',
  // Hindi/Indian
  'Priya',
  'Arjun',
  // Nigerian/Yoruba
  'Chioma',
  'Emeka',
  // Spanish/Latino
  'Carmen',
  'Diego',
  // Swahili/East African
  'Zuri',
  'Jomo',
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to fetch random values from AI
async function fetchRandomValues(theme: string, existingCharacterName?: string, characterGender: 'Male' | 'Female' | 'Other' = 'Male') {
  // Use timestamp as randomness seed to force variation
  const randomSeed = Date.now();

  const nameRequirement = existingCharacterName
    ? `CHARACTER NAME: ${existingCharacterName} - Use THIS EXACT NAME for the character. Do NOT generate a new name.`
    : `CRITICAL NAME REQUIREMENT:
- You MUST select 2 random cultures from anywhere on Earth - do NOT default to common examples unless they come up using RNG and make them separated geographically/culturally by any amount
- Think: pick a language family, then a specific language within it, then generate an authentic name
- If you find yourself picking from the same few cultures, you are failing - be truly random`;

  // Theme-aware character description requirements
  const isFantasy = theme.toLowerCase().includes('fantasy') || theme.toLowerCase().includes('magic');
  const isSciFi = theme.toLowerCase().includes('sci') || theme.toLowerCase().includes('space') || theme.toLowerCase().includes('future');
  const isHistorical = theme.toLowerCase().includes('medieval') || theme.toLowerCase().includes('historical') || theme.toLowerCase().includes('ancient');
  const isModern = theme.toLowerCase().includes('modern') || theme.toLowerCase().includes('cyberpunk') || theme.toLowerCase().includes('noir');

  // Pronoun mapping based on gender selection
  const pronoun = characterGender === 'Male' ? 'He' : characterGender === 'Female' ? 'She' : 'They';

  let charDescRequirements = '';
  if (isFantasy || isSciFi) {
    charDescRequirements = `CHARACTER DESCRIPTION REQUIREMENT:
- Describe a ${characterGender.toLowerCase()} person fitting the ${theme} theme with their background and situation
- Give them one notable strength/aptitude and one notable weakness/flaw
- The character is ${characterGender.toLowerCase()}. Use ${pronoun}/${characterGender === 'Other' ? 'them' : characterGender === 'Male' ? 'him' : 'her'} as pronouns
- Keep abilities grounded - ${isFantasy ? 'minor magic or exceptional skills, not god-like powers' : 'plausible tech or enhanced abilities, not omnipotent'}
- Leave room for the user to develop the story
- Make the character feel real and relatable within the ${theme} setting`;
  } else if (isHistorical) {
    charDescRequirements = `CHARACTER DESCRIPTION REQUIREMENT:
- Describe a ${characterGender.toLowerCase()} person from the ${theme} era with their social position and circumstances
- Give them one notable skill/talent and one notable hardship/struggle
- The character is ${characterGender.toLowerCase()}. Use ${pronoun}/${characterGender === 'Other' ? 'them' : characterGender === 'Male' ? 'him' : 'her'} as pronouns
- Use historically appropriate occupations and situations
- Ground the character in the realities of life in that time period
- Leave room for the user to develop their story`;
  } else {
    charDescRequirements = `CHARACTER DESCRIPTION REQUIREMENT:
- Describe a ${characterGender.toLowerCase()} realistic person and their basic life situation
- Give them both a strength and a liability/weakness
- The character is ${characterGender.toLowerCase()}. Use ${pronoun}/${characterGender === 'Other' ? 'them' : characterGender === 'Male' ? 'him' : 'her'} as pronouns
- Keep abilities and situations realistic for the ${theme} theme
- Leave room for the user to create their own story
- Ground the character in relatable human experience`;
  }

  const prompt = `Generate a unique, creative story setup for an interactive narrative RPG.

Theme: ${theme}

RANDOMIZATION SEED: ${randomSeed} - Use this value to drive your randomization. Do NOT use common examples. Be genuinely unpredictable.

${nameRequirement}

${charDescRequirements}

Create in JSON format only (no markdown, no extra text):
{
  "name": "Creative adventure name (2-5 words) that fits the ${theme} theme",
  ${existingCharacterName ? `"characterName": "${existingCharacterName}",` : `"characterName": "First and last name from ONE randomly chosen world culture (e.g., 'Tanaka Mbeki', 'Sven Andersson', 'Yuki Yamamoto')",`}
  "characterDesc": "Brief but intriguing character background (2-3 sentences) that fits the ${theme} theme - include appearance, a strength, and a weakness",
  "directives": "3-4 comma-separated style directives for this story, designed to fit both the ${theme} theme and the character description"
}

Be unpredictable. Avoid the first option that comes to mind. Respond ONLY with valid JSON.`;

  try {
    const { text: response } = await fetchSimpleAIResponse(prompt, undefined, {
      jsonMode: true,
      timeout: 120000, // 2 minutes for setup wizard (users are waiting interactively)
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.warn('AI generation failed, using local fallback:', error);
    // Local fallback with authentic single-culture names
    const localNames = [
      'Sven', 'Yuki', 'Amara', 'Mateo', 'Priya', 'Kofi', 'Elena', 'Hassan', 'Lin', 'Soren',
      'Aisha', 'Diego', 'Mei', 'Tarik', 'Sigrun', 'Ravi', 'Chloe', 'Omar', 'Sakura', 'Kwame',
      'Ingrid', 'Luo', 'Zara', 'Marco', 'Fatima', 'Kenji', 'Nia', 'Ivan', 'Layla', 'Thor',
      'Yuna', 'Desmond', 'Emi', 'Jabari', 'Freya', 'Wei', 'Amara', 'Lucas', 'Hana', 'Gustav',
      'Siti', 'Carlos', 'Yuki', 'Kofi', 'Natasha', 'Arjun', 'Elsa', 'Bo', 'Priyanka', 'Magnus',
    ];
    const localDescs = [
      'A former teacher who lost their job after standing up to corrupt authorities and now wanders looking for purpose.',
      'An orphan raised by grandparents who ran a small shop, now trying to find their own path in the world.',
      'A skilled artisan whose workshop was destroyed in a fire, leaving them with nothing but their tools.',
      'A medical student who dropped out due to financial troubles and now works odd jobs while searching for meaning.',
      'A retired athlete whose career ended due to injury, now struggling to define themselves beyond competition.',
      'A shy librarian who stumbled upon a secret that could change everything, too afraid to speak of it.',
      'A street vendor who knows everyone\'s business but keeps their own past carefully hidden.',
      'An aspiring musician whose songs keep getting rejected, yet they refuse to give up on their dream.',
      'A factory worker who survived an accident that killed their coworkers, carrying survivor\'s guilt.',
      'A estranged child of a wealthy family who walked away from privilege and now lives paycheck to paycheck.',
      'A single parent working two jobs to provide for their child, exhausted but determined.',
      'A former soldier who struggles to adjust to civilian life after years of combat.',
      'A graduate student whose research was stolen, now fighting to rebuild their reputation.',
      'A carefree traveler who realized too late that adventure doesn\'t pay the bills.',
      'A loyal friend who took the fall for someone else\'s mistake and can never go home again.',
    ];
    const localDirectives = [
      'Gritty tone, moral ambiguity, survival focus',
      'Epic scale, heroic moments, legendary weapons',
      'Mysterious atmosphere, supernatural elements, investigation focus',
      'Political intrigue, alliances and betrayals, strategic thinking',
      'Fast-paced action, cinematic combat, high stakes',
    ];

    return {
      name: `The ${theme} Chronicles`,
      characterName: existingCharacterName || getRandomElement(localNames),
      characterDesc: getRandomElement(localDescs),
      directives: getRandomElement(localDirectives),
    };
  }
}

export const useSetupWizardLogic = ({
  onStart,
  onImport,
  isDebug,
  initialValues,
  onLoadGame,
}: Omit<SetupWizardLogicProps, 'autosaves'>) => {
  const [name, setName] = useState(initialValues?.name || (isDebug ? DEBUG_DEFAULTS.name : ''));
  const [showExistingStories, setShowExistingStories] = useState(false);
  const [characterName, setCharacterName] = useState(
    initialValues?.characterName || (isDebug ? DEBUG_DEFAULTS.characterName : '')
  );
  const [themeChoice, setThemeChoice] = useState(
    initialValues?.theme || getRandomElement(FREE_THEMES)
  );
  const [customTheme, setCustomTheme] = useState('');
  const [characterDesc, setCharacterDesc] = useState(
    initialValues?.characterDesc || (isDebug ? DEBUG_DEFAULTS.characterDesc : '')
  );
  const [mode, setMode] = useState(
    initialValues?.mode || (isDebug ? DEBUG_DEFAULTS.mode : GameMode.STORY)
  );
  const [characterGender, setCharacterGender] = useState<'Male' | 'Female' | 'Other'>(
    initialValues?.characterGender || 'Male'
  );
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const [characterStats, setCharacterStats] = useState<CharacterStats | undefined>(initialValues?.characterStats);
  const [statProgression, setStatProgression] = useState<StatProgression | undefined>(initialValues?.statProgression);
  const [characterSlotId, setCharacterSlotId] = useState<string | undefined>(initialValues?.characterSlotId);

  // Local autosaves state - managed internally
  const [autosaves, setAutosaves] = useState<AutosaveMetadata[]>([]);

  // Load autosaves on mount
  useEffect(() => {
    const loadAutosaves = async () => {
      const { listAutosaves } = await import('../../services/storageService');
      const saves = await listAutosaves();
      setAutosaves(saves || []);
    };
    loadAutosaves();
  }, []);

  // Custom themes management
  const [availableThemes, setAvailableThemes] = useState<string[]>([...THEMES]);
  const [customThemes, setCustomThemes] = useState<string[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  // Randomize ad modal state
  const [showRandomizeAdModal, setShowRandomizeAdModal] = useState(false);
  const [pendingRandomizeAction, setPendingRandomizeAction] = useState<(() => void) | null>(null);
  const [remainingRandomizes, setRemainingRandomizes] = useState(5);

  // Load custom themes on mount
  useEffect(() => {
    const loadCustomThemes = async () => {
      try {
        const loadedCustomThemes = await getCustomThemeNames();
        setCustomThemes(loadedCustomThemes);
        // Combine default themes with custom themes
        const { DEFAULT_THEMES } = await import('../../constants/variables');
        setAvailableThemes([...DEFAULT_THEMES, ...loadedCustomThemes, CUSTOM_THEME_KEY]);
      } catch (error) {
        console.error('Failed to load custom themes:', error);
        setAvailableThemes(THEMES);
      } finally {
        setIsLoadingThemes(false);
      }
    };
    loadCustomThemes();
  }, []);

  // Load remaining randomizes on mount
  useEffect(() => {
    const loadRandomizeUses = async () => {
      try {
        const { getRandomizeUses, getSetupWizardId } = await import('../../services/randomizeAdService');
        const storyId = getSetupWizardId();
        const remaining = await getRandomizeUses(storyId);
        setRemainingRandomizes(remaining);
      } catch (error) {
        console.error('Failed to load randomize uses:', error);
        setRemainingRandomizes(5);
      }
    };
    loadRandomizeUses();
  }, []);

  // Add a new custom theme
  const handleAddCustomTheme = async (themeName: string) => {
    try {
      const newTheme = await addCustomTheme(themeName);
      setCustomThemes([...customThemes, newTheme.name]);
      setAvailableThemes([...availableThemes.slice(0, -1), newTheme.name, CUSTOM_THEME_KEY]);
      setCustomTheme(newTheme.name);
      setThemeChoice(newTheme.name);
      return newTheme;
    } catch (error) {
      throw error;
    }
  };

  const getCurrentTheme = () => (themeChoice === CUSTOM_THEME_KEY ? customTheme : themeChoice);

  // Helper to check randomize uses and show ad modal if needed
  const withRandomizeAdCheck = async (action: () => void) => {
    const { getRandomizeUses, getSetupWizardId } = await import('../../services/randomizeAdService');
    const storyId = getSetupWizardId();
    const remaining = await getRandomizeUses(storyId);

    if (remaining > 0) {
      // Decrement counter and proceed
      const { useRandomize } = await import('../../services/randomizeAdService');
      await useRandomize(storyId);
      setRemainingRandomizes(remaining - 1);
      action();
    } else {
      // Show ad modal
      setPendingRandomizeAction(() => action);
      setShowRandomizeAdModal(true);
    }
  };

  const handleWatchRandomizeAd = async () => {
    setShowRandomizeAdModal(false);
    // Simulate watching ad
    // TODO: Integrate with actual ad SDK
    if (pendingRandomizeAction) {
      // Award 1 additional use after watching ad
      const { addRandomizeUses, getSetupWizardId } = await import('../../services/randomizeAdService');
      const storyId = getSetupWizardId();
      await addRandomizeUses(storyId, 1);
      setRemainingRandomizes(1);

      // Use the randomize (decrement counter)
      const { useRandomize } = await import('../../services/randomizeAdService');
      await useRandomize(storyId);
      setRemainingRandomizes(0);

      pendingRandomizeAction();
      setPendingRandomizeAction(null);
    }
  };

  const handleCloseRandomizeAdModal = () => {
    setShowRandomizeAdModal(false);
    setPendingRandomizeAction(null);
  };

  const randomizeName = async () => {
    await withRandomizeAdCheck(async () => {
      setName('Randomizing...');
      setIsGeneratingRandom(true);
      try {
        const currentTheme = getCurrentTheme();
        const randoms = await fetchRandomValues(currentTheme, undefined, characterGender);
        setName(randoms.name || name || 'A New Adventure');
      } finally {
        setIsGeneratingRandom(false);
      }
    });
  };

  const randomizeCharacterName = async () => {
    await withRandomizeAdCheck(async () => {
      setCharacterName('Randomizing...');
      setIsGeneratingRandom(true);
      try {
        const currentTheme = getCurrentTheme();
        const randoms = await fetchRandomValues(currentTheme, undefined, characterGender);
        setCharacterName(randoms.characterName || 'Hero');
      } finally {
        setIsGeneratingRandom(false);
      }
    });
  };

  const randomizeTheme = () => {
    // Get all available themes (free + custom/owned)
    const availableOptions = [...FREE_THEMES, ...customThemes];
    const randomTheme = getRandomElement(availableOptions);
    setThemeChoice(randomTheme);
  };

  const randomizeCharacterDesc = async () => {
    await withRandomizeAdCheck(async () => {
      setCharacterDesc('Randomizing...');
      setIsGeneratingRandom(true);
      try {
        const currentTheme = getCurrentTheme();
        const randoms = await fetchRandomValues(currentTheme, characterName, characterGender);
        setCharacterDesc(randoms.characterDesc || 'A mysterious figure.');
      } finally {
        setIsGeneratingRandom(false);
      }
    });
  };

  const randomizeAll = async () => {
    await withRandomizeAdCheck(async () => {
      setName('Randomizing...');
      setCharacterName('Randomizing...');
      setCharacterDesc('Randomizing...');
      setIsGeneratingRandom(true);
      try {
        // Auto-select theme based on time (changes every minute)
        const timeBasedIndex = Math.floor(Date.now() / 60000) % FREE_THEMES.length;
        const selectedTheme = FREE_THEMES[timeBasedIndex];
        setThemeChoice(selectedTheme);

        // Now generate other values using the selected theme
        const randoms = await fetchRandomValues(selectedTheme, undefined, characterGender);
        setName(randoms.name || name || 'A New Adventure');
        setCharacterName(randoms.characterName || 'Hero');
        setCharacterDesc(randoms.characterDesc || 'A mysterious figure.');
      } finally {
        setIsGeneratingRandom(false);
      }
    });
  };

  const handleRandomStory = async () => {
    setIsGeneratingRandom(true);

    const randomTheme = getRandomElement(RANDOM_STORY_THEMES);
    const randomMode = getRandomElement([GameMode.STORY, GameMode.DND]);

    // Use timestamp as randomness seed to force variation
    const randomSeed = Date.now();
    const prompt = `Generate a unique, creative story setup for an interactive narrative RPG.

Theme: ${randomTheme}
Mode: ${randomMode}

RANDOMIZATION SEED: ${randomSeed} - Use this value to drive your randomization. Do NOT use common examples. Be genuinely unpredictable.

CRITICAL NAME REQUIREMENT:
- You MUST select a random language/culture from anywhere on Earth - do NOT default to common examples
- Think: pick a language family, then a specific language within it, then generate an authentic name
- Generate a first name AND last name from that culture (e.g., "Tanaka Mbeki", "Sven Andersson", "Yuki Yamamoto")
- NEVER mix multiple cultures in one name
- If you find yourself picking from the same few cultures, you are failing - be truly random

CHARACTER DESCRIPTION REQUIREMENT:
- Describe a realistic person with a job, family situation, personality traits, or life circumstances
- NO special abilities, powers, magic, chosen ones, prophecies, or supernatural traits unless the mode specifically requires it
- Ground the character in relatable human experience

Create in JSON format only (no markdown, no extra text):
{
  "name": "Creative adventure name (2-5 words)",
  "characterName": "First and last name from ONE randomly chosen world culture (e.g., 'Tanaka Mbeki', 'Sven Andersson')",
  "characterDesc": "Brief but intriguing character background (2-3 sentences, realistic person with job/family/personality - NO special abilities)",
  "directives": "3-4 comma-separated style directives for this story"
}

Be unpredictable. Avoid the first option that comes to mind. Respond ONLY with valid JSON.`;

    try {
      const { text: response } = await fetchSimpleAIResponse(prompt);

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : response;

      const randomStory = JSON.parse(cleanedJson);
      setName(randomStory.name || name || 'A New Adventure');
      setCharacterName(randomStory.characterName || 'Hero');
      setCharacterDesc(randomStory.characterDesc || 'A mysterious figure.');
      setThemeChoice(randomTheme);
      setMode(randomMode);
    } catch (error) {
      console.warn('AI generation failed, using local fallback:', error);

      // Local fallback with authentic single-culture names
      const localNames = [
        'Sven', 'Yuki', 'Amara', 'Mateo', 'Priya', 'Kofi', 'Elena', 'Hassan', 'Lin', 'Soren',
        'Aisha', 'Diego', 'Mei', 'Tarik', 'Sigrun', 'Ravi', 'Chloe', 'Omar', 'Sakura', 'Kwame',
        'Ingrid', 'Luo', 'Zara', 'Marco', 'Fatima', 'Kenji', 'Nia', 'Ivan', 'Layla', 'Thor',
        'Yuna', 'Desmond', 'Emi', 'Jabari', 'Freya', 'Wei', 'Tariq', 'Lucas', 'Hana', 'Gustav',
        'Siti', 'Carlos', 'Natasha', 'Arjun', 'Elsa', 'Bo', 'Priyanka', 'Magnus', 'Selam', 'Mika',
      ];
      const localDescs = [
        'A former teacher who lost their job after standing up to corrupt authorities and now wanders looking for purpose.',
        'An orphan raised by grandparents who ran a small shop, now trying to find their own path in the world.',
        'A skilled artisan whose workshop was destroyed in a fire, leaving them with nothing but their tools.',
        'A medical student who dropped out due to financial troubles and now works odd jobs while searching for meaning.',
        'A retired athlete whose career ended due to injury, now struggling to define themselves beyond competition.',
        'A shy librarian who stumbled upon a secret that could change everything, too afraid to speak of it.',
        'A street vendor who knows everyone\'s business but keeps their own past carefully hidden.',
        'An aspiring musician whose songs keep getting rejected, yet they refuse to give up on their dream.',
        'A factory worker who survived an accident that killed their coworkers, carrying survivor\'s guilt.',
        'An estranged child of a wealthy family who walked away from privilege and now lives paycheck to paycheck.',
        'A single parent working two jobs to provide for their child, exhausted but determined.',
        'A former soldier who struggles to adjust to civilian life after years of combat.',
      ];
      const localDirectives = [
        'Gritty tone, moral ambiguity, survival focus',
        'Epic scale, heroic moments, legendary weapons',
        'Mysterious atmosphere, supernatural elements, investigation focus',
        'Political intrigue, alliances and betrayals, strategic thinking',
        'Fast-paced action, cinematic combat, high stakes',
      ];

      setName(`The ${randomTheme} Chronicles`);
      setCharacterName(getRandomElement(localNames));
      setCharacterDesc(getRandomElement(localDescs));
      setThemeChoice(randomTheme);
      setMode(randomMode);
    } finally {
      setIsGeneratingRandom(false);
    }
  };

  const handleStart = async () => {
    const finalTheme = themeChoice === CUSTOM_THEME_KEY ? customTheme : themeChoice;

    // Sanitize character description to conform to content guidelines (only if provided)
    const finalCharacterDesc = characterDesc
      ? await sanitizeCharacterDescription(characterDesc)
      : '';

    // Use random character name if none provided
    const finalCharacterName = characterName || getRandomElement(DEFAULT_CHARACTER_NAMES);

    console.log('[SetupWizard.ts] handleStart - Original characterDesc:', characterDesc);
    console.log('[SetupWizard.ts] handleStart - Sanitized characterDesc:', finalCharacterDesc);

    onStart({
      ...initialValues,
      name: name || 'A New Adventure',
      theme: finalTheme,
      characterName: finalCharacterName,
      characterDesc: finalCharacterDesc,
      characterGender,
      mode,
      directives: '', // Will be overridden by settings
      history: [],
      characterStats,
      statProgression,
      characterSlotId,
    } as GameState);
  };

  const handleDeleteAutosave = async (id: string) => {
    console.log("Deleting autosave with id:", id);
    const { deleteAutosave } = await import('../../services/storageService');
    await deleteAutosave(id);
    // Update local state immediately
    setAutosaves(prev => prev.filter(a => a.id !== id));
  };

  return {
    state: {
      name,
      characterName,
      themeChoice,
      customTheme,
      characterDesc,
      characterGender,
      mode,
      isDebug,
      isGeneratingRandom,
      availableThemes,
      customThemes,
      isLoadingThemes,
      showExistingStories,
      autosaves,
      showRandomizeAdModal,
      remainingRandomizes,
      characterStats,
      statProgression,
      characterSlotId,
    },
    setters: {
      setName,
      setCharacterName,
      setThemeChoice,
      setCustomTheme,
      setCharacterDesc,
      setCharacterGender,
      setMode,
      setCharacterStats,
      setShowExistingStories,
      setStatProgression,
      setCharacterSlotId,
    },
    handleStart,
    handleRandomStory,
    handleAddCustomTheme,
    handleDeleteAutosave,
    handleWatchRandomizeAd,
    handleCloseRandomizeAdModal,
    onLoadGame,
    handlers: {
      randomizeName,
      randomizeCharacterName,
      randomizeTheme,
      randomizeCharacterDesc,
      randomizeAll,
    },
  };
};
