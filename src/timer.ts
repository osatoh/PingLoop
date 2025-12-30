export type TimerState = 'idle' | 'running' | 'finished';

export type TimerCallbacks = {
  onStart: () => void;
  onInterval: () => void;
  onFinish: () => void;
  onTick: (intervalRemaining: number, sessionRemaining: number) => void;
};

export class Timer {
  private intervalDuration: number; // in seconds
  private sessionDuration: number; // in seconds
  private intervalRemaining: number;
  private sessionRemaining: number;
  private state: TimerState = 'idle';
  private timerId: number | null = null;
  private callbacks: TimerCallbacks;

  constructor(
    intervalSeconds: number,
    sessionSeconds: number,
    callbacks: TimerCallbacks
  ) {
    this.intervalDuration = intervalSeconds;
    this.sessionDuration = sessionSeconds;
    this.intervalRemaining = intervalSeconds;
    this.sessionRemaining = sessionSeconds;
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.state === 'running') return;

    this.state = 'running';
    this.callbacks.onStart();
    this.callbacks.onTick(this.intervalRemaining, this.sessionRemaining);

    this.timerId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick(): void {
    this.intervalRemaining--;
    this.sessionRemaining--;

    if (this.sessionRemaining <= 0) {
      this.callbacks.onTick(0, 0);
      this.finish();
      return;
    }

    if (this.intervalRemaining <= 0) {
      this.callbacks.onTick(0, this.sessionRemaining);
      this.callbacks.onInterval();
      this.intervalRemaining = this.intervalDuration;
      return; // Don't update display again this tick, show 0 state
    }

    this.callbacks.onTick(this.intervalRemaining, this.sessionRemaining);
  }

  private finish(): void {
    this.stop();
    this.state = 'finished';
    this.callbacks.onFinish();
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state = 'idle';
  }

  reset(): void {
    this.stop();
    this.intervalRemaining = this.intervalDuration;
    this.sessionRemaining = this.sessionDuration;
    this.callbacks.onTick(this.intervalRemaining, this.sessionRemaining);
  }

  getState(): TimerState {
    return this.state;
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
