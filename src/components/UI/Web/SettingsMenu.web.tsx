import React, { useState } from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { settingsMenuStyles } from '../../../constants/styles';
import ImageSettings from './ImageSettings.web';
import NarrativeSettings from './NarrativeSettings.web';
import AchievementsSettings from './AchievementsSettings.web';
import HelpSettings from './HelpSettings.web';
import EulaModal from './EulaModal.web';
import PrivacyPolicyModal from './PrivacyPolicyModal.web';
import ColorSchemeModal from './ColorSchemeModal.web';
import FontSettingsModal from './FontSettingsModal.web';
import TransparencySettingsModal from './TransparencySettingsModal.web';

interface SettingsMenuProps {
  onClose: () => void;
}

type TabType = 'interface' | 'info' | 'legal';
type ViewType = 'main' | 'image' | 'narrative' | 'achievements' | 'help';

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const { currentTheme: colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('interface');
  const [view, setView] = useState<ViewType>('main');
  const [showEula, setShowEula] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showTransparencySettings, setShowTransparencySettings] = useState(false);

  const styles = {
    tabBar: {
      display: 'flex',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      borderRightWidth: 1,
      borderRightColor: colors.border,
      cursor: 'pointer',
      background: 'none',
    },
    tabLast: {
      borderRightWidth: 0,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    navButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backgroundColor: `${colors.background}CC`,
    },
    menuContainer: {
      width: '90%',
      maxWidth: 600,
      maxHeight: '90%',
      borderRadius: 20,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    menuTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    spacer: {
      width: 50,
    },
  };

  // Tab bar component
  const TabBar = () => (
    <div style={styles.tabBar}>
      <button
        style={{
          ...styles.tab,
          borderBottomColor: activeTab === 'interface' ? colors.primary : 'transparent',
        }}
        onClick={() => setActiveTab('interface')}
      >
        <span
          style={{
            ...styles.tabText,
            color: activeTab === 'interface' ? colors.primary : colors.textMuted,
          }}
        >
          Interface
        </span>
      </button>
      <button
        style={{
          ...styles.tab,
          borderBottomColor: activeTab === 'info' ? colors.primary : 'transparent',
        }}
        onClick={() => setActiveTab('info')}
      >
        <span
          style={{
            ...styles.tabText,
            color: activeTab === 'info' ? colors.primary : colors.textMuted,
          }}
        >
          Info
        </span>
      </button>
      <button
        style={{
          ...styles.tab,
          ...styles.tabLast,
          borderBottomColor: activeTab === 'legal' ? colors.primary : 'transparent',
        }}
        onClick={() => setActiveTab('legal')}
      >
        <span
          style={{
            ...styles.tabText,
            color: activeTab === 'legal' ? colors.primary : colors.textMuted,
          }}
        >
          Legal
        </span>
      </button>
    </div>
  );

  // Tab content components
  const InterfaceTab = () => (
    <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
      <button style={styles.navButton} onClick={() => setShowColorScheme(true)}>
        <span style={{ color: colors.textMain }}>Color Scheme</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setShowFontSettings(true)}>
        <span style={{ color: colors.textMain }}>Font Settings</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setShowTransparencySettings(true)}>
        <span style={{ color: colors.textMain }}>Text Area Transparency</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setView('narrative')}>
        <span style={{ color: colors.textMain }}>Narrative Settings</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setView('image')}>
        <span style={{ color: colors.textMain }}>Image Generation Settings</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
    </div>
  );

  const InfoTab = () => (
    <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
      <button style={styles.navButton} onClick={() => setView('achievements')}>
        <span style={{ color: colors.textMain }}>Achievements</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setView('help')}>
        <span style={{ color: colors.textMain }}>Help</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
    </div>
  );

  const LegalTab = () => (
    <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
      <button style={styles.navButton} onClick={() => setShowEula(true)}>
        <span style={{ color: colors.textMain }}>End User License Agreement (EULA)</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
      <button style={styles.navButton} onClick={() => setShowPrivacy(true)}>
        <span style={{ color: colors.textMain }}>Privacy Policy</span>
        <span style={{ color: colors.primary }}>→</span>
      </button>
    </div>
  );

  const MainSettings = () => (
    <>
      <div style={{ ...styles.header, borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 16 }}>
        <button onClick={onClose} style={{ ...styles.backButton, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <span style={{ color: colors.primary, fontSize: 20, lineHeight: '20px', marginTop: -4 }}>←</span>
          <span style={{ color: colors.primary, fontSize: 18, lineHeight: '22px', marginLeft: 4 }}>Exit</span>
        </button>
        <div style={settingsMenuStyles.spacer} />
      </div>
      <div style={settingsMenuStyles.titleContainer}>
        <span style={{ ...settingsMenuStyles.menuTitle, color: colors.primary }}>App Settings</span>
      </div>
      <TabBar />
      {activeTab === 'interface' && <InterfaceTab />}
      {activeTab === 'info' && <InfoTab />}
      {activeTab === 'legal' && <LegalTab />}
    </>
  );

  const renderContent = () => {
    switch (view) {
      case 'image':
        return <ImageSettings onBack={() => setView('main')} />;
      case 'narrative':
        return <NarrativeSettings onBack={() => setView('main')} />;
      case 'achievements':
        return <AchievementsSettings onBack={() => setView('main')} />;
      case 'help':
        return <HelpSettings onBack={() => setView('main')} />;
      case 'main':
      default:
        return <MainSettings />;
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div
          style={styles.menuContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>

      {/* Legal Modals */}
      {showEula && <EulaModal onClose={() => setShowEula(false)} />}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}

      {/* Color Scheme Modal */}
      {showColorScheme && <ColorSchemeModal onClose={() => setShowColorScheme(false)} />}

      {/* Font Settings Modal */}
      {showFontSettings && <FontSettingsModal onClose={() => setShowFontSettings(false)} />}

      {/* Transparency Settings Modal */}
      {showTransparencySettings && <TransparencySettingsModal onClose={() => setShowTransparencySettings(false)} />}
    </>
  );
};

export default SettingsMenu;
