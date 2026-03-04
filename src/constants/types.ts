export enum GameMode {
  DND = 'Roleplaying',
  STORY = 'Interactive Story',
}

export type ImageProvider = 'GROK' | 'CLOUDFLARE' | 'OpenRouter' | 'StabilityAI' | 'OpenAI' | 'ZAI';

export const IMAGE_PROVIDERS: ImageProvider[] = [
  'GROK',
  'CLOUDFLARE',
  'OpenRouter',
  'StabilityAI',
  'OpenAI',
  'ZAI',
];

export const IMAGE_PROVIDER_NAMES: { [key in ImageProvider]: string } = {
  GROK: 'Grok',
  CLOUDFLARE: 'Cloudflare (Free)',
  OpenRouter: 'OpenRouter',
  StabilityAI: 'Stability AI',
  OpenAI: 'DALL-E (OpenAI)',
  ZAI: 'Z.AI',
};

export interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  suggestedActions?: string[];
  characterAction?: string;
  timestamp: number;
  parts?: { text: string }[];
  imageUrl?: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  provider?: string;
  response_id?: string;
}

export interface GameState {
  id: string;
  name: string;
  mode: GameMode;
  theme: string;
  characterName: string;
  characterDesc: string;
  characterGender?: 'Male' | 'Female' | 'Other'; // User-selected character gender
  directives: string;
  negativeDirectives?: string;
  currentImageUri?: string;
  backgroundImage?: string; // URL of image to use as narrative background
  mood?: string;
  history: Message[];
  summary?: string; // Rolling summary of past conversation (for AI context, not displayed to user)
  turnNumber: number; // Track turn count for summarization triggers
  status: 'setup' | 'playing' | 'ended';
  provider?: string;
  characterStats?: CharacterStats;
  characterSlotId?: string;
  characterImageSeed?: string; // Seed for consistent character image generation
  statProgression?: StatProgression; // D&D stat progression tracking
  inventory?: InventoryItem[]; // D&D inventory items
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// D&D Inventory items
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  type?: 'weapon' | 'armor' | 'potion' | 'tool' | 'treasure' | 'other';
  acquiredAt?: number; // Turn number when acquired
}

// Stat progression tracking (internal, not shown to players)
export interface StatProgression {
  strength: number;    // 0-1000 proficiency per stat
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  totalTurns: number;  // Total turns played (for decay calculation)
  lastProgressionTurn: number;  // Turn number of last stat change
}

export interface CharacterSlot {
  id: string;
  name: string;
  characterName: string;
  characterDesc: string;
  stats: CharacterStats;
  createdAt: number;
  lastPlayedAt?: number;
  totalPlaytimeMs: number;
  adventureStyles: string[];
  level: number;
  xp: number;
  statProgression?: StatProgression; // D&D stat progression tracking
}

export interface AIResponse {
  storyText: string;
  suggestedActions: string[];
  characterAction?: string;
  provider?: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  response_id?: string;
  inventory?: InventoryItem[]; // Starting inventory for D&D mode
  statUsage?: StatUsage; // Stat usage tracking for D&D mode
}

// Stat usage counts returned by AI for D&D mode
export interface StatUsage {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AIHistoryMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  response_id?: string;
}

export interface NarrativeSettings {
  maxNarrativeParagraphs: number;
  suggestedActionsCount: number;
  summarizeAfterTurns: number;
  defaultDirectives: string;
}

// Achievement Types
export type AchievementId =
  | 'first_chapter'
  | 'dreamer'
  | 'worldbuilder'
  | 'storyteller'
  | 'dedicated_dreamer'
  | 'veteran_adventurer'
  | 'speed_reader'
  | 'endless_explorer'
  | 'novelist'
  | 'master_novelist'
  | 'genre_explorer'
  | 'dedicated_wanderer';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'turns' | 'playtime' | 'stories' | 'single_session' | 'words' | 'total_words' | 'themes';
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: number;
  lockedReason?: string; // Reason why achievement is locked (e.g., prerequisites)
}

export interface GameplayStats {
  totalTurns: number;
  totalPlaytimeMs: number;
  totalStoriesPlayed: number;
  longestSessionMs: number;
  currentSessionMs: number; // Current active session time
  totalWords: number; // Total words written across all stories
  themesPlayed: string[]; // List of themes played
}
