/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: GameThemePicker.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review GameThemePicker.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - None (this component is identical across platforms)
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../services/ThemeContext';
import { GAME_THEMES } from '../../../constants/variables';
import { isFreeTheme, canUseTheme, unlockTheme } from '../../../services/ownedThemesService';
import WatchAdModal from './WatchAdModal.web';

interface GameTheme {
  id: number;
  name: string;
  description: string;
}

interface GameThemeCategory {
  [key: string]: GameTheme[];
}

interface GameThemePickerProps {
  onSelect: (theme: string) => void;
  onClose: () => void;
  currentTheme?: string;
}

const CATEGORY_LABELS: { [key: string]: { label: string; freeId: number } } = {
  fantasy: { label: 'Fantasy', freeId: 102 },  // Low Fantasy
  science_fiction: { label: 'Science Fiction', freeId: 202 },  // Soft Sci-Fi
  present_day: { label: 'Present Day', freeId: 301 },  // Realistic
  historical: { label: 'Historical', freeId: 401 },
  apocalyptic: { label: 'Apocalyptic', freeId: 501 },
  horror: { label: 'Horror', freeId: 601 },
  mystery: { label: 'Mystery', freeId: 701 },
  romance: { label: 'Romance', freeId: 801 },
  superhero: { label: 'Superhero', freeId: 901 },
  progression: { label: 'Progression Fantasy', freeId: 1001 },
  survival: { label: 'Survival', freeId: 1101 },
};

// Free categories (first theme in each is free)
const FREE_CATEGORIES = ['fantasy', 'science_fiction', 'present_day'];

const GameThemePicker: React.FC<GameThemePickerProps> = ({ onSelect, onClose, currentTheme }) => {
  const { currentTheme: colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ownedThemes, setOwnedThemes] = useState<Set<string>>(new Set());
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);

  // Load owned themes on mount
  useEffect(() => {
    const loadOwnedThemes = async () => {
      const { getOwnedThemes } = await import('../../../services/ownedThemesService');
      const owned = await getOwnedThemes();
      setOwnedThemes(new Set(owned));
    };
    loadOwnedThemes();
  }, []);

  // Auto-select first category on mount
  useEffect(() => {
    const categories = Object.keys(GAME_THEMES).filter(k => k !== 'experimental');
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, []);

  const handleCategoryClick = (categoryKey: string) => {
    // Toggle: if clicking same category, deselect it
    if (selectedCategory === categoryKey) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryKey);
    }
  };

  const handleThemeSelect = async (theme: GameTheme, categoryKey: string) => {
    const categoryInfo = CATEGORY_LABELS[categoryKey];
    const themeFullName = `${categoryInfo.label} - ${theme.name}`;

    // Check if theme is free or owned
    if (isFreeTheme(themeFullName)) {
      onSelect(themeFullName);
      onClose();
      return;
    }

    // Check if theme is already owned
    if (ownedThemes.has(themeFullName)) {
      onSelect(themeFullName);
      onClose();
      return;
    }

    // Premium theme - show ad modal
    setPendingTheme(themeFullName);
    setShowAdModal(true);
  };

  const handleWatchAd = async () => {
    if (!pendingTheme) return;

    setShowAdModal(false);

    // Simulate ad completion
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      await unlockTheme(pendingTheme);
      setOwnedThemes(prev => new Set([...prev, pendingTheme!]));
      onSelect(pendingTheme!);
      onClose();
    } catch (error) {
      console.error('Failed to unlock theme:', error);
    } finally {
      setPendingTheme(null);
    }
  };

  const handleCloseAdModal = () => {
    setShowAdModal(false);
    setPendingTheme(null);
  };

  // Get themes for selected category
  const selectedCategoryThemes = selectedCategory ? GAME_THEMES[selectedCategory] || [] : [];
  const selectedCategoryInfo = selectedCategory ? CATEGORY_LABELS[selectedCategory] : null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      backgroundColor: `${colors.background}CC`,
      pointerEvents: 'auto',
    },
    dropdownContainer: {
      width: '90%',
      maxWidth: 700,
      height: 450,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderStyle: 'solid',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      overflow: 'hidden',
      pointerEvents: 'auto',
    },
    categoriesColumn: {
      width: 200,
      backgroundColor: colors.background,
      borderRight: `1px solid ${colors.border}`,
      overflowY: 'auto',
    },
    themesColumn: {
      flex: 1,
      overflowY: 'auto',
    },
    categoryItem: {
      padding: '14px 16px',
      borderBottom: `1px solid ${colors.border}`,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      fontSize: 15,
      color: colors.textMain,
    },
    categoryItemSelected: {
      backgroundColor: `${colors.primary}20`,
      borderLeftWidth: 3,
      borderLeftStyle: 'solid',
      borderLeftColor: colors.primary,
    },
    categoryLabel: {
      flex: 1,
    },
    categoryArrow: {
      fontSize: 14,
      color: colors.primary,
    },
    themesColumn: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      color: colors.textMuted,
      fontSize: 14,
      fontStyle: 'italic',
      padding: 40,
    },
    themesHeader: {
      padding: '16px 20px',
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: colors.background,
    },
    themesTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    themeItem: {
      padding: '14px 20px',
      borderBottom: `1px solid ${colors.border}`,
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    themeItemSelected: {
      backgroundColor: `${colors.primary}15`,
    },
    themeItemContent: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMain,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    badge: {
      padding: '3px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 'bold',
    },
    freeBadge: {
      backgroundColor: colors.primary,
      color: colors.background,
    },
    ownedBadge: {
      backgroundColor: colors.secondary,
      color: colors.textMain,
    },
    lockBadge: {
      backgroundColor: colors.border,
      color: colors.textMuted,
    },
  };

  return (
    <>
      {createPortal(
        <div style={styles.overlay} onClick={onClose}>
          <div style={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
            {/* Left Column - Categories */}
            <div style={styles.categoriesColumn}>
              {Object.entries(GAME_THEMES)
                .filter(([categoryKey]) => categoryKey !== 'experimental')
                .map(([categoryKey, themes]) => {
                  const categoryInfo = CATEGORY_LABELS[categoryKey];
                  if (!categoryInfo) return null;

                  const isSelected = selectedCategory === categoryKey;

                  return (
                    <button
                      key={categoryKey}
                      style={{
                        ...styles.categoryItem,
                        ...(isSelected ? styles.categoryItemSelected : {}),
                      }}
                      onClick={() => handleCategoryClick(categoryKey)}
                    >
                      <span style={styles.categoryLabel}>{categoryInfo.label}</span>
                      {isSelected && <span style={styles.categoryArrow}>→</span>}
                    </button>
                  );
                })}
            </div>

            {/* Right Column - Themes */}
            <div style={styles.themesColumn}>
              {selectedCategoryInfo ? (
                <>
                  <div style={styles.themesHeader}>
                    <span style={styles.themesTitle}>{selectedCategoryInfo.label}</span>
                  </div>
                  {selectedCategoryThemes.map((theme) => {
                    const themeFullName = `${selectedCategoryInfo.label} - ${theme.name}`;
                    const isFree = isFreeTheme(themeFullName);
                    const isOwned = ownedThemes.has(themeFullName);
                    const isSelected = currentTheme === themeFullName;

                    return (
                      <button
                        key={theme.id}
                        style={{
                          ...styles.themeItem,
                          ...(isSelected ? styles.themeItemSelected : {}),
                        }}
                        onClick={() => handleThemeSelect(theme, selectedCategory!)}
                      >
                        <div style={styles.themeItemContent}>
                          <div style={styles.themeName}>{theme.name}</div>
                          <div style={styles.themeDescription}>{theme.description}</div>
                        </div>
                        {isFree && (
                          <span style={{ ...styles.badge, ...styles.freeBadge }}>FREE</span>
                        )}
                        {isOwned && (
                          <span style={{ ...styles.badge, ...styles.ownedBadge }}>OWNED</span>
                        )}
                        {!isFree && !isOwned && (
                          <span style={{ ...styles.badge, ...styles.lockBadge }}>🔒</span>
                        )}
                      </button>
                    );
                  })}
                </>
              ) : (
                <div style={styles.emptyState}>
                  Select a category to see themes
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Watch Ad Modal */}
      <WatchAdModal
        visible={showAdModal}
        themeName={pendingTheme || 'this theme'}
        onWatchAd={handleWatchAd}
        onClose={handleCloseAdModal}
      />
    </>
  );
};

export default GameThemePicker;
