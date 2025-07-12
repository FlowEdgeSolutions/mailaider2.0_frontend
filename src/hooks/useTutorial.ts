import { useState, useEffect } from 'react';

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user is visiting for the first time
    const hasSeenTutorial = localStorage.getItem('mailaider-tutorial-completed');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('mailaider-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('mailaider-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  return {
    showTutorial,
    handleTutorialComplete,
    handleTutorialSkip
  };
}