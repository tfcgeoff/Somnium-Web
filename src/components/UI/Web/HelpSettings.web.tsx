/**
 * HelpSettings.web.tsx
 *
 * Web version of HelpSettings - identical functionality to native version.
 */

import React, { useState } from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { settingsMenuStyles } from '../../../constants/styles';
import HelpModal from './HelpModal.web';
import { helpCategories } from '../../../constants/helpContent';

interface HelpSettingsProps {
  onBack: () => void;
}

const HelpSettings: React.FC<HelpSettingsProps> = ({ onBack }) => {
  const { currentTheme: colors } = useTheme();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof helpCategories>();

  const handleCategoryPress = (categoryKey: keyof typeof helpCategories) => {
    setSelectedCategory(categoryKey);
    setShowHelpModal(true);
  };

  const styles = {
    categoryCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    categoryDesc: {
      fontSize: 13,
      marginRight: 8,
    },
    categoryArrow: {
      fontSize: 18,
    },
    bottomSpacer: {
      height: 20,
    },
  };

  return (
    <>
      <div style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 20 }}>
        {/* Back button in corner */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button onClick={onBack} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.primary, fontSize: 20, lineHeight: '22px', marginTop: -4 }}>←</span>
            <span style={{ color: colors.primary, fontSize: 16, lineHeight: '22px', marginLeft: 4 }}>Back</span>
          </button>
          <div style={settingsMenuStyles.spacer} />
        </div>

        {/* Title centered below */}
        <div style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12 }}>
          <span style={{ ...settingsMenuStyles.menuTitle, color: colors.primary }}>Help</span>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* Help Categories */}
          {Object.entries(helpCategories).map(([key, category]) => (
            <button
              key={key}
              style={{
                ...styles.categoryCard,
                backgroundColor: colors.background,
                borderColor: colors.border,
                cursor: 'pointer',
              }}
              onClick={() => handleCategoryPress(key as keyof typeof helpCategories)}
            >
              <span style={{ ...styles.categoryTitle, color: colors.primary }}>{category.title}</span>
              <span style={{ ...styles.categoryDesc, color: colors.textMuted }}>
                {category.topics.length} {category.topics.length === 1 ? 'topic' : 'topics'}
              </span>
              <span style={{ ...styles.categoryArrow, color: colors.textMuted }}>→</span>
            </button>
          ))}

          <div style={styles.bottomSpacer} />
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        categoryId={selectedCategory}
      />
    </>
  );
};

export default HelpSettings;
