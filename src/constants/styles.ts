// Pure web styles - no react-native dependencies

export interface ThemePalette {
  background: string;
  surface: string;
  border: string;
  primary: string;
  secondary: string;
  tertiary: string;
  textMain: string;
  textMuted: string;
  isDark: boolean;
}

export const PALETTES: Record<string, ThemePalette> = {
  // Placeholder for custom theme - will be populated dynamically
  CUSTOM: {
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    primary: '#3b82f6',
    secondary: '#94a3b8',
    tertiary: '#059669',
    textMain: '#f1f5f9',
    textMuted: '#64748b',
    isDark: true,
  },
  CONSERVATIVE_LIGHT: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    primary: '#2563eb',
    secondary: '#64748b',
    tertiary: '#059669',
    textMain: '#0f172a',
    textMuted: '#64748b',
    isDark: false,
  },
  CONSERVATIVE_DARK: {
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    primary: '#3b82f6',
    secondary: '#94a3b8',
    tertiary: '#10b981',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8',
    isDark: true,
  },
  HIGH_FANTASY_DARK: {
    background: '#1a1033',
    surface: '#2d1b4d',
    border: '#4c3077',
    primary: '#a855f7',
    secondary: '#fbbf24',
    tertiary: '#10b981',
    textMain: '#e9d5ff',
    textMuted: '#a78bfa',
    isDark: true,
  },
  HIGH_FANTASY_LIGHT: {
    background: '#fcfaf2',
    surface: '#f3efdf',
    border: '#d4c9a8',
    primary: '#7e22ce',
    secondary: '#b45309',
    tertiary: '#059669',
    textMain: '#2d1a12',
    textMuted: '#7c6a5e',
    isDark: false,
  },
  CYBERPUNK_DARK: {
    background: '#050505',
    surface: '#000000',
    border: '#00f2ff',
    primary: '#ff00ff',
    secondary: '#00f2ff',
    tertiary: '#10b981',
    textMain: '#ffffff',
    textMuted: '#00f2ff',
    isDark: true,
  },
};

export const themeColors = PALETTES.CONSERVATIVE_DARK;

export const theme = {
  colors: themeColors,
  fonts: {
    fantasy: 'EagleLake',
  },
};

export const getGlobalCSS = (colors: ThemePalette) => `
  body { background-color: ${colors.background}; margin: 0; padding: 0; }
  .fantasy-font { font-family: 'EagleLake', serif; }
  .glass-card {
    background-color: rgba(30, 41, 59, 0.7) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

// Inject global styles on load
const styleId = 'dream-catcher-styles';
let style = document.getElementById(styleId);
if (!style) {
  style = document.createElement('style');
  style.id = styleId;
  document.head.appendChild(style);
}
style.textContent = getGlobalCSS(themeColors);

// Helper to create style objects
export const createStyles = <T extends Record<string, React.CSSProperties>>(styles: T): T => styles;

export const appStyles = createStyles({
  container: {
    flex: '1 1 0%',
    backgroundColor: theme.colors.background,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  safeArea: {
    flex: '1 1 0%',
    height: '100%',
  } as React.CSSProperties,
  gameContainer: {
    flex: '1 1 0%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,
  placeholderText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: theme.fonts.fantasy,
  } as React.CSSProperties,
});

export const commonStyles = createStyles({
  messageBubble: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    maxWidth: '85%',
  } as React.CSSProperties,
  bannerContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    marginTop: 16,
    alignSelf: 'stretch',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,
  bannerContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  adTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  } as React.CSSProperties,
  upgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  } as React.CSSProperties,
  upgradeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  } as React.CSSProperties,
  scrollContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  card: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: theme.colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'inline-flex',
  } as React.CSSProperties,
  buttonTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as React.CSSProperties,
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: theme.fonts.fantasy,
  } as React.CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  } as React.CSSProperties,
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  } as React.CSSProperties,
  flex1: {
    flex: '1 1 0%',
  } as React.CSSProperties,
  fieldContainer: {
    width: '100%',
  } as React.CSSProperties,
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    display: 'block',
  } as React.CSSProperties,
  input: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  textArea: {
    height: 100,
    verticalAlign: 'top',
  } as React.CSSProperties,
  rowWithIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  } as React.CSSProperties,
  inputWithIcon: {
    flex: 1,
    marginRight: 0,
  } as React.CSSProperties,
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  } as React.CSSProperties,
  primaryButton: {
    flex: '1 1 0%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  } as React.CSSProperties,
  secondaryButton: {
    flex: '1 1 0%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  } as React.CSSProperties,
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  } as React.CSSProperties,
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  } as React.CSSProperties,
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  } as React.CSSProperties,
  bannerHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as React.CSSProperties,
  bannerTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  } as React.CSSProperties,
  closeButton: {
    padding: 4,
  } as React.CSSProperties,
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  } as React.CSSProperties,
  bannerDescription: {
    fontSize: 12,
    lineHeight: '16px',
    marginBottom: 12,
  } as React.CSSProperties,
  mainContainer: {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  } as React.CSSProperties,
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
  } as React.CSSProperties,
  contentArea: {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  } as React.CSSProperties,
  sidebarScroll: {
    flex: '1 1 0%',
    padding: 20,
    overflowY: 'auto',
  } as React.CSSProperties,
  directiveInput: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 200,
    verticalAlign: 'top',
    marginTop: 8,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  narrativeScroll: {
    flex: '1 1 0%',
    maxHeight: '50vh',
    overflowY: 'auto',
  } as React.CSSProperties,
  narrativeContent: {
    padding: 20,
    paddingBottom: 40,
  } as React.CSSProperties,
  messageContainer: {
    marginBottom: 24,
    maxWidth: '85%',
  } as React.CSSProperties,
  userAlign: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  } as React.CSSProperties,
  modelAlign: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  } as React.CSSProperties,
  userBubble: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 20,
    borderTopRightRadius: 4,
    padding: 16,
  } as React.CSSProperties,
  modelBubble: {
    borderWidth: 0,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: 16,
  } as React.CSSProperties,
  messageText: {
    fontSize: 16,
    lineHeight: '24px',
  } as React.CSSProperties,
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
  } as React.CSSProperties,
  actionRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  } as React.CSSProperties,
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 12,
  } as React.CSSProperties,
  mainTextInput: {
    flex: '1 1 0%',
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 150,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
  } as React.CSSProperties,
});

// ============================================================================
// INTRO SCREEN STYLES
// ============================================================================

export const introScreenStyles = createStyles({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  } as React.CSSProperties,
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  } as React.CSSProperties,
  backgroundImageStyle: {
    opacity: 0.6,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as React.CSSProperties,
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    backgroundColor: '#000',
  } as React.CSSProperties,
  titleSection: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as React.CSSProperties,
  content: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as React.CSSProperties,
  buttonContainer: {
    width: '80%',
    maxWidth: 400,
  } as React.CSSProperties,
  title: {
    fontWeight: '400',
    textAlign: 'center',
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
    marginBottom: 12,
    fontFamily: 'EagleLake',
  } as React.CSSProperties,
  hook: {
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
    fontFamily: 'EagleLake',
  } as React.CSSProperties,
  beginButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  beginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  } as React.CSSProperties,
});

// ============================================================================
// SETUP WIZARD STYLES
// ============================================================================

export const setupWizardStyles = createStyles({
  scrollContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  card: {
    width: '90%',
    maxWidth: 600,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
  } as React.CSSProperties,
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  } as React.CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  } as React.CSSProperties,
  fieldContainer: {
    width: '100%',
  } as React.CSSProperties,
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    display: 'block',
  } as React.CSSProperties,
  input: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  textArea: {
    height: 100,
    verticalAlign: 'top',
  } as React.CSSProperties,
  pickerWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 48,
  } as React.CSSProperties,
  picker: {
    height: 60,
    backgroundColor: 'transparent',
    border: 'none',
    flex: 1,
    fontSize: 16,
    margin: '4px 0',
  } as React.CSSProperties,
  pickerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: '20px',
    paddingVertical: 4,
  } as React.CSSProperties,
  downArrow: {
    fontSize: 14,
    marginLeft: 8,
  } as React.CSSProperties,
  rowWithIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  } as React.CSSProperties,
  inputWithIcon: {
    flex: 1,
    marginRight: 0,
  } as React.CSSProperties,
  textInput: {
    minHeight: 48,
  } as React.CSSProperties,
  randomizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  } as React.CSSProperties,
  randomizeBtnVertical: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  } as React.CSSProperties,
  randomizeBtnText: {
    fontSize: 18,
  } as React.CSSProperties,
  lockedIndicator: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  } as React.CSSProperties,
  modalContainer: {
    flex: '1 1 0%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as React.CSSProperties,
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  } as React.CSSProperties,
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  } as React.CSSProperties,
  modalMessage: {
    fontSize: 14,
    lineHeight: '20px',
    marginBottom: 24,
  } as React.CSSProperties,
  modalButtonRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  } as React.CSSProperties,
  modalButton: {
    flex: '1 1 0%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as React.CSSProperties,
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  } as React.CSSProperties,
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  } as React.CSSProperties,
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  } as React.CSSProperties,
  changeCharBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
  } as React.CSSProperties,
  changeCharBtnText: {
    fontSize: 14,
    fontWeight: '600',
  } as React.CSSProperties,
  backgroundImage: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    flex: '1 1 0%',
  } as React.CSSProperties,
  backgroundImageStyle: {
    opacity: 1,
  } as React.CSSProperties,
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  } as React.CSSProperties,
  closeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  } as React.CSSProperties,
});

// ============================================================================
// NARRATIVE UI STYLES
// ============================================================================

export const narrativeUIStyles = createStyles({
  sceneImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 12,
  } as React.CSSProperties,
  inputControlWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  } as React.CSSProperties,
  inputControlButton: {
    height: 40,
    paddingHorizontal: 10,
  } as React.CSSProperties,
  editModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  } as React.CSSProperties,
  editModalContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 24,
  } as React.CSSProperties,
  editModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  } as React.CSSProperties,
  editModalSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  } as React.CSSProperties,
  editModalInput: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  editModalButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  } as React.CSSProperties,
  editModalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  editModalCancelButton: {} as React.CSSProperties,
  editModalSaveButton: {} as React.CSSProperties,
  editModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  } as React.CSSProperties,
  mobileSidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1500,
  } as React.CSSProperties,
  mobileSidebar: {
    width: '85%',
    maxWidth: 320,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  } as React.CSSProperties,
  inventoryOverlay: {
    flex: '1 1 0%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as React.CSSProperties,
  inventoryContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  inventoryHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  } as React.CSSProperties,
  inventoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  } as React.CSSProperties,
  inventoryContent: {
    padding: 16,
    maxHeight: 400,
    overflowY: 'auto',
  } as React.CSSProperties,
  inventoryItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 12,
    marginBottom: 8,
  } as React.CSSProperties,
  inventoryItemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as React.CSSProperties,
  inventoryItemName: {
    fontSize: 16,
    fontWeight: '600',
  } as React.CSSProperties,
  inventoryItemQty: {
    fontSize: 14,
  } as React.CSSProperties,
  inventoryItemDesc: {
    fontSize: 14,
    marginTop: 4,
  } as React.CSSProperties,
  inventoryItemType: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  } as React.CSSProperties,
  inventoryEmpty: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  } as React.CSSProperties,
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  } as React.CSSProperties,
  statsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  } as React.CSSProperties,
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  } as React.CSSProperties,
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  } as React.CSSProperties,
  statWithProgressRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  } as React.CSSProperties,
  progressBarContainer: {
    flex: '2 2 0%',
    paddingLeft: 12,
  } as React.CSSProperties,
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  } as React.CSSProperties,
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  } as React.CSSProperties,
  progressText: {
    fontSize: 10,
    marginTop: 2,
  } as React.CSSProperties,
  compactStatsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  } as React.CSSProperties,
  compactStatItem: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
  } as React.CSSProperties,
  compactStatLabelRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  } as React.CSSProperties,
  compactStatLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  compactStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  } as React.CSSProperties,
  compactProgressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  } as React.CSSProperties,
  compactProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  } as React.CSSProperties,
  compactProgressText: {
    fontSize: 8,
    marginTop: 1,
  } as React.CSSProperties,
  inventoryItemSmall: {
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 8,
    marginBottom: 6,
  } as React.CSSProperties,
  inventoryItemHeaderSmall: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  inventoryItemNameSmall: {
    fontSize: 13,
    fontWeight: '600',
  } as React.CSSProperties,
  inventoryItemQtySmall: {
    fontSize: 11,
  } as React.CSSProperties,
  inventoryDetailOverlay: {
    flex: '1 1 0%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,
  inventoryDetailContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 20,
  } as React.CSSProperties,
  inventoryDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  } as React.CSSProperties,
  inventoryDetailType: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  } as React.CSSProperties,
  inventoryDetailDesc: {
    fontSize: 14,
    lineHeight: '20px',
    marginBottom: 20,
  } as React.CSSProperties,
  inventoryDetailButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  } as React.CSSProperties,
  inventoryDetailButton: {
    flex: '1 1 0%',
    paddingVertical: 10,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  inventoryDetailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  } as React.CSSProperties,
});

// ============================================================================
// SETTINGS MENU STYLES
// ============================================================================

export const settingsMenuStyles = createStyles({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  menuContainer: {
    width: '90%',
    maxWidth: 500,
    height: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as React.CSSProperties,
  backButton: {
    padding: 4,
  } as React.CSSProperties,
  spacer: {
    width: 50,
  } as React.CSSProperties,
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  } as React.CSSProperties,
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  } as React.CSSProperties,
  navButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  legalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(255,255,255,0.1)',
  } as React.CSSProperties,
  tabBar: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  } as React.CSSProperties,
  tab: {
    flex: '1 1 0%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
  } as React.CSSProperties,
  tabLast: {
    borderRightWidth: 0,
  } as React.CSSProperties,
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  } as React.CSSProperties,
});

export type Styles = typeof appStyles &
  typeof commonStyles &
  typeof introScreenStyles &
  typeof setupWizardStyles &
  typeof narrativeUIStyles &
  typeof settingsMenuStyles;
