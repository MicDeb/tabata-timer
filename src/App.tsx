import React, { useCallback, useEffect, useRef } from 'react';
import { useWorkoutStore } from './store/workoutStore';
import { useWorkout } from './hooks/useWorkout';
import { useSound } from './hooks/useSound';
import { useWakeLock } from './hooks/useWakeLock';
import { useHistory } from './hooks/useHistory';
import { useKeyboard } from './hooks/useKeyboard';

import { TimerDisplay } from './components/Timer/TimerDisplay';
import { TimerControls } from './components/Timer/TimerControls';
import { CountdownConfig } from './components/Config/CountdownConfig';
import { TabataConfig } from './components/Config/TabataConfig';
import { RoundsConfig } from './components/Config/RoundsConfig';
import { SequenceConfig } from './components/Config/SequenceConfig';
import { PresetManager } from './components/Config/PresetManager';
import { SessionHistory } from './components/History/SessionHistory';
import { ThemeToggle } from './components/Layout/ThemeToggle';
import { WakeLockIndicator } from './components/Layout/WakeLockIndicator';

import type {
  WorkoutMode,
  WorkoutConfig,
  CountdownConfig as CountdownConfigType,
  TabataConfig as TabataConfigType,
  RoundsConfig as RoundsConfigType,
  SequenceConfig as SequenceConfigType,
} from './types/workout';

const MODE_LABELS: Record<WorkoutMode, string> = {
  countdown: 'Odliczanie',
  tabata: 'Tabata',
  rounds: 'Rundy',
  sequence: 'Sekwencja',
};

function getModeName(config: WorkoutConfig): string {
  const labels: Record<string, string> = {
    countdown: 'Odliczanie',
    tabata: 'Tabata',
    rounds: 'Rundy',
    sequence: 'Sekwencja',
  };
  return labels[config.mode] ?? config.mode;
}

export default function App() {
  const { config, mode, settings, setConfig, setMode, updateSettings } = useWorkoutStore();
  const { beepCountdown, beepStart, beepWorkEnd, beepRestEnd, tick, beepFinish, announcePhase } =
    useSound();
  const wakeLock = useWakeLock();
  const { history, addEntry, clearHistory } = useHistory();

  const sessionStartRef = useRef<number>(0);
  const roundsCompletedRef = useRef(0);

  // Apply dark mode to document on mount and settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const callbacks = {
    onCountdownBeep: useCallback((num: number) => {
      beepCountdown(num);
    }, [beepCountdown]),

    onStart: useCallback(() => {
      beepStart();
      sessionStartRef.current = Date.now();
      roundsCompletedRef.current = 0;
    }, [beepStart]),

    onWorkEnd: useCallback(() => {
      beepWorkEnd();
    }, [beepWorkEnd]),

    onRestEnd: useCallback(() => {
      beepRestEnd();
    }, [beepRestEnd]),

    onTick: useCallback(() => {
      tick();
    }, [tick]),

    onFinish: useCallback(() => {
      beepFinish();
      wakeLock.release();
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      addEntry({
        id: `session-${Date.now()}`,
        date: new Date().toISOString(),
        modeName: getModeName(config),
        durationSeconds: duration,
        completedRounds: roundsCompletedRef.current,
        finished: true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [beepFinish, addEntry]),

    onPhaseChange: useCallback(
      (phase: 'work' | 'rest', stepName?: string) => {
        announcePhase(phase, stepName);
        if (phase === 'work') {
          roundsCompletedRef.current += 1;
        }
      },
      [announcePhase]
    ),
  };

  const { timerState, startWorkout, pauseWorkout, resetWorkout, nextPhase, prevPhase } = useWorkout(
    config,
    callbacks
  );

  const isRunning = timerState.status === 'running' || timerState.status === 'countdown';

  const handleStartPause = useCallback(() => {
    if (isRunning) {
      pauseWorkout();
    } else if (timerState.status === 'paused' || timerState.status === 'idle') {
      startWorkout();
      wakeLock.acquire();
    }
  }, [isRunning, timerState.status, startWorkout, pauseWorkout, wakeLock]);

  const handleReset = useCallback(() => {
    if (timerState.status !== 'idle' && timerState.status !== 'finished') {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (duration > 3) {
        addEntry({
          id: `session-${Date.now()}`,
          date: new Date().toISOString(),
          modeName: getModeName(config),
          durationSeconds: duration,
          completedRounds: roundsCompletedRef.current,
          finished: false,
        });
      }
    }
    wakeLock.release();
    resetWorkout();
  }, [timerState.status, resetWorkout, wakeLock, addEntry, config]);

  useKeyboard({
    onStartPause: handleStartPause,
    onReset: handleReset,
    onPrevPhase: prevPhase,
    onNextPhase: nextPhase,
  });

  const handleModeChange = (newMode: WorkoutMode) => {
    if (isRunning) return;
    setMode(newMode);
    if (newMode === 'countdown') {
      setConfig({ mode: 'countdown', totalSeconds: 600 });
    } else if (newMode === 'tabata') {
      setConfig({ mode: 'tabata', workSeconds: 40, restSeconds: 20, rounds: 8 });
    } else if (newMode === 'rounds') {
      setConfig({ mode: 'rounds', roundSeconds: 180, restSeconds: 60, totalRounds: 5 });
    } else if (newMode === 'sequence') {
      setConfig({
        mode: 'sequence',
        steps: [
          { id: 'step-1', name: 'Przysiady', durationSeconds: 30 },
          { id: 'step-2', name: 'Pompki', durationSeconds: 30 },
          { id: 'step-3', name: 'Deska', durationSeconds: 30 },
        ],
        repeatTimes: 3,
      });
    }
  };

  const handleLoadPreset = (presetConfig: WorkoutConfig) => {
    if (isRunning) return;
    setConfig(presetConfig);
    setMode(presetConfig.mode);
    resetWorkout();
  };

  const renderConfigForm = () => {
    if (config.mode === 'countdown') {
      return (
        <CountdownConfig
          config={config as CountdownConfigType}
          onChange={(c) => setConfig(c)}
        />
      );
    }
    if (config.mode === 'tabata') {
      return (
        <TabataConfig
          config={config as TabataConfigType}
          onChange={(c) => setConfig(c)}
        />
      );
    }
    if (config.mode === 'rounds') {
      return (
        <RoundsConfig
          config={config as RoundsConfigType}
          onChange={(c) => setConfig(c)}
        />
      );
    }
    if (config.mode === 'sequence') {
      return (
        <SequenceConfig
          config={config as SequenceConfigType}
          onChange={(c) => setConfig(c)}
        />
      );
    }
    return null;
  };

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="text-lg font-bold text-orange-400">⏱ Biurowy Timer</span>
          <div className="flex items-center gap-2">
            <WakeLockIndicator isActive={wakeLock.isActive} />
            <SessionHistory history={history} onClear={clearHistory} />
            <ThemeToggle />
            <button
              onClick={toggleFullscreen}
              className="btn-secondary p-2"
              aria-label={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
              title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Timer panel */}
          <div className="flex-1 flex flex-col gap-4">
            <TimerDisplay
              timerState={timerState}
              progressBarStyle={settings.progressBarStyle}
            />
            <TimerControls
              timerState={timerState}
              onStartPause={handleStartPause}
              onReset={handleReset}
              onPrevPhase={prevPhase}
              onNextPhase={nextPhase}
            />

            {/* Sound/settings controls */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`btn-icon ${settings.soundEnabled ? 'text-white' : 'text-gray-600'}`}
                aria-label={settings.soundEnabled ? 'Wycisz (M)' : 'Włącz dźwięk (M)'}
                title={settings.soundEnabled ? 'Wycisz (M)' : 'Włącz dźwięk (M)'}
              >
                {settings.soundEnabled ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4m4 4l4-4M9.536 8.464A5 5 0 009 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {settings.soundEnabled && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                  </svg>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.volume}
                    className="w-24 accent-orange-500"
                    onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
                    aria-label="Głośność"
                  />
                </div>
              )}

              <button
                onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
                className={`btn-icon ${settings.voiceEnabled ? 'text-blue-400' : 'text-gray-600'}`}
                aria-label={settings.voiceEnabled ? 'Wyłącz głos (V)' : 'Włącz głos (V)'}
                title={settings.voiceEnabled ? 'Głos wł. (V)' : 'Głos wył. (V)'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <button
                onClick={() =>
                  updateSettings({
                    progressBarStyle: settings.progressBarStyle === 'linear' ? 'circular' : 'linear',
                  })
                }
                className="btn-icon text-gray-400 hover:text-white"
                aria-label="Zmień styl paska postępu"
                title={`Pasek: ${settings.progressBarStyle}`}
              >
                {settings.progressBarStyle === 'linear' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Config sidebar */}
          <div
            className={`lg:w-80 xl:w-96 transition-all duration-300 ${
              isRunning ? 'hidden lg:block lg:opacity-50 lg:pointer-events-none' : 'block'
            }`}
          >
            <div className="bg-gray-900 rounded-2xl p-4 space-y-5 border border-gray-800">
              {/* Mode tabs */}
              <div className="flex rounded-lg overflow-hidden border border-gray-700">
                {(Object.keys(MODE_LABELS) as WorkoutMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    disabled={isRunning}
                    className={`flex-1 text-xs py-2 px-1 font-medium transition-colors ${
                      mode === m
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>

              {renderConfigForm()}

              <div className="border-t border-gray-800 pt-4">
                <PresetManager currentConfig={config} onLoad={handleLoadPreset} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Keyboard shortcuts hint */}
      <footer className="fixed bottom-2 right-2 text-xs text-gray-700 hidden md:block select-none">
        Spacja=start/pauza &bull; R=reset &bull; ←→=faza &bull; M=mute &bull; V=głos &bull; D=tryb
      </footer>
    </div>
  );
}
