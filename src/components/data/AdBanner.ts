import { useState, useEffect } from 'react';

interface AdBannerLogicProps {
  onClose: () => void;
}

export const useAdBannerLogic = ({ onClose }: AdBannerLogicProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [adTimer, setAdTimer] = useState(10);

  useEffect(() => {
    if (adTimer > 0 && isVisible) {
      const timer = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adTimer, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return {
    isVisible,
    adTimer,
    handleClose,
  };
};
