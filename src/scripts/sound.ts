// Tiny synthesized UI sound set (Web Audio, no files). Off by default; the choice
// persists in localStorage. Elements opt in with data-sfx="hover" | "click" | "both".

const KEY = 'space-sound';
type Sfx = 'tick' | 'blip' | 'confirm' | 'warp' | 'scan';

let ctx: AudioContext | null = null;
let enabled = false;
try { enabled = localStorage.getItem(KEY) === 'on'; } catch { /* storage blocked */ }

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function play(name: Sfx) {
  if (!enabled) return;
  switch (name) {
    case 'tick': tone(2400, 0.035, 'square', 0.015); break;
    case 'blip': tone(880, 0.08, 'triangle', 0.05, 1320); break;
    case 'confirm': tone(660, 0.09, 'triangle', 0.05); tone(990, 0.12, 'triangle', 0.05, undefined, 0.08); break;
    case 'scan': tone(320, 0.5, 'sine', 0.035, 1600); break;
    case 'warp': tone(90, 0.9, 'sawtooth', 0.03, 900); break;
  }
}

export function isSoundOn() { return enabled; }

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('space:sound', { detail: on }));
  if (on) play('confirm');
}

let bound = false;
export function bindSfx() {
  if (bound) return;
  bound = true;
  let lastHover: Element | null = null;
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest?.('[data-sfx="hover"], [data-sfx="both"]');
    if (el && el !== lastHover) play('tick');
    lastHover = el;
  });
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest?.('[data-sfx="click"], [data-sfx="both"]');
    if (el) play('blip');
  });
}
