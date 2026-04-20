export type WorkoutMode = 'countdown' | 'tabata' | 'rounds' | 'sequence';

export interface CountdownConfig {
  mode: 'countdown';
  totalSeconds: number;
}

export interface TabataConfig {
  mode: 'tabata';
  workSeconds: number;
  restSeconds: number;
  rounds: number;
}

export interface RoundsConfig {
  mode: 'rounds';
  roundSeconds: number;
  restSeconds: number;
  totalRounds: number;
}

export interface SequenceStep {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface SequenceConfig {
  mode: 'sequence';
  steps: SequenceStep[];
  repeatTimes: number;
}

export type WorkoutConfig = CountdownConfig | TabataConfig | RoundsConfig | SequenceConfig;

export interface TimerState {
  status: 'idle' | 'countdown' | 'running' | 'paused' | 'finished';
  secondsLeft: number;
  currentPhase: 'work' | 'rest' | 'countdown' | 'finished';
  currentRound: number;
  totalRounds: number;
  currentStepName?: string;
  nextStepName?: string;
  totalSeconds: number;
}

export interface Preset {
  id: string;
  name: string;
  config: WorkoutConfig;
  createdAt: number;
  isDefault?: boolean;
}

export interface SessionEntry {
  id: string;
  date: string;
  modeName: string;
  durationSeconds: number;
  completedRounds: number;
  finished: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  volume: number;
  darkMode: boolean;
  progressBarStyle: 'linear' | 'circular';
}
