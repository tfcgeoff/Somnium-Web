/**
 * NarrativeSettings.web.tsx
 *
 * PLATFORM: Web
 *
 * Narrative generation settings UI
 *
 * Platform Differences: None - code is identical across platforms
 */

import React from 'react';
import { useSettings } from '../../../services/SettingsContext';
import { useTheme } from '../../../services/ThemeContext'; // Keep for colors
import { settingsMenuStyles } from '../../../constants/styles';

interface NarrativeSettingsProps {
  onBack: () => void;
}

const NarrativeSettings: React.FC<NarrativeSettingsProps> = ({ onBack }) => {
  const { narrativeSettings, setNarrativeSettings } = useSettings();
  const { currentTheme: colors } = useTheme(); // Keep for colors

  // Define bounds for each setting
  const SETTINGS_BOUNDS = {
    maxNarrativeParagraphs: { min: 1, max: 10, default: 2 },
    suggestedActionsCount: { min: 1, max: 10, default: 3 },
  };

  const handleSettingChange = (key: keyof typeof narrativeSettings, value: string) => {
    const numberValue = parseInt(value, 10);
    const bounds = SETTINGS_BOUNDS[key as keyof typeof SETTINGS_BOUNDS];

    if (key === 'defaultDirectives') {
      // Directives is a text field, not a number
      setNarrativeSettings({ [key]: value });
    } else if (!isNaN(numberValue) && bounds) {
      // Clamp value between min and max bounds
      const clampedValue = Math.max(bounds.min, Math.min(bounds.max, numberValue));
      setNarrativeSettings({ [key]: clampedValue });
    }
  };

  const styles = {
    label: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.textMain,
    },
    description: {
      fontSize: 12,
      marginBottom: 8,
      color: colors.textMuted,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.textMain,
      width: '100%',
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      minHeight: 100,
      verticalAlign: 'top', // Corresponds to textAlignVertical: 'top'
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.textMain,
      width: '100%',
      resize: 'vertical', // Allow vertical resizing for textarea
    },
  };

  return (
    <div style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 20 }}>
      {/* Back button in corner */}
      <div style={{ alignItems: 'flex-start', marginBottom: 8, display: 'flex' }}>
        <button onClick={onBack} style={{ flexDirection: 'row', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <span style={{ color: colors.primary, fontSize: 20, lineHeight: '22px', marginTop: -4 }}>←</span>
          <span style={{ color: colors.primary, fontSize: 16, lineHeight: '22px', marginLeft: 4 }}>Back</span>
        </button>
      </div>

      {/* Title centered below back button */}
      <div style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12, display: 'flex', flexDirection: 'column' }}>
        <span style={{ ...settingsMenuStyles.menuTitle, color: colors.primary }}>Narrative Settings</span>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={styles.label}>Max Narrative Paragraphs</span>
          <span style={styles.description}>
            Controls the maximum length of the AI's response. (Range: 1-10, Default: 2)
          </span>
          <input
            type="number"
            style={styles.input}
            value={String(narrativeSettings.maxNarrativeParagraphs)}
            onChange={e => handleSettingChange('maxNarrativeParagraphs', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={styles.label}>Suggested Actions Count</span>
          <span style={styles.description}>
            Controls how many suggested actions the AI provides. (Range: 1-10, Default: 3)
          </span>
          <input
            type="number"
            style={styles.input}
            value={String(narrativeSettings.suggestedActionsCount)}
            onChange={e => handleSettingChange('suggestedActionsCount', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={styles.label}>Default AI Directives</span>
          <span style={styles.description}>
            Style directives that will be applied to all new stories by default. Leave empty for no default.
          </span>
          <textarea
            style={styles.textArea}
            value={narrativeSettings.defaultDirectives}
            onChange={e => handleSettingChange('defaultDirectives', e.target.value)}
            placeholder="E.g., Gritty tone, moral ambiguity, survival focus"
            placeholderTextColor={colors.textMuted} // This prop doesn't exist for textarea directly
            rows={4} // Equivalent to numberOfLines
          />
        </div>
      </div>
    </div>
  );
};

export default NarrativeSettings;
