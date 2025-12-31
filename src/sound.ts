let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function ensureAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

async function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): Promise<void> {
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Start sound: ascending two-tone chime
export function playStartSound(): void {
  playTone(523.25, 0.15, 'sine', 0.3); // C5
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.3), 150); // E5
}

// Interval sound: short ping
export function playIntervalSound(): void {
  playTone(880, 0.1, 'sine', 0.25); // A5
}

// Finish sound: descending three-tone chime
export function playFinishSound(): void {
  playTone(659.25, 0.15, 'sine', 0.3); // E5
  setTimeout(() => playTone(523.25, 0.15, 'sine', 0.3), 150); // C5
  setTimeout(() => playTone(392, 0.3, 'sine', 0.3), 300); // G4
}
