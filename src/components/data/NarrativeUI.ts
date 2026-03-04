import { useState, useRef, useEffect } from 'react';
import type { GameState } from '../../constants/types';

interface KeyboardEventLike {
  key: string;
  shiftKey: boolean;
  preventDefault?: () => void;
}

interface NarrativeUILogicProps {
  gameState: GameState;
  onSendMessage: (text: string) => void;
  onSilentContinue?: () => void; // Optional: Continue without adding user message
  isLoading: boolean;
  isDebug: boolean;
}

export const useNarrativeLogic = ({
  gameState,
  onSendMessage,
  onSilentContinue,
  isLoading,
  isDebug,
}: NarrativeUILogicProps) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [gameState.history, isLoading]);

  const handleSend = () => {
    if (!isLoading) {
      const trimmedInput = inputText.trim();

      if (trimmedInput !== '') {
        // User typed input - send it as a message
        onSendMessage(trimmedInput);
      } else if (onSilentContinue) {
        // Empty input - use silent continue (no user message added)
        onSilentContinue();
      } else {
        // Fallback: send empty string (legacy behavior)
        onSendMessage('');
      }

      setInputText('');
    }
  };

  const handleKeyPress = (e: KeyboardEventLike) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.preventDefault) e.preventDefault();
      handleSend();
    }
  };

  return {
    inputText,
    setInputText,
    scrollRef,
    handleSend,
    handleKeyPress,
  };
};
