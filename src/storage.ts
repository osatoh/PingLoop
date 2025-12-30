const STORAGE_KEY = 'pingloop_settings';

export type Settings = {
  intervalMin: number;
  intervalSec: number;
  sessionMin: number;
  sessionSec: number;
};

const DEFAULT_SETTINGS: Settings = {
  intervalMin: 0,
  intervalSec: 10,
  sessionMin: 5,
  sessionSec: 0,
};

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}
