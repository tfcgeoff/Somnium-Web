/**
 * HelpModal.web.tsx (Pure Web)
 *
 * Web version of HelpModal
 */

import React from 'react';
import { useTheme } from '../../../services/ThemeContext';
import { helpTopics, helpCategories, renderHelpText } from '../../../constants/helpContent';
import type { HelpSection } from '../../../constants/helpContent';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  topicId?: keyof typeof helpTopics;
  categoryId?: keyof typeof helpCategories;
}

const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  onClose,
  topicId,
  categoryId,
}) => {
  const { currentTheme: colors } = useTheme();
  const isCategoryView = Boolean(categoryId);

  // Render rich text for web (uses HTML elements)
  const renderRichText = (nodes: ReturnType<typeof renderHelpText>) => (
    <>
      {nodes.map((node: any) => {
        if (node.type === 'text') {
          return <span key={node.key}>{node.content}</span>;
        }
        if (node.bold && node.italic) {
          return <strong key={node.key}><em>{node.content}</em></strong>;
        }
        if (node.bold) {
          return <strong key={node.key}>{node.content}</strong>;
        }
        if (node.italic) {
          return <em key={node.key}>{node.content}</em>;
        }
        return <span key={node.key}>{node.content}</span>;
      })}
    </>
  );

  const renderSection = (section: HelpSection) => (
    <div key={section.title} style={sectionStyle}>
      <span style={{ ...sectionTitleStyle, color: colors.primary }}>{section.title}</span>
      <p style={{ ...sectionContentStyle, color: colors.textMain }}>
        {renderRichText(renderHelpText(section.content))}
      </p>
      {section.tips && (
        <div style={{ ...tipsBoxStyle, backgroundColor: `${colors.primary}10`, borderColor: colors.primary }}>
          <span style={{ ...tipsLabelStyle, color: colors.primary }}>💡 Tips:</span>
          {section.tips.map((tip, i) => (
            <p key={i} style={{ ...tipItemStyle, color: colors.textMain }}>
              {'• '}{renderRichText(renderHelpText([tip]))}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  const renderTopicLink = (topicKey: string) => {
    const topic = helpTopics[topicKey as keyof typeof helpTopics];
    if (!topic) return null;
    return (
      <button
        key={topicKey}
        style={{ ...topicLinkStyle, borderBottomColor: colors.border }}
      >
        <span style={{ ...topicLinkTextStyle, color: colors.primary }}>{topic.title}</span>
        <span style={{ ...topicLinkArrowStyle, color: colors.textMuted }}>→</span>
      </button>
    );
  };

  if (!visible) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.surface,
    zIndex: 1000,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '20px',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  };

  const closeButtonStyle: React.CSSProperties = {
    padding: 8,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const closeTextStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: '32px',
    color: colors.primary,
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
  };

  const spacerStyle: React.CSSProperties = {
    width: 60,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '0 20px 40px',
    overflowY: 'auto',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 32,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  };

  const sectionContentStyle: React.CSSProperties = {
    fontSize: 15,
    lineHeight: '22px',
  };

  const tipsBoxStyle: React.CSSProperties = {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
  };

  const tipsLabelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  };

  const tipItemStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    marginBottom: 4,
  };

  const categorySectionStyle: React.CSSProperties = {
    marginBottom: 40,
  };

  const topicLinkStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    marginBottom: 16,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  };

  const topicLinkTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
  };

  const topicLinkArrowStyle: React.CSSProperties = {
    fontSize: 18,
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  };

  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={headerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={spacerStyle}></div>
        <span style={headerTitleStyle}>
          {isCategoryView && categoryId ? helpCategories[categoryId].title : topicId ? helpTopics[topicId]?.title : 'Help'}
        </span>
        <button onClick={onClose} style={closeButtonStyle}>
          <span style={closeTextStyle}>✕</span>
        </button>
      </div>

      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {isCategoryView && categoryId ? (
          <>
            {helpCategories[categoryId].topics.map((topicKey) => (
              <div key={topicKey} style={categorySectionStyle}>
                {renderTopicLink(topicKey)}
                {renderSection(helpTopics[topicKey as keyof typeof helpTopics])}
              </div>
            ))}
          </>
        ) : topicId && helpTopics[topicId] ? (
          renderSection(helpTopics[topicId])
        ) : (
          <span style={errorTextStyle}>Help content not found.</span>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
