import { useState, useEffect } from 'react';

export function useTutorial(mode?: 'read' | 'compose') {
  const storageKey = mode === 'compose' ? 'mailaider-tutorial-compose-completed' : mode === 'read' ? 'mailaider-tutorial-read-completed' : 'mailaider-tutorial-completed';
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user is visiting for the first time in this mode
    const hasSeenTutorial = localStorage.getItem(storageKey);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [storageKey]);

  const handleTutorialComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTutorial(false);
  };

  return {
    showTutorial,
    handleTutorialComplete,
    handleTutorialSkip
  };
}