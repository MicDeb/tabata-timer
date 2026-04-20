let audioContext: AudioContext | null = null;
export let volumeLevel = 0.8;

export function setVolume(v: number) {
  volumeLevel = Math.max(0, Math.min(1, v));
}

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function playBeep(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine'
): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volumeLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Silently fail if audio is not available
  }
}

export function playCountdownBeep(): void {
  playBeep(880, 80, 'sine');
}

export function playStartSignal(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First beep: 660Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 660;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(volumeLevel, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second beep: 880Hz
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 880;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(volumeLevel, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.33);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.33);
  } catch {
    // Silently fail
  }
}

export function playWorkEnd(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(volumeLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Silently fail
  }
}

export function playRestEnd(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(volumeLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Silently fail
  }
}

export function playTick(): void {
  playBeep(1000, 50, 'sine');
}

export function playFinishSignal(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [523, 659, 784];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const startTime = now + i * 0.22;
      gain.gain.setValueAtTime(volumeLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch {
    // Silently fail
  }
}
