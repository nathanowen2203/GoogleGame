import { useRef, useCallback } from 'react';

/**
 * All sounds are synthesised with the Web Audio API — no files needed.
 * Each sound function is memoised and safe to call on every render.
 */
export function useSound(muted) {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  /**
   * Play a single synthesised note.
   * @param {number}  freq      Hz
   * @param {number}  startTime seconds from now
   * @param {number}  duration  seconds
   * @param {string}  type      oscillator type
   * @param {number}  gain      peak amplitude (0–1)
   */
  function note(freq, startTime, duration, type = 'sine', gain = 0.25) {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;

    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g);
    g.connect(c.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startTime);

    // Quick attack, exponential decay
    g.gain.setValueAtTime(0.001, now + startTime);
    g.gain.linearRampToValueAtTime(gain, now + startTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration);

    osc.start(now + startTime);
    osc.stop(now + startTime + duration + 0.05);
  }

  // ── ✅ Correct answer ─────────────────────────────────────────────────────
  // Bright C-major arpeggio (C5 → E5 → G5)
  const playCorrect = useCallback(() => {
    note(523.25, 0.00, 0.18, 'sine', 0.30);
    note(659.25, 0.10, 0.18, 'sine', 0.26);
    note(783.99, 0.20, 0.30, 'sine', 0.28);
  }, [muted]);

  // ── ❌ Wrong answer ───────────────────────────────────────────────────────
  // Gentle descending two-note "doh-doh" — warm triangle, not buzzy
  const playWrong = useCallback(() => {
    note(311, 0.00, 0.22, 'triangle', 0.18); // Eb4
    note(261, 0.20, 0.30, 'triangle', 0.15); // C4
  }, [muted]);

  // ── 🃏 Card tap ───────────────────────────────────────────────────────────
  // Subtle "tick" to confirm the press
  const playTick = useCallback(() => {
    note(700, 0, 0.06, 'sine', 0.14);
    note(500, 0.04, 0.05, 'sine', 0.08);
  }, [muted]);

  // ── 🔥 Streak bonus ───────────────────────────────────────────────────────
  // Exciting ascending 4-note arpeggio
  const playStreak = useCallback(() => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      note(freq, i * 0.08, 0.18, 'sine', 0.24);
    });
  }, [muted]);

  // ── ➡️ Next round ─────────────────────────────────────────────────────────
  // Short upward "swish"
  const playNext = useCallback(() => {
    note(440, 0.00, 0.08, 'sine', 0.18);
    note(660, 0.07, 0.10, 'sine', 0.14);
  }, [muted]);

  // ── 🏁 Game over ──────────────────────────────────────────────────────────
  // Descending three-note resolution
  const playGameOver = useCallback(() => {
    [392, 330, 262].forEach((freq, i) => {
      note(freq, i * 0.20, 0.28, 'sine', 0.26);
    });
  }, [muted]);

  // ── 🏆 New personal best ──────────────────────────────────────────────────
  // "Happy Birthday" style triumph fanfare
  const playNewBest = useCallback(() => {
    const melody = [523, 523, 659, 523, 784, 740];
    const times  = [0, 0.16, 0.32, 0.50, 0.66, 0.88];
    const durs   = [0.13, 0.13, 0.13, 0.13, 0.22, 0.45];
    melody.forEach((freq, i) => note(freq, times[i], durs[i], 'sine', 0.30));
  }, [muted]);

  return { playCorrect, playWrong, playTick, playStreak, playNext, playGameOver, playNewBest };
}
