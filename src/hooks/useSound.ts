import { useCallback } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import {
  playCountdownBeep,
  playStartSignal,
  playWorkEnd,
  playRestEnd,
  playTick,
  playFinishSignal,
  setVolume,
} from '../utils/soundUtils';

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pl-PL';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function useSound() {
  const settings = useWorkoutStore((s) => s.settings);

  const withSound = useCallback(
    (fn: () => void) => {
      if (settings.soundEnabled) {
        setVolume(settings.volume / 100);
        fn();
      }
    },
    [settings.soundEnabled, settings.volume]
  );

  const withVoice = useCallback(
    (text: string) => {
      if (settings.voiceEnabled) {
        speak(text);
      }
    },
    [settings.voiceEnabled]
  );

  const beepCountdown = useCallback(
    (num?: number) => {
      withSound(playCountdownBeep);
      if (num !== undefined) {
        withVoice(String(num));
      }
    },
    [withSound, withVoice]
  );

  const beepStart = useCallback(() => {
    withSound(playStartSignal);
    withVoice('Start!');
  }, [withSound, withVoice]);

  const beepWorkEnd = useCallback(() => {
    withSound(playWorkEnd);
  }, [withSound]);

  const beepRestEnd = useCallback(() => {
    withSound(playRestEnd);
  }, [withSound]);

  const tick = useCallback(() => {
    withSound(playTick);
  }, [withSound]);

  const beepFinish = useCallback(() => {
    withSound(playFinishSignal);
    withVoice('Koniec treningu!');
  }, [withSound, withVoice]);

  const announcePhase = useCallback(
    (phase: 'work' | 'rest', stepName?: string) => {
      if (phase === 'work') {
        withVoice(stepName ? stepName : 'Praca!');
      } else {
        withVoice('Odpoczynek!');
      }
    },
    [withVoice]
  );

  return {
    beepCountdown,
    beepStart,
    beepWorkEnd,
    beepRestEnd,
    tick,
    beepFinish,
    announcePhase,
  };
}
