import React, { useEffect } from 'react';
import { commonStyles } from '../../../../constants/styles';
import { useTheme } from '../../../../services/ThemeContext';

interface AdBannerProps {
  onClose: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = React.memo(({ onClose }) => {
  const { currentTheme: colors } = useTheme();

  // Load the ad script when component mounts
  useEffect(() => {
    // Create the atOptions configuration
    (window as any).atOptions = {
      'key': 'da6256d146fee7a77b11f71c025bd64a',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    // Create and inject the ad script
    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/da6256d146fee7a77b11f71c025bd64a/invoke.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const styles = {
    bannerContainer: {
      ...commonStyles.bannerContainer,
      backgroundColor: colors.surface,
      borderColor: `${colors.primary}4D`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px 0',
    },
  };

  return (
    <div style={styles.bannerContainer}>
      {/* Ad will be injected here by the script */}
      <div id="da6256d146fee7a77b11f71c025bd64a"></div>
    </div>
  );
});
