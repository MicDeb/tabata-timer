import { useEffect } from 'react';
import { useWorkoutStore } from '../store/workoutStore';

interface KeyboardActions {
  onStartPause: () => void;
  onReset: () => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  const updateSettings = useWorkoutStore((s) => s.updateSettings);
  const settings = useWorkoutStore((s) => s.settings);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          actions.onStartPause();
          break;
        case 'KeyR':
          e.preventDefault();
          actions.onReset();
          break;
        case 'KeyM':
          e.preventDefault();
          updateSettings({ soundEnabled: !settings.soundEnabled });
          break;
        case 'KeyV':
          e.preventDefault();
          updateSettings({ voiceEnabled: !settings.voiceEnabled });
          break;
        case 'KeyD':
          e.preventDefault();
          updateSettings({ darkMode: !settings.darkMode });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          actions.onPrevPhase();
          break;
        case 'ArrowRight':
          e.preventDefault();
          actions.onNextPhase();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, updateSettings, settings.soundEnabled, settings.voiceEnabled, settings.darkMode]);
}
