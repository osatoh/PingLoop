import './style.css';
import { Timer, formatTime } from './timer';
import { playStartSound, playIntervalSound, playFinishSound, ensureAudioContext } from './sound';
import { loadSettings, saveSettings } from './storage';

const intervalMinInput = document.getElementById('interval-min') as HTMLInputElement;
const intervalSecInput = document.getElementById('interval-sec') as HTMLInputElement;
const sessionMinInput = document.getElementById('session-min') as HTMLInputElement;
const sessionSecInput = document.getElementById('session-sec') as HTMLInputElement;
const intervalDisplay = document.getElementById('interval-display') as HTMLSpanElement;
const sessionDisplay = document.getElementById('session-display') as HTMLSpanElement;
const intervalProgress = document.querySelector('#interval-progress') as SVGCircleElement;
const sessionProgress = document.querySelector('#session-progress') as SVGCircleElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const settingsDiv = document.getElementById('settings') as HTMLDivElement;

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

let timer: Timer | null = null;
let intervalDuration = 0;
let sessionDuration = 0;

function setProgress(circle: SVGCircleElement, progress: number): void {
  const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
  circle.style.strokeDashoffset = String(offset);
}

function getIntervalSeconds(): number {
  const min = parseInt(intervalMinInput.value, 10) || 0;
  const sec = parseInt(intervalSecInput.value, 10) || 0;
  return min * 60 + sec;
}

function getSessionSeconds(): number {
  const min = parseInt(sessionMinInput.value, 10) || 0;
  const sec = parseInt(sessionSecInput.value, 10) || 0;
  return min * 60 + sec;
}

function loadSavedSettings(): void {
  const settings = loadSettings();
  intervalMinInput.value = String(settings.intervalMin);
  intervalSecInput.value = String(settings.intervalSec);
  sessionMinInput.value = String(settings.sessionMin);
  sessionSecInput.value = String(settings.sessionSec);
  updateDisplayFromInputs();
}

function updateDisplayFromInputs(): void {
  intervalDisplay.textContent = formatTime(getIntervalSeconds());
  sessionDisplay.textContent = formatTime(getSessionSeconds());
  setProgress(intervalProgress, 1);
  setProgress(sessionProgress, 1);
}

function clampValue(input: HTMLInputElement): void {
  let value = parseInt(input.value, 10) || 0;
  const min = parseInt(input.min, 10) || 0;
  const max = parseInt(input.max, 10) || 59;
  value = Math.max(min, Math.min(max, value));
  input.value = String(value);
}

function handleArrowKeys(e: KeyboardEvent): void {
  const input = e.target as HTMLInputElement;
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    let value = parseInt(input.value, 10) || 0;
    const max = parseInt(input.max, 10) || 59;
    input.value = String(Math.min(max, value + 1));
    updateDisplayFromInputs();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    let value = parseInt(input.value, 10) || 0;
    const min = parseInt(input.min, 10) || 0;
    input.value = String(Math.max(min, value - 1));
    updateDisplayFromInputs();
  }
}

function startTimer(): void {
  intervalDuration = getIntervalSeconds();
  sessionDuration = getSessionSeconds();

  if (intervalDuration <= 0 || sessionDuration <= 0) {
    alert('Please set valid times greater than 0');
    return;
  }

  saveSettings({
    intervalMin: parseInt(intervalMinInput.value, 10) || 0,
    intervalSec: parseInt(intervalSecInput.value, 10) || 0,
    sessionMin: parseInt(sessionMinInput.value, 10) || 0,
    sessionSec: parseInt(sessionSecInput.value, 10) || 0,
  });

  ensureAudioContext();

  timer = new Timer(intervalDuration, sessionDuration, {
    onStart: () => {
      playStartSound();
      startBtn.disabled = true;
      settingsDiv.classList.add('hidden');
    },
    onInterval: () => {
      playIntervalSound();
    },
    onFinish: () => {
      playFinishSound();
      startBtn.disabled = false;
      startBtn.textContent = 'Start';
      settingsDiv.classList.remove('hidden');
      updateDisplayFromInputs();
    },
    onTick: (intervalRemaining, sessionRemaining) => {
      intervalDisplay.textContent = formatTime(intervalRemaining);
      sessionDisplay.textContent = formatTime(sessionRemaining);
      setProgress(intervalProgress, intervalRemaining / intervalDuration);
      setProgress(sessionProgress, sessionRemaining / sessionDuration);
    },
  });

  timer.start();
}

function resetTimer(): void {
  if (timer) {
    timer.stop();
    timer = null;
  }
  startBtn.disabled = false;
  startBtn.textContent = 'Start';
  settingsDiv.classList.remove('hidden');
  updateDisplayFromInputs();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

const allInputs = [intervalMinInput, intervalSecInput, sessionMinInput, sessionSecInput];
allInputs.forEach(input => {
  input.addEventListener('input', () => {
    clampValue(input);
    updateDisplayFromInputs();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startTimer();
    } else {
      handleArrowKeys(e);
    }
  });
});

loadSavedSettings();
