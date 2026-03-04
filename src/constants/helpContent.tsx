/**
 * Help Content System
 *
 * All help documentation stored as structured data for easy maintenance.
 * Supports rich text with bold, italic, lists via nested Text nodes.
 *
 * Usage:
 * - import { helpTopics } from './helpContent';
 * - <HelpModal topicId="gameOverview" />
 * - <FloatingTooltip content={helpTopics.setupWizard.storyName} />
 */

import { ReactNode } from 'react';

// Rich text node types
export type TextNode = string | { text: string; bold?: boolean; italic?: boolean };
export type HelpSection = {
  title: string;
  content: TextNode[];
  tips?: TextNode[];
};

// Convert text nodes to React elements for rendering
// Platform-specific implementation handled in component files
export function renderHelpText(nodes: TextNode[]): ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === 'string') {
      return { type: 'text', content: node, key: i };
    }
    const { text, bold, italic } = node;
    return { type: 'styled', content: text, bold, italic, key: i };
  });
}

// ============================================================================
// GAME OVERVIEW (IntroScreen, Settings Help)
// ============================================================================

const gameOverviewContent: HelpSection = {
  title: 'Welcome to Somnium',
  content: [
    'Embark on an epic adventure unlike any other in ',
    { text: 'Somnium', bold: true },
    ', a groundbreaking narrative-driven RPG that uses advanced AI to bring your stories to life. Whether you crave a deep, unfolding narrative, the strategic depth of a tabletop RPG, or a completely customized experience, the app adapts to your imagination.',
  ],
};

const gameModesContent: HelpSection = {
  title: 'Game Modes',
  content: [
    { text: 'STORY Mode', bold: true },
    'Immerse yourself in an interactive narrative experience. The AI acts as a dynamic dungeon master, crafting a rich story based on your character, theme, and actions. Focus is on plot, character development, and narrative exploration without complex mechanics.\n\n',
    { text: 'Roleplaying Mode', bold: true },
    'For those who love the classic tabletop feel. This mode incorporates traditional RPG mechanics like character stats (Strength, Dexterity, etc.), an inventory system, and dice rolls. The AI will prompt for rolls and consider your stats in outcomes, offering a more strategic and challenging experience.\n\n',
    { text: 'CUSTOM Mode', bold: true },
    'Unleash your creativity! This mode allows you to define your own specific rules and directives for the AI. Want a story where magic is forbidden, or every decision has a hidden consequence? CUSTOM mode gives you the ultimate control to tailor the game exactly to your vision.',
  ],
};

const coreFeaturesContent: HelpSection = {
  title: 'Core Features',
  content: [
    { text: 'AI-Generated Narrative', bold: true },
    ': Experience a dynamically evolving story. Our AI, powered by multiple providers (like Gemini, Grok, and more), intelligently responds to your input, crafting unique events, characters, and plot twists in real-time.\n\n',
    { text: 'Character Creation', bold: true },
    ': Design your protagonist from the ground up. Define their name, appearance, background, personality, and even their core stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) for Roleplaying mode, influencing how they interact with the world.\n\n',
    { text: 'Inventory System (Roleplaying Mode Only)', bold: true },
    ': Track your possessions, equipment, and loot in Roleplaying mode. Acquire new items, manage your gear, and use them strategically to overcome challenges.\n\n',
    { text: 'Autosave Functionality', bold: true },
    ': Never lose your progress! The game automatically saves your adventure at regular intervals and after significant actions, ensuring a seamless experience.\n\n',
    { text: 'Image Generation for Scenes', bold: true },
    ': Bring the narrative to life visually. After watching a short ad, unlock the ability to generate stunning images depicting characters, locations, or events directly within your story.\n\n',
    { text: 'Achievement Tracking', bold: true },
    ': Monitor your progress and celebrate your triumphs. Unlock various achievements for reaching milestones, making specific choices, or exploring unique narrative paths.\n\n',
    { text: 'Multiple Themes', bold: true },
    ': Set the stage for your adventure with a wide array of themes and settings, including Fantasy (High, Low), Sci-Fi (Cyberpunk, Space Opera), Horror (Eldritch, Psychological), and many more to guide the AI\'s narrative style.',
  ],
};

// ============================================================================
// SETUP WIZARD (Field-level tooltips)
// ============================================================================

const storyNameHelp: HelpSection = {
  title: 'Story Name',
  content: [
    'This is the ',
    { text: 'title of your adventure', bold: true },
    '. It will appear at the top of your game interface.',
  ],
  tips: [
    'Choose a name that excites you and gives a hint of the adventure to come!',
    'Examples: "The Crystal of Aethelgard", "Neon Shadows of Sector 7", "Whispers from the Void"',
  ],
};

const characterNameHelp: HelpSection = {
  title: 'Character Name',
  content: [
    'The name of your ',
    { text: 'protagonist', bold: true },
    ' – the hero (or anti-hero) of your story.',
  ],
  tips: [
    'Consider a name that fits your chosen theme.',
    'A simple or unique name can both work, but try to avoid names that are overly common if you want a distinct feel.',
  ],
};

const characterDescHelp: HelpSection = {
  title: 'Character Description',
  content: [
    'A detailed background for your character, including their ',
    { text: 'appearance, personality traits', bold: true },
    ', and any relevant ',
    { text: 'history or motivations', bold: true },
    '.',
  ],
  tips: [
    { text: 'This is one of the MOST important fields!', bold: true },
    'The more descriptive and evocative you are, the better the AI can embody your character.',
    'Include both strengths and flaws.',
    'Describe physical features, core personality (e.g., brave, cunning, cynical), skills, fears, and past events.',
  ],
};

const gameModeHelp: HelpSection = {
  title: 'Game Mode',
  content: [
    'Determines the ',
    { text: 'fundamental rules and style', bold: true },
    ' of your game session.',
  ],
  tips: [
    { text: 'STORY', bold: true, italic: true },
    ': Fluid, narrative-focused experience',
    { text: 'Roleplaying', bold: true, italic: true },
    ': Strategic gameplay with stats and dice',
    { text: 'CUSTOM', bold: true, italic: true },
    ': Maximum control over AI behavior',
    'If you\'re new, STORY mode is a great starting point.',
  ],
};

const themeHelp: HelpSection = {
  title: 'Theme/Setting',
  content: [
    'Defines the ',
    { text: 'genre, setting, and overall tone', bold: true },
    ' of your adventure.',
  ],
  tips: [
    'Be specific! A well-defined theme will help the AI generate relevant scenarios.',
    'Examples: "Dark Fantasy - Medieval" for a grittier experience.',
  ],
};

const customRulesHelp: HelpSection = {
  title: 'Custom Rules',
  content: [
    'Additional, ',
    { text: 'specific directives', bold: true },
    ' for the AI to follow throughout your game. Most impactful in CUSTOM mode but can refine any mode.',
  ],
  tips: [
    'Use this to fine-tune your experience.',
    'Examples: "Focus on mystery and investigation.", "NPCs should always be suspicious of the player."',
    'These rules are powerful tools to shape the narrative beyond the theme.',
  ],
};

// ============================================================================
// NARRATIVE UI (Button/menu help)
// ============================================================================

const messageInputHelp: HelpSection = {
  title: 'Message Input',
  content: [
    'This is where you type your character\'s ',
    { text: 'actions, dialogue, or questions', bold: true },
    ' to the AI.',
  ],
  tips: [
    { text: 'Be clear and descriptive!', bold: true },
    'Instead of "Go", try "I cautiously proceed down the dark corridor, hand on my sword hilt."',
    'For dialogue, enclose it in quotation marks.',
    'You can also ask the AI questions about the world or your surroundings.',
  ],
};

const redoButtonHelp: HelpSection = {
  title: 'Redo Button',
  content: [
    'Regenerate the ',
    { text: 'last AI response', bold: true },
    ', effectively "undoing" the previous turn and getting a different outcome.',
  ],
  tips: [
    'Use this wisely - frequent use without changing your input might lead to less coherent narratives.',
    'Best used when you feel the AI misinterpreted something or went in an undesirable direction.',
    'Great for exploring "what if" scenarios.',
  ],
};

const imageGenButtonHelp: HelpSection = {
  title: 'Image Generation',
  content: [
    'Generate a ',
    { text: 'visual representation', bold: true },
    ' of the current scene or characters.',
  ],
  tips: [
    { text: 'Requirement:', bold: true },
    'Unlocks for a single image after watching a short ad. There is no limit on the number of images you generate!',
    'Use this feature to visualize key moments, character introductions, or impressive locations.',
  ],
};

const settingsMenuHelp: HelpSection = {
  title: 'Settings Menu (Gear Icon)',
  content: [
    'A central hub to access and customize various game settings, from ',
    { text: 'appearance to AI behavior', bold: true },
    '.',
  ],
  tips: [
    'Regularly check your settings if you want to change AI provider or adjust narrative style.',
  ],
};

const exportImportHelp: HelpSection = {
  title: 'Export/Import Game State',
  content: [
    { text: 'Export', bold: true },
    ': Save your game progress to a file on your device.\n',
    { text: 'Import', bold: true },
    ': Load a previously saved game from a file.',
  ],
  tips: [
    'While Autosave protects against unexpected closures, manual Export is excellent for:',
    'Creating backups',
    'Sharing your story with friends',
    'Transferring your game between different devices',
    'Always keep your exported files safe!',
  ],
};

const suggestedActionsHelp: HelpSection = {
  title: 'Suggested Actions',
  content: [
    'The AI provides ',
    { text: 'clickable prompts', bold: true },
    ' suggesting potential next actions your character could take.',
  ],
  tips: [
    'Fantastic for beginners, when you\'re feeling stuck, or just want to quickly move the story along.',
    'Can spark new ideas for your own actions.',
    'Don\'t feel limited by them – you can always type anything you wish!',
  ],
};

const directivesHelp: HelpSection = {
  title: 'Active Directives',
  content: [
    'Guide the AI\'s storytelling by providing ',
    { text: 'ongoing instructions', bold: true },
    ' that shape the narrative.',
  ],
  tips: [
    'Use this to guide plot direction, tone, or focus areas.',
    'Examples: "Build tension gradually", "Focus on character relationships", "Include mystery elements".',
    'Changes here affect upcoming responses immediately.',
  ],
};

const negativeDirectivesHelp: HelpSection = {
  title: 'Negative Directives (Avoid)',
  content: [
    'Tell the AI what to ',
    { text: 'avoid or exclude', bold: true },
    ' from the story.',
  ],
  tips: [
    'Use this to prevent unwanted themes or actions.',
    'Examples: "No sudden deaths of main characters", "Avoid graphic violence", "No romantic subplots".',
    'Helpful for keeping the story within your comfort zone.',
  ],
};

// ============================================================================
// SETTINGS SECTIONS
// ============================================================================

const colorSchemeHelp: HelpSection = {
  title: 'Color Scheme',
  content: [
    'Controls the ',
    { text: 'visual appearance', bold: true },
    ' of the application interface.',
  ],
  tips: [
    'Pick a scheme that is comfortable for your eyes during long play sessions.',
    'Dark Mode is often preferred for evening play.',
  ],
};

const narrativeSettingsHelp: HelpSection = {
  title: 'Narrative Settings',
  content: [
    'Adjusts how the AI ',
    { text: 'generates and manages your story', bold: true },
    '.',
  ],
  tips: [
    { text: 'AI Provider', bold: true, italic: true },
    ': Experiment with different providers to find your preferred style.',
    { text: 'Creativity/Temperature', bold: true, italic: true },
    ': Higher = more creative/wild, Lower = more grounded/predictable.',
    { text: 'Response Length', bold: true, italic: true },
    ': Short for faster pace, Long for richer descriptions.',
    { text: 'Summarization Frequency', bold: true, italic: true },
    ': Helps track story in long campaigns.',
  ],
};

const imageSettingsHelp: HelpSection = {
  title: 'Image Generation Settings',
  content: [
    'Configures how the game generates ',
    { text: 'visual elements', bold: true },
    ' for your story.',
  ],
  tips: [
    { text: 'Image Provider', bold: true, italic: true },
    ': Different providers excel at different styles.',
    { text: 'API Keys', bold: true, italic: true },
    ': Enter your personal API key for your chosen provider.',
    { text: 'Image Style/Resolution', bold: true, italic: true },
    ': Match the image style to your game\'s theme for better immersion.',
  ],
};

const achievementsHelp: HelpSection = {
  title: 'Achievements',
  content: [
    'Displays a list of all possible in-game achievements and your ',
    { text: 'progress towards unlocking them', bold: true },
    '.',
  ],
  tips: [
    'Achievements offer fun challenges and replayability.',
    'See if you can unlock them all across different game modes and stories!',
  ],
};

// ============================================================================
// TOPIC INDEX (for Settings Help navigation)
// ============================================================================

export const helpTopics = {
  // Game Overview (IntroScreen, Settings Help)
  gameOverview: gameOverviewContent,
  gameModes: gameModesContent,
  coreFeatures: coreFeaturesContent,

  // Setup Wizard fields
  storyName: storyNameHelp,
  characterName: characterNameHelp,
  characterDesc: characterDescHelp,
  characterGender: {
    title: 'Character Gender',
    content: [
      'Select the gender for your character. This choice affects:',
      '\n• ',
      { text: 'Pronouns', bold: true },
      ' - How the AI refers to your character (he/she/they)',
      '\n• ',
      { text: 'Character Generation', bold: true },
      ' - The AI will create descriptions appropriate to your chosen gender',
      '\n• ',
      { text: 'Story Context', bold: true },
      ' - NPCs and the world will respond based on your character\'s gender',
      '\n\n',
      { text: 'Note:', bold: true },
      ' This choice is never randomized - you have full control. It helps create a more personalized story experience.',
    ],
  },
  gameMode: gameModeHelp,
  theme: themeHelp,
  customRules: customRulesHelp,

  // Narrative UI elements
  messageInput: messageInputHelp,
  redoButton: redoButtonHelp,
  imageGenButton: imageGenButtonHelp,
  settingsMenu: settingsMenuHelp,
  exportImport: exportImportHelp,
  suggestedActions: suggestedActionsHelp,
  directives: directivesHelp,
  negativeDirectives: negativeDirectivesHelp,

  // Settings sections
  colorScheme: colorSchemeHelp,
  narrativeSettings: narrativeSettingsHelp,
  imageSettings: imageSettingsHelp,
  achievements: achievementsHelp,
};

// Topic categories for Settings Help navigation
export const helpCategories = {
  overview: {
    title: 'Getting Started',
    topics: ['gameOverview', 'gameModes', 'coreFeatures'],
  },
  setupWizard: {
    title: 'Setup Wizard',
    topics: ['storyName', 'characterName', 'characterDesc', 'characterGender', 'gameMode', 'theme', 'customRules'],
  },
  gameplay: {
    title: 'Gameplay',
    topics: ['messageInput', 'redoButton', 'imageGenButton', 'suggestedActions'],
  },
  settings: {
    title: 'Settings Guide',
    topics: ['colorScheme', 'narrativeSettings', 'imageSettings', 'achievements'],
  },
};

// Export as HELP_CONTENT for component compatibility
export const HELP_CONTENT = helpTopics;
