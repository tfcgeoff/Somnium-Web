/**
 * @platform web
 *
 * PART OF PLATFORM-SPLIT COMPONENT
 * Counterpart: AchievementsSettings.native.tsx
 *
 * ⚠️ MAINTENANCE REQUIRED ⚠️
 * When editing this file:
 * 1. Review AchievementsSettings.native.tsx for counterpart changes
 * 2. Apply changes to BOTH files unless platform-specific
 * 3. Update this header comment if adding new differences
 *
 * Key Differences:
 * - Now uses react-native-svg for circular progress rings around achievement icons
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../services/ThemeContext';
import { useAchievements } from '../../../services/AchievementsContext';
import { settingsMenuStyles } from '../../../constants/styles';

interface AchievementsSettingsProps {
  onBack: () => void;
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const getProgress = (
  achievement: { requirement: { type: string; value: number } },
  stats: {
    totalTurns: number;
    totalPlaytimeMs: number;
    totalStoriesPlayed: number;
    longestSessionMs: number;
    currentSessionMs: number;
    totalWords: number;
    themesPlayed: string[];
  }
): { current: number; max: number; label: string } => {
  const { type, value } = achievement.requirement;

  switch (type) {
    case 'turns':
      return {
        current: stats.totalTurns,
        max: value,
        label: `${stats.totalTurns} / ${value} turns`,
      };
    case 'playtime':
      return {
        current: stats.totalPlaytimeMs,
        max: value,
        label: `${formatTime(stats.totalPlaytimeMs)} / ${formatTime(value)}`,
      };
    case 'stories':
      return {
        current: stats.totalStoriesPlayed,
        max: value,
        label: `${stats.totalStoriesPlayed} / ${value} stories`,
      };
    case 'single_session':
      return {
        current: stats.currentSessionMs,
        max: value,
        label: `${formatTime(stats.currentSessionMs)} / ${formatTime(value)}`,
      };
    case 'words':
    case 'total_words':
      return {
        current: stats.totalWords,
        max: value,
        label: `${stats.totalWords.toLocaleString()} / ${value.toLocaleString()} words`,
      };
    case 'themes':
      return {
        current: stats.themesPlayed.length,
        max: value,
        label: `${stats.themesPlayed.length} / ${value} themes`,
      };
    default:
      return { current: 0, max: value, label: '0 / ' + value };
  }
};

const AchievementIcon: React.FC<{
  unlocked: boolean;
  requirement: { type: string; value: number };
  stats: {
    totalTurns: number;
    totalPlaytimeMs: number;
    totalStoriesPlayed: number;
    longestSessionMs: number;
    currentSessionMs: number;
    totalWords: number;
    themesPlayed: string[];
  };
}> = ({ unlocked, requirement, stats }) => {
  const { currentTheme: colors } = useTheme();
  const progress = getProgress({ requirement }, stats);
  const progressPercent = Math.min((progress.current / progress.max) * 100, 100);

  const getEmoji = () => {
    if (requirement.type === 'turns') {
      if (requirement.value >= 500) return '🧠'; // Brain emoji for high turns
      if (requirement.value >= 100) return '✍️'; // Writing hand for medium turns
      return '📖'; // Open book for low turns
    }
    if (requirement.type === 'playtime') {
      if (requirement.value >= 10 * 60 * 60 * 1000) return '⏳'; // Hourglass for long playtime
      if (requirement.value >= 5 * 60 * 60 * 1000) return '🎮'; // Game controller for medium playtime
      if (requirement.value >= 2 * 60 * 60 * 1000) return '⏰'; // Alarm clock for short playtime
      return '⏱️'; // Stopwatch for very short playtime
    }
    if (requirement.type === 'stories') {
      if (requirement.value >= 20) return '🗺️'; // Map for many stories
      return '📚'; // Books for few stories
    }
    if (requirement.type === 'single_session') return '⚡'; // Lightning for single session
    if (requirement.type === 'words' || requirement.type === 'total_words') return '📝'; // Memo for words
    if (requirement.type === 'themes') return '🎨'; // Palette for themes
    return '⭐'; // Star as default
  };

  // Calculate SVG circle properties for circular progress
  const circleSize = 56;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
        backgroundColor: unlocked ? colors.primary : colors.background,
        borderColor: colors.border,
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {!unlocked && (
        <svg
          width={circleSize}
          height={circleSize}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* Background circle (track) */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.3}
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          />
        </svg>
      )}
      <span style={{ opacity: unlocked ? 1 : 0.3, fontSize: 28 }}>
        {getEmoji()}
      </span>
    </div>
  );
};

const AchievementsSettings: React.FC<AchievementsSettingsProps> = ({ onBack }) => {
  const { currentTheme: colors } = useTheme();
  const { achievements, stats, unlockedCount, totalCount, resetAchievements } = useAchievements();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleReset = () => {
    resetAchievements();
    setShowResetModal(false);
  };

  const styles = {
    statsCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      marginBottom: 20,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    statsTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
      color: colors.primary,
    },
    statsGrid: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textMain,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 4,
      color: colors.textMuted,
    },
    progressOverview: {
      marginBottom: 24,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
      color: colors.textMain,
    },
    progressBar: {
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    progressFill: {
      height: '100%',
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      color: colors.textMuted,
    },
    achievementCard: {
      display: 'flex',
      flexDirection: 'row',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      alignItems: 'center',
    },
    achievementInfo: {
      flex: 1,
    },
    achievementHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    achievementName: {
      fontSize: 16,
      fontWeight: '600',
    },
    unlockedBadge: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    achievementDesc: {
      fontSize: 13,
      marginBottom: 4,
      color: colors.textMuted,
    },
    achievementProgress: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
    },
    lockedReason: {
      fontSize: 11,
      marginTop: 2,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    comingSoonCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      marginTop: 8,
      alignItems: 'center',
      backgroundColor: `${colors.primary}10`,
      borderColor: colors.primary,
    },
    comingSoonText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.primary,
    },
    comingSoonDesc: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.textMuted,
    },
    bottomSpacer: {
      height: 20,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    },
    modalContent: {
      width: '85%',
      maxWidth: 350,
      borderRadius: 16,
      borderWidth: 1,
      padding: 24,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.textMain,
    },
    modalMessage: {
      fontSize: 14,
      marginBottom: 24,
      lineHeight: '20px',
      color: colors.textMuted,
    },
    modalButtons: {
      display: 'flex',
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
    },
    modalButtonCancel: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    modalButtonConfirm: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalButtonCancelText: {
      color: colors.textMain,
    },
    modalButtonConfirmText: {
      color: colors.background,
    },
  };

  return (
    <>
      <div style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 20 }}>
        {/* Back button in corner, Reset button on right */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button onClick={onBack} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.primary, fontSize: 20, lineHeight: '22px', marginTop: -4 }}>←</span>
            <span style={{ color: colors.primary, fontSize: 16, lineHeight: '22px', marginLeft: 4 }}>Back</span>
          </button>
          <button onClick={() => setShowResetModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ color: colors.textMuted, fontSize: 12 }}>Reset</span>
          </button>
        </div>

        {/* Title centered below */}
        <div style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12, display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...settingsMenuStyles.menuTitle, color: colors.primary }}>Achievements</span>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* Stats Summary */}
          <div style={styles.statsCard}>
            <span style={styles.statsTitle}>Your Journey</span>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {stats.totalTurns}
                </span>
                <span style={styles.statLabel}>Turns Taken</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {formatTime(stats.totalPlaytimeMs)}
                </span>
                <span style={styles.statLabel}>Total Playtime</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {stats.totalStoriesPlayed}
                </span>
                <span style={styles.statLabel}>Stories Played</span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div style={styles.progressOverview}>
            <span style={styles.progressText}>
              {unlockedCount} of {totalCount} Achievements Unlocked
            </span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(unlockedCount / totalCount) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Achievements List */}
          <span style={styles.sectionLabel}>Achievements</span>
          {achievements.map(achievement => {
            const progress = getProgress(achievement, stats);
            const isLockedByPrereqs = !achievement.unlocked && achievement.lockedReason;

            return (
              <div
                key={achievement.id}
                style={{
                  ...styles.achievementCard,
                  backgroundColor: achievement.unlocked
                    ? `${colors.primary}15`
                    : colors.background,
                  borderColor: achievement.unlocked ? colors.primary : colors.border,
                  opacity: achievement.unlocked ? 1 : (isLockedByPrereqs ? 0.4 : 0.7),
                }}
              >
                <AchievementIcon
                  unlocked={achievement.unlocked}
                  requirement={achievement.requirement}
                  stats={stats}
                />
                <div style={styles.achievementInfo}>
                  <div style={styles.achievementHeader}>
                    <span
                      style={{
                        ...styles.achievementName,
                        color: achievement.unlocked ? colors.primary : colors.textMain,
                      }}
                    >
                      {achievement.name}
                    </span>
                    {achievement.unlocked && (
                      <span style={{ ...styles.unlockedBadge, color: colors.primary }}>✓</span>
                    )}
                  </div>
                  <span style={{ ...styles.achievementDesc, color: colors.textMuted }}>
                    {achievement.description}
                  </span>
                  <span style={{ ...styles.achievementProgress, color: colors.textMuted }}>
                    {progress.label}
                  </span>
                  {isLockedByPrereqs && (
                    <span style={{ ...styles.lockedReason, color: colors.textMuted, fontStyle: 'italic' }}>
                      {achievement.lockedReason}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Coming Soon Notice */}
          <div style={styles.comingSoonCard}>
            <span style={styles.comingSoonText}>
              Rewards Coming Soon!
            </span>
            <span style={styles.comingSoonDesc}>
              Unlock special rewards as you achieve milestones. Stay tuned for bonus features!
            </span>
          </div>

          <div style={styles.bottomSpacer} />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && createPortal(
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <span style={styles.modalTitle}>
              Reset Achievements?
            </span>
            <span style={styles.modalMessage}>
              This will reset all your achievements and gameplay statistics. This action cannot be
              undone.
            </span>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.modalButtonCancel }}
                onClick={() => setShowResetModal(false)}
              >
                <span style={{ ...styles.modalButtonText, ...styles.modalButtonCancelText }}>Cancel</span>
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.modalButtonConfirm }}
                onClick={handleReset}
              >
                <span style={{ ...styles.modalButtonText, ...styles.modalButtonConfirmText }}>Reset</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AchievementsSettings;
