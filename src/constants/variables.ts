import { GameMode } from './types';

// Helper function for random selection from arrays
function randomOption<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

// Opening scenario options for RNG-based selection
const OPENING_SCENARIOS = [
  'a quiet morning',
  'routine activities',
  'peaceful moments',
  'subtle tension',
  'everyday situations',
  'reflective flashback',
  'mid-conversation dialogue',
  'sensory immersion',
  'haunting past memory',
  'action/consequence',
  'mid-journey arrival'
];

export const DEBUG = false;
export const DEBUG_DEFAULTS = {
  name: '',
  characterName: 'Jojo Lieatte',
  theme: 'Contemporary - Realistic',
  characterDesc: '',
  mode: GameMode.STORY,
};

// API KEYS HAVE BEEN REMOVED FOR SECURITY
// The app now uses PROXY-ONLY mode to keep API keys off client devices.
// All API keys are stored server-side in somnium-server/.env
// This prevents API key extraction from APK files.

// Proxy Server Configuration - REQUIRED for the app to function
// URL: https://dreamcatcher-g624.onrender.com (Render deployment, TODO: rename service)
// Dashboard: https://dashboard.render.com/web/srv-d5an0dogjchc73bdhh70
// Repo: https://github.com/tfcgeoff/Somnium (somnium-server subdirectory)
export const PROXY_SERVER_URL = 'https://cynner-g-proxy.onrender.com';
export const USE_PROXY_SERVER = true; // Always use proxy for security

// Client API Key for server authentication
export const CLIENT_API_KEY = 'DC_API_FBv15A4erXjE8eQXc75qbJU1WHcsw77XF27BHE';

// Story Themes
// export const DEFAULT_THEMES = [
//   'Contemporary',
//   'Fantasy',
//   'Horror',
//   'Romance',
//   'Sci-Fi',
//   'Superhero',
//   'Cyberpunk',
// ] as const;

export const GAME_THEMES = {
  "fantasy": [
    { "id": 102, "name": "Low", "description": "Limited magic, grounded conflicts, human-scale stakes." },
    { "id": 101, "name": "High", "description": "Epic scope, powerful magic, clear heroes and villains." },
    { "id": 103, "name": "Dark", "description": "Bleak tone, suffering, moral ambiguity, dangerous magic." },
    { "id": 105, "name": "Mythic", "description": "Gods, legends, archetypes, fate-driven narratives." },
    { "id": 106, "name": "Sword and Sorcery", "description": "Personal stakes, pulp adventure, cunning over destiny." },
    { "id": 107, "name": "Urban", "description": "Magic hidden within a modern or near-modern world." },
    { "id": 108, "name": "Gaslamp", "description": "Victorian-era fantasy with manners, mystery, and magic." },
    { "id": 109, "name": "Fairy Tale", "description": "Symbolic logic, moral lessons, strange and whimsical danger." },
    { "id": 112, "name": "Fey", "description": "Otherworldly beings, trickery, ancient nature magic." },
    { "id": 113, "name": "Elemental", "description": "Magic tied to natural forces like fire, water, air, earth." },
  ],

  "science_fiction": [
    { "id": 202, "name": "Soft", "description": "Focus on society, culture, and philosophy over realism." },
    { "id": 201, "name": "Hard", "description": "Scientifically plausible technology and constraints." },
    { "id": 203, "name": "Space Opera", "description": "Epic space conflicts, empires, heroes, and grand scale." },
    { "id": 204, "name": "Cyberpunk", "description": "High tech, low life, corporate control, cybernetics." },
    { "id": 205, "name": "Solarpunk", "description": "Optimistic future, sustainability, harmony with technology." },
    { "id": 206, "name": "Biopunk", "description": "Genetic engineering, body modification, living technology." },
    { "id": 207, "name": "Nanopunk", "description": "Nanotechnology-driven society, invisible control and power." },
    { "id": 208, "name": "Mecha", "description": "Giant piloted machines and mechanized warfare." },
    { "id": 209, "name": "AI", "description": "Artificial intelligence as ally, tool, or existential threat." },
    { "id": 210, "name": "Virtual Reality", "description": "Simulated worlds, digital identities, blurred reality." },
    { "id": 211, "name": "Time Travel", "description": "Movement across time, causality, paradoxes." },
    { "id": 212, "name": "Alien Contact", "description": "First contact, alien cultures, interspecies tension." }
  ],

  "present_day": [
    { "id": 301, "name": "Realistic", "description": "Grounded modern world with plausible events." },
    { "id": 302, "name": "Urban", "description": "City-focused stories involving crime, culture, or pressure." },
    { "id": 303, "name": "Rural", "description": "Small towns, isolation, nature-driven tension." },
    { "id": 304, "name": "Slice of Life", "description": "Everyday experiences, personal growth, relationships." },
    { "id": 305, "name": "Contemporary Drama", "description": "Emotional conflicts rooted in modern society." },
    { "id": 306, "name": "Crime", "description": "Illegal activity, investigation, moral compromise." }
  ],

  "historical": [
    { "id": 401, "name": "Ancient", "description": "Early civilizations, myth-adjacent history." },
    { "id": 402, "name": "Medieval", "description": "Feudal societies, knights, castles, early kingdoms." },
    { "id": 403, "name": "Renaissance", "description": "Art, science, politics, cultural rebirth." },
    { "id": 404, "name": "Victorian", "description": "Industry, class divides, social restraint." },
    { "id": 405, "name": "Industrial", "description": "Rapid technological growth and labor conflict." },
    { "id": 406, "name": "World War", "description": "Global conflict, survival, moral complexity." },
    { "id": 407, "name": "Cold War", "description": "Espionage, paranoia, ideological struggle." },
    { "id": 408, "name": "Western", "description": "Frontier justice, lawlessness, expansion." },
    { "id": 409, "name": "Pirate", "description": "Seafaring adventure, freedom, betrayal." },
    { "id": 410, "name": "Samurai", "description": "Honor-bound warriors, feudal Japan." },
    { "id": 411, "name": "Viking", "description": "Raiding, exploration, Norse culture." }
  ],

  "apocalyptic": [
    { "id": 501, "name": "Post Apocalyptic", "description": "Life after societal collapse." },
    { "id": 502, "name": "Dystopian", "description": "Oppressive systems, loss of freedom." },
    { "id": 503, "name": "Zombie", "description": "Undead outbreak, survival against hordes." },
    { "id": 504, "name": "Pandemic", "description": "Global disease, fear, and breakdown." },
    { "id": 505, "name": "Environmental Collapse", "description": "Nature-driven extinction or decay." },
    { "id": 506, "name": "Alien Invasion", "description": "Humanity under extraterrestrial threat." }
  ],

  "horror": [
    { "id": 601, "name": "Psychological", "description": "Fear rooted in mind, trauma, perception." },
    { "id": 602, "name": "Cosmic", "description": "Insignificance before incomprehensible forces." },
    { "id": 605, "name": "Slasher", "description": "Direct physical threat, pursuit, violence." },
    { "id": 606, "name": "Body Horror", "description": "Physical transformation and violation." },
    { "id": 607, "name": "Survival", "description": "Endurance under constant lethal pressure." }
  ],

  "mystery": [
    { "id": 701, "name": "Detective", "description": "Solving crimes through clues and logic." },
    { "id": 702, "name": "Noir", "description": "Cynical tone, flawed characters, moral gray." },
    { "id": 703, "name": "Conspiracy", "description": "Hidden powers, secret truths." },
    { "id": 704, "name": "Political Intrigue", "description": "Schemes, influence, power struggles." },
    { "id": 705, "name": "Espionage", "description": "Spies, secrets, covert operations." },
    { "id": 706, "name": "Thriller", "description": "High tension, fast-paced danger." }
  ],

  "romance": [
    { "id": 801, "name": "Slow Burn", "description": "Gradual emotional development." },
    { "id": 802, "name": "Forbidden", "description": "Love opposed by rules or society." },
    { "id": 803, "name": "Tragic", "description": "Love ending in loss or sacrifice." },
    { "id": 804, "name": "Lighthearted", "description": "Warm, hopeful, and uplifting romance." },
    { "id": 805, "name": "Drama", "description": "Emotionally intense relationships." },
    { "id": 806, "name": "Found Family", "description": "Bonds formed beyond blood." },
    { "id": 807, "name": "Rivalry", "description": "Romance born from competition or conflict." }
  ],

  "superhero": [
    { "id": 901, "name": "Street Level", "description": "Local threats, limited powers." },
    { "id": 902, "name": "Vigilante", "description": "Justice outside the law." },
    { "id": 903, "name": "Cosmic", "description": "Universe-scale threats and power." },
    { "id": 904, "name": "Team Based", "description": "Ensemble of heroes with shared conflict." },
    { "id": 905, "name": "Anti Hero", "description": "Morally conflicted protagonists." },
    { "id": 906, "name": "Origin Story", "description": "The rise of a new hero." }
  ],

  "survival": [
    { "id": 1101, "name": "Wilderness", "description": "Nature as the primary threat." },
    { "id": 1102, "name": "Siege", "description": "Holding out against overwhelming force." },
    { "id": 1103, "name": "Shipwrecked", "description": "Isolation after disaster." },
    { "id": 1104, "name": "Resource Scarcity", "description": "Constant lack of food, tools, or safety." },
    { "id": 1105, "name": "Hostile World", "description": "Environment itself seeks to kill you." }
  ],
}

export const CUSTOM_THEME_KEY = 'CUSTOM';

// Helper to convert category key to display name
function categoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    fantasy: 'Fantasy',
    science_fiction: 'Science Fiction',
    present_day: 'Present Day',
    historical: 'Historical',
    apocalyptic: 'Apocalyptic',
    horror: 'Horror',
    mystery: 'Mystery',
    romance: 'Romance',
    superhero: 'Superhero',
    progression: 'Progression',
    survival: 'Survival',
    experimental: 'Experimental',
  };
  return names[category] || category;
}

// Flatten GAME_THEMES into an array of "Category - Subtheme" strings
export const DEFAULT_THEMES = Object.entries(GAME_THEMES).flatMap(([category, themes]) =>
  themes.map(theme => `${categoryDisplayName(category)} - ${theme.name}`)
);

// Combined themes including custom ones loaded from storage
// Use getThemes() to get the full list including custom themes
export const THEMES = [...DEFAULT_THEMES, CUSTOM_THEME_KEY];

// App Configuration & Keys
export const APP_ID = 'ca-app-pub-7397469957968727~7089530170';
export const AD_UNIT_ID = 'ca-app-pub-7397469957968727/5640717132';
export const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';

// Adjustment Variables (Global Game Tuning)
export const MAX_NARRATIVE_PARAGRAPHS = 2;
export const SUGGESTED_ACTIONS_COUNT = 3;
export const DEFAULT_SUMMARIZE_AFTER_TURNS = 10;
export const DEFAULT_THEME = 'Fantasy';

export const SYSTEM_INSTRUCTION_BASE = (
  mode: string,
  theme: string,
  character: string,
  directives: string,
  negativeDirectives?: string,
  summary?: string,
  maxParagraphs?: number,
  actionsCount?: number,
  characterStats?: { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number }
) => {
  const isInteractiveStory = mode === GameMode.STORY;
  const charName = character.split(':')[0];
  const isFantasy = theme.toLowerCase().includes('fantasy') || theme.toLowerCase().includes('medieval') || theme.toLowerCase().includes('mythic');

  // Determine style reference based on theme
  let styleReference = '';
  const themeLower = theme.toLowerCase();

  if (themeLower.includes('science fiction') || themeLower.includes('sci-fi') || themeLower.includes('cyberpunk')) {
    styleReference = 'Ringworld by Larry Niven';
  } else if (themeLower.includes('fantasy') || themeLower.includes('mythic')) {
    styleReference = 'The Fellowship of the Ring by J.R.R. Tolkien';
  } else if (themeLower.includes('medieval') || themeLower.includes('historical')) {
    styleReference = 'The House of the Wolfings by William Morris';
  } else {
    // Default to modern for contemporary, realistic, present-day, etc.
    styleReference = 'Petersburg by Andrei Bely';
  }

  const roleDescription = isInteractiveStory
    ? `Cinematic Narrator: Weave seamless stories with connective world details (sights, sounds, consequences) paying attention to realism`
    : `Dungeon Master: Create engaging, fair adventures. Challenges tough but exciting, never impossible. Start with a quest being offered, not in the middle`;

  const summarySection = summary ? `
STORY SUMMARY (for context):
${summary}
` : '';

  return `
${roleDescription}
Mode: ${mode} | Theme: ${theme} | Character: ${character}
${summarySection}
CORE RULES:
• PLAYER IDENTITY: The player IS the protagonist character described above. Always address the player as that character using "you." NEVER write about the character in third person or as someone separate from the player.
• REWRITE: Transform user input into narrative prose while preserving exact intent and meaning. Do NOT add narrative fluff around directives.
• RESPECT DIRECTIVES: If user instructs "list what you see," write the list, not simply say "you stand and list what you see."
• PRESERVE USER INTENT: Listen to what the user wants, not what would sound pretty. Concentrate on the user's actual goal.
• Address player as "you" always
• Content: Ages 13 and under appropriate. Romance limited to emotional connection (blushing, nervousness, hand-holding, brief hugs, quick kisses). NO sensual content, making out, or sexual tension. No profanity.
• Clothing: Genre-culture appropriate (Japanese schoolgirls may wear crop tops/miniskirts; fantasy armor may be revealing). Describe NEUTRALLY without emphasizing sexual characteristics or drawing attention to revealing aspects. Focus on aesthetics/function, not allure.
• All NPCs named with distinct personalities
• NEVER end with a question, but keep the pace up


FORBIDDEN ESCALATION (ABSOLUTE RULES - NEVER VIOLATE):
• DO NOT introduce police, arrests, storms, disasters, attacks, or crises unless the user explicitly creates them
• DO NOT make peaceful locations suddenly dangerous
• DO NOT transform a simple conversation into a conflict
• If user walks on a beach → describe the beach, sand, water, maybe a passing person. NO police, NO storms, NO arrests
• If user talks to a maintenance worker → have them respond naturally (might be friendly, grumpy, busy). NO police arriving, NO sudden weather changes
• If user explores a village → describe buildings, people going about their day. NO ambushes, NO explosions, NO "something is wrong here"
• BOREDOM IS BETTER THAN FORCED DRAMA: A peaceful scene that feels "slow" is infinitely better than randomly ruining the mood
• WEATHER: Weather changes naturally over time, not instantly. No sudden storms unless appropriate for the setting/season
• AUTHORITARIAN FIGURES: Police, guards, soldiers ONLY appear if logically present and the user interacts with them first

PROGRESSION (CRITICAL):
• FOLLOW USER'S LEAD: Match pacing to player actions. Calm, cautious actions → peaceful response. Aggressive, reckless actions → consequences.
• CONFLICT IS SITUATIONAL: Only introduce threats/problems when the user initiates conflict or enters dangerous areas. Peaceful locations remain peaceful.
• ACTION-CONSEQUENCE LOGIC: If user explores safe areas (home, village, school), keep things safe. If user enters dangerous territory (wilderness, ruins, enemy territory), appropriate challenges arise.
• NPC REALISM: Personalities vary everywhere—in safe areas, NPCs can be pleasant, grumpy, shy, outgoing, rude, or indifferent. In dangerous areas, they can be hostile, cautious, or surprisingly friendly. Violence is rare in safe areas; self-defense or opportunistic behavior in dangerous ones.
  SAFE AREA EXAMPLES: A shopkeeper might sigh impatiently, grumble about prices, ignore customers at first, or be busy cleaning. A villager might avoid eye contact, give curt one-word answers, complain about the weather, or simply not care to help. But they won't attack unless provoked.
  DANGEROUS AREA EXAMPLES: Bandits might threaten violence but accept bribes. A lone traveler might share food cautiously. Not everyone is an enemy—some might be scared, lost, or just passing through.
• PREVENT STAGNATION: Advance through character development, worldbuilding, and natural consequences—not forced escalation.
• SCENE LIMIT: Resolve or evolve within 2-3 turns max, but resolution can be peaceful (conversation, reflection, discovery) not just conflict

CHARACTER VARIETY (CRITICAL):
• STYLE REFERENCE: Base character and clothing descriptions on the descriptive style of "${styleReference}"
• RANDOMIZATION MANDATORY: Every new character must be independently randomized in ALL aspects before comparison. Do not start from "default" and modify—generate fresh each time.
• FULL INDEPENDENCE: Body type, height, build, posture, hair (color, length, style), facial features, skin tone, eye color, clothing style, colors, accessories—all randomized separately
• ANTI-REPETITION: Every new character must differ from ALL previous characters in at least 3 major aspects. If previous was "tall + thin + blonde + dress", next cannot share more than one of these traits
• RECALL RECENT: Before describing a new character, mentally review the last 3-4 characters' appearances and outfits. Actively avoid any similarity
• DIVERSE APPEARANCES: Include wide range of body types (athletic, heavy, thin, average, muscular), heights (very short to very tall), attractiveness levels (conventional to plain to distinctive), and ages when appropriate
• CLOTHING RANDOMIZATION (CRITICAL):
  - NEVER repeat exact outfit combinations or styles across characters
  - Randomize independently: garment type + color + fit + style + condition + accessories
  - Include variety: casual, formal, athletic, eclectic, vintage, practical, flashy, muted, layered, minimal
  - Mix: pants/shorts/skirts/dresses, various sleeve lengths, different necklines, multiple footwear types
  - Accessories: jewelry (rings, necklaces, bracelets), hats, scarves, bags, watches, hair accessories, piercings
  - Grooming variety: neat, messy, styled, natural, elaborate, minimal, makeup (or lack thereof)
  - Colors: full spectrum—don't default to neutrals. Use bold, pastel, bright, dark, mixed patterns, prints
• CONTEXTUAL CLOTHING: Outfits must reflect current weather, time of year, activity, school rules, personal taste, subculture, socioeconomic clues, and recent events (e.g., paint-stained clothes after art class, formal wear for an event, layered for cold, wet after rain)
• CLOTHING INVENTORY: Characters have multiple outfits. Change between scenes/days when logical (new day, different weather, special occasion)
• CLOTHING CHANGES: Between scenes/days, characters may change outfits. Track what they wear and explain changes
• BREAK STEREOTYPES: Never default to common tropes (e.g., no automatic "baggy jeans + hoodie" for teenage boys, no "crop top + leggings" for popular girls, no uniform athletic wear for jocks). Each character's style must be individual
• FIRST MEETING: Describe face, build, and full outfit (top + bottom + shoes + accessories) on introduction. Skip redundant details for returning characters
• NO ARCHETYPE UNIFORMS: Clothing must not signal stereotype (e.g., nerds aren't always in glasses and plaid, goths vary widely, popular girls have diverse styles)
• ANTI-CONSENSUS: Do not use consensus opinions or stereotypes in NPC generation. Each character is unique
• NEUTRAL DESCRIPTION: Describe clothing functionally and aesthetically. Even for revealing genre-appropriate attire (fantasy armor, Japanese school uniforms), avoid emphasizing sexual characteristics. Focus on color, style, and pattern—not allure

SETTING CONTINUITY:
• TECHNOLOGY LEVEL: Items must match setting${isFantasy ? '. No powered wheelchairs, no modern prosthetics, no electric devices. Use theme-appropriate alternatives like crutches, wooden prosthetics, torches.' : ''}
• CULTURAL FIT: Names, customs, technology fit the theme
• CONTENT APPROPRIATE: No mystery/adventure tropes (secret notes, treasure maps, quests) in contemporary/realistic settings. Stay grounded.
• TRACK INVENTORY: Remember what characters have/wear. Explain changes
• LOCATION: Characters don't teleport. Movement requires narrative justification

NARRATIVE STYLE:
• Show, don't tell (sensory details over emotion names)
• Real people: Characters express independent ideas, question odd behavior, have bad days, hold grudges, show bias. Not everyone is helpful or likable—some are selfish, petty, or unpleasant regardless of setting.
  EXAMPLES: An NPC might be tired from a double shift and snap at the player. Another might be prejudiced against outsiders. Some might simply be having a bad day. Others might be genuinely kind. Personalities should feel random and authentic, not "everyone I meet is helpful."
• Temporal: Mention time passing occasionally (sunset, candles low, etc.)
• World alive: Background events occur even without user interaction
• PLAYER KNOWLEDGE: NEVER name a character before introduction. First describe them visually ("a tall boy with messy hair nudges his friend"), THEN have them introduce themselves or be named by others. Do not assume player knows anyone.

${mode === GameMode.DND ? `
D&D BALANCING:
• Combat winnable in 3-5 rounds. Multiple weak foes > one overpowering enemy
• Protagonist can lose according to skill, but is captured not killed
• Opponent numbers/skills increase according to protagonist level.
• Escape always viable. Don't block retreat with infinite spawns
• Fixed enemy count. When defeated, they're gone
• Honor retreat. Let fleeing characters disengage and leave

STAT USAGE TRACKING (CRITICAL):
• You MUST track which stats the player uses each turn
• Player stats: ${characterStats ? `${characterStats.strength} STR | ${characterStats.dexterity} DEX | ${characterStats.constitution} CON | ${characterStats.intelligence} INT | ${characterStats.wisdom} WIS | ${characterStats.charisma} CHA` : '{strength} STR | {dexterity} DEX | {constitution} CON | {intelligence} INT | {wisdom} WIS | {charisma} CHA'}
• Higher stats = better success rates for relevant actions
• Use these stats to resolve actions and reflect outcomes in narrative
• Include a "statUsage" object in your JSON response tracking usage counts

Example statUsage:
{
  "strength": 2,     // Used twice (e.g., lifting and attacking)
  "dexterity": 0,    // Not used this turn
  "constitution": 1,
  "intelligence": 0,
  "wisdom": 1,
  "charisma": 0
}
` : ''}

CONSTRAINTS:
• Max ${maxParagraphs || 2} paragraphs
• JSON response format required

USER DIRECTIVES: ${directives}
${negativeDirectives ? `AVOID: ${negativeDirectives}` : ''}

OUTPUT JSON:
{
  "rewrittenUserText": "polished narrative version of user input",
  "characterAction": "cinematic translation with dialogue",
  "storyText": "world reaction, NPC dialogue, environmental changes",
  "suggestedActions": [${actionsCount || 3} actions, each 2-5 words only, brief and punchy]${
  mode === GameMode.DND ? `,
  "statUsage": {
    "strength": 0,
    "dexterity": 0,
    "constitution": 0,
    "intelligence": 0,
    "wisdom": 0,
    "charisma": 0
  }` : ''
}
}
`;
};

export const INITIAL_PROMPT = (mode: GameMode, characterDesc: string, theme: string) => {
  const isInteractiveStory = mode === GameMode.STORY;
  const isDND = mode === GameMode.DND;

  // Random number of concepts to generate (6-10)
  const numConcepts = Math.floor(Math.random() * 5) + 6;

  const basePrompt = `
STEP 1 - OPENING CONCEPT GENERATION:
Generate ${numConcepts} distinct opening concepts.

Each concept MUST define:
- The opening situation
- The setting type
- The primary narrative driver
- The NPC configuration for the opening (0–2 NPCs, named or unnamed)

CONCEPT DIVERSITY RULES:
- Each concept must feature a DISTINCT NPC archetype or type—no two concepts may use similar character patterns (e.g., if one uses a peer, another must use authority, a stranger, a family member, etc.).
- Concepts must NOT reuse the same NPC role, age relationship, or function.
- At least one concept must include ZERO NPCs.
- At least one concept must include an NPC who is not helpful, friendly, or aligned.
- Only ONE concept may include only indirect human presence (messages, recordings, shadows, traces).

DISCARD RULE:
Discard the first floor(${numConcepts} / 2) concepts.
The remaining concepts retain their own characters.
Choose ONE remaining concept and write only that opening.
Do NOT reference discarded concepts or characters.

From the remaining concepts, select the one that is most conceptually distinct from the discarded ones.

CRITICAL OUTPUT RULE:
DO NOT list or describe the concepts you generated.
DO NOT explain your selection process.

TEMPORAL FREEDOM (CRITICAL):
The opening scene does NOT need to depict the character's first moments or initial arrival.
It may occur:
- Before the main situation officially begins
- After events are already in progress
- At a later point in the timeline
- During an unrelated obligation connected to the setting

OPENING EXCLUSION:
The opening MUST NOT depict:
- Initial arrival at the primary setting
- Entering a location for the first time
- First transition moments (bells, announcements, summons)
- Standard "just getting started" scenarios

NPC ROLE DIVERSITY:
The opening NPC, if any, should NOT default to the most obvious character type for the setting.
Prefer unexpected, peripheral, or authority-adjacent roles over the primary character archetype.

OPENING REQUIREMENTS:
- Start naturally—allow life to progress normally before introducing plot elements.
- Start with ${randomOption(OPENING_SCENARIOS)}.
- Use concrete sensory details.
- AVOID starting with crisis, danger, or "something just went wrong"—vary the opening tone.
- Let the user initiate any tension or conflict. The opening should be peaceful or routine, not dramatic.
- Wait for user actions to determine the story's direction—don't force plot hooks.
- SPECIFIC PROHIBITIONS: NO opening with police, arrests, storms, disasters, someone dying, weapons drawn, or "you are needed immediately." These are cliché and violate user agency.
- INSTEAD: Describe the environment (lighting, sounds, smells), show a character doing something ordinary, establish the mood through atmosphere not crisis.

${
  isInteractiveStory ? `
STORY MODE:
- Keep the world open-ended and non-linear.
- Do not force a quest or destiny.
- Leave multiple future trajectories plausible.
` : ''
}

${
  isDND ? `
D&D MODE:
- Present a tangible adventure hook with stakes.
- Action must be imminent but survivable.
` : ''
}
`;

  if (mode === GameMode.DND) {
    return basePrompt + `

D&D STARTING INVENTORY (CRITICAL):
- You MUST include an "inventory" array in your JSON response with starting items
- Based on the character's background, include appropriate items:
  * Weapons/armor appropriate to their description (e.g., if they like knives, include a dagger)
  * Clothing they are wearing (appropriate to the setting)
  * Money/coins (always include some amount)
  * Other sundry items fitting their backstory
- Each item must have: id (unique), name, description, quantity (default 1), type (weapon/armor/potion/tool/treasure/other)
- Example: "inventory": [{"id": "1", "name": "Iron Dagger", "description": "A simple but reliable blade", "quantity": 1, "type": "weapon"}]`;
  }

  return basePrompt;
};

/**
 * Sanitization prompt for character descriptions to ensure PG-13 compliance
 * Used by sanitizeCharacterDescription in aiService.ts
 */
export const CHARACTER_DESC_SANITIZE_PROMPT = (characterDesc: string) => `You are a character description sanitization assistant for a text-based RPG game.

Your goal: Rewrite character descriptions to conform to PG-13 content standards (ages 13 and under).

CRITICAL: Always rewrite the description to fit the story style. NEVER return the original unchanged.

EDIT: Limit nudity, sexually alluring clothing, revealing attire and seductive appeal from content. 

KEEP these elements:
- Personality traits (eager, nervous, bold, intelligent, shy)
- Physical traits (teen, slender, tall, short, young) when described neutrally
- Clothing types (crop tops, short skirts, jeans, dresses) when described functionally
- Motivations and backstory
- Genre-appropriate appearance descriptions (fantasy armor, school uniforms, etc.)

RULES:
- Describe clothing functionally and neutrally, limiting emphasis on sexual attraction
- Keep the same length if possible
- Maintain the original character's personality and essence
- Avoid explicit or suggestive language
- Remove or alter any content that implies sexual behavior or intent
- Output ONLY the sanitized description, nothing else

Character Description:
${characterDesc}

Sanitized description:`;
