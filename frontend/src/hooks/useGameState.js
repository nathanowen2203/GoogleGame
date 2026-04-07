import { useState, useCallback, useRef } from 'react';
import { fetchRound, fetchCompare } from '../utils/api';

const POINTS_PER_CORRECT   = 10;
const STREAK_BONUS_EVERY   = 3;
const TOTAL_ROUNDS         = 10;
const MIN_VALID_SEARCHES   = 1_000; // below this we consider data insufficient

export const GAME_STATES = {
  IDLE:      'idle',
  LOADING:   'loading',
  PLAYING:   'playing',
  REVEALING: 'revealing',
  GAME_OVER: 'gameover',
};

function loadBestScore() {
  try { return parseInt(localStorage.getItem('searchWars_bestScore') || '0', 10); }
  catch { return 0; }
}
function saveBestScore(s) {
  try { localStorage.setItem('searchWars_bestScore', String(s)); } catch {}
}

export function useGameState() {
  const [gameState, setGameState]       = useState(GAME_STATES.IDLE);
  const [round, setRound]               = useState(null);
  const [result, setResult]             = useState(null);
  const [selectedCountry, setSelected]  = useState(null);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [score, setScore]               = useState(0);
  const [lastPoints, setLastPoints]     = useState(0);
  const [streak, setStreak]             = useState(0);
  const [roundNumber, setRoundNumber]   = useState(0);
  const [bestScore, setBestScore]       = useState(loadBestScore);
  const [error, setError]               = useState(null);
  const [category, setCategory]         = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);

  // Played keywords this session — sent to backend to avoid repeats
  const playedKeywords   = useRef(new Set());
  // Pre-loaded next round (fetched in background while user reads result)
  const preloadedRound   = useRef(null);
  // Guard against double-click before React re-renders the disabled button
  const selectionLock    = useRef(false);

  // ── Internal: fetch a round from the API ────────────────────────────────
  const doFetchRound = useCallback(async (cat) => {
    const exclude = [...playedKeywords.current];
    return fetchRound(cat ?? null, exclude);
  }, []);

  // ── Load the next round into state ──────────────────────────────────────
  const loadNextRound = useCallback(async (cat, preloaded = null) => {
    setGameState(GAME_STATES.LOADING);
    setSelected(null);
    setIsCorrect(null);
    setResult(null);
    setLastPoints(0);
    setError(null);
    selectionLock.current = false;

    try {
      const data = preloaded ?? await doFetchRound(cat);
      playedKeywords.current.add(data.topic.keyword);
      setRound(data);
      setGameState(GAME_STATES.PLAYING);
    } catch {
      setError('Failed to load round. Is the backend running?');
      setGameState(GAME_STATES.IDLE);
    }
  }, [doFetchRound]);

  // ── Start a new game ────────────────────────────────────────────────────
  const startGame = useCallback((cat) => {
    const activeCat = cat ?? category;
    setCategory(activeCat);
    setScore(0);
    setStreak(0);
    setRoundNumber(1);
    setRoundHistory([]);
    playedKeywords.current = new Set();
    preloadedRound.current  = null;
    loadNextRound(activeCat);
  }, [category, loadNextRound]);

  // ── User picks a country ────────────────────────────────────────────────
  const selectCountry = useCallback(async (countryCode) => {
    if (gameState !== GAME_STATES.PLAYING || !round) return;
    if (selectionLock.current) return;  // prevent double-click before re-render
    selectionLock.current = true;

    setSelected(countryCode);
    setGameState(GAME_STATES.REVEALING);

    // Kick off next-round pre-fetch AND the compare in parallel
    const isLastRound = roundNumber >= TOTAL_ROUNDS;
    const [compareData, nextRoundData] = await Promise.allSettled([
      fetchCompare(round.topic.keyword, round.countryA.code, round.countryB.code),
      isLastRound ? Promise.resolve(null) : doFetchRound(category),
    ]);

    // Store pre-loaded next round (may be null if last round or failed)
    if (!isLastRound && nextRoundData.status === 'fulfilled' && nextRoundData.value) {
      preloadedRound.current = nextRoundData.value;
    }

    // Handle compare result
    if (compareData.status === 'rejected') {
      // Network error — use a fallback so the game doesn't break
      const fallbackVol = () => Math.floor(Math.random() * 400_000) + 50_000;
      const volA = fallbackVol(), volB = fallbackVol();
      const correct = Math.random() > 0.5;
      setIsCorrect(correct);
      setResult({ countryA: { code: round.countryA.code, monthlySearches: volA },
                  countryB: { code: round.countryB.code, monthlySearches: volB },
                  ratio: null, insufficientData: false, source: 'mock' });
      const pts = correct ? POINTS_PER_CORRECT : 0;
      if (correct) setScore(p => p + pts);
      else setStreak(0);
      setLastPoints(pts);
      appendHistory(round, countryCode, null, volA, volB, correct);
      selectionLock.current = false;
      return;
    }

    const data = compareData.value;
    const volA = data.countryA.monthlySearches;
    const volB = data.countryB.monthlySearches;


    setResult(data);

    const winnerCode = volA === volB ? null : volA > volB ? round.countryA.code : round.countryB.code;
    const correct    = winnerCode === null ? true : countryCode === winnerCode;

    setIsCorrect(correct);

    let pts = 0;
    if (correct) {
      const newStreak = streak + 1;
      const bonus = Math.floor(newStreak / STREAK_BONUS_EVERY) * 5;
      pts = POINTS_PER_CORRECT + bonus;
      setScore(p => p + pts);
      setStreak(newStreak);
    } else {
      setStreak(0);
    }
    setLastPoints(pts);
    appendHistory(round, countryCode, winnerCode, volA, volB, correct);
    selectionLock.current = false;

  }, [gameState, round, streak, roundNumber, category, loadNextRound, doFetchRound]);

  function appendHistory(r, pickedCode, winnerCode, volA, volB, correct) {
    setRoundHistory(prev => [...prev, {
      keyword:    r.topic.keyword,
      emoji:      r.topic.emoji,
      category:   r.topic.category,
      correct,
      pickedCode,
      winnerCode,
      countryA:   r.countryA,
      countryB:   r.countryB,
      volA, volB,
    }]);
  }

  // ── Advance to the next round (or end game) ──────────────────────────────
  const nextRound = useCallback(() => {
    if (roundNumber >= TOTAL_ROUNDS) {
      setBestScore(prev => {
        const nb = Math.max(prev, score);
        saveBestScore(nb);
        return nb;
      });
      setGameState(GAME_STATES.GAME_OVER);
    } else {
      const preloaded = preloadedRound.current;
      preloadedRound.current = null;
      setRoundNumber(p => p + 1);
      loadNextRound(category, preloaded);
    }
  }, [roundNumber, score, category, loadNextRound]);

  // ── Reset to home ────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setGameState(GAME_STATES.IDLE);
    setRound(null);
    setResult(null);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setStreak(0);
    setRoundNumber(0);
    setLastPoints(0);
    setError(null);
    setRoundHistory([]);
    playedKeywords.current  = new Set();
    preloadedRound.current  = null;
    selectionLock.current   = false;
  }, []);

  return {
    gameState, GAME_STATES,
    round, result, selectedCountry, isCorrect,
    score, lastPoints, streak,
    roundNumber, totalRounds: TOTAL_ROUNDS,
    bestScore, error,
    category, setCategory,
    roundHistory,
    startGame, selectCountry, nextRound, resetGame,
  };
}
