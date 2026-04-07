import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import GameBackground from './GameBackground';
import HomeBackground from './HomeBackground';
import Header from './Header';
import TopicBadge from './TopicBadge';
import CountryCard from './CountryCard';
import ResultBanner from './ResultBanner';
import GameOverScreen from './GameOverScreen';
import FloatingScore from './FloatingScore';
import { useGameState } from '../hooks/useGameState';
import { useSound } from '../hooks/useSound';

// ── Mute button ──────────────────────────────────────────────────────────────
function MuteButton({ muted, onToggle }) {
  return (
    <motion.button onClick={onToggle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 100,
        background: 'rgba(8,12,24,0.7)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%',
        width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, cursor: 'pointer', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
      {muted ? '🔇' : '🔊'}
    </motion.button>
  );
}

// ── Google-color wordmark ────────────────────────────────────────────────────
function Wordmark() {
  const letters = [
    ['S','#4285F4'],['e','#EA4335'],['a','#FBBC05'],['r','#34A853'],
    ['c','#4285F4'],['h','#EA4335'],[' ','transparent'],
    ['W','#FBBC05'],['a','#34A853'],['r','#4285F4'],['s','#EA4335'],
  ];
  return (
    <div style={{ fontSize: 'clamp(46px,11vw,76px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.025em' }}>
      {letters.map(([ch, color], i) => (
        <motion.span key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.045, duration: 0.28 }} style={{ color }}>
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

// ── Category pill ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: null,            label: 'All',           emoji: '🌍' },
  { id: 'Music',         label: 'Music',         emoji: '🎵' },
  { id: 'Sports',        label: 'Sports',        emoji: '⚽' },
  { id: 'Tech',          label: 'Tech',          emoji: '💻' },
  { id: 'Entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'Lifestyle',     label: 'Lifestyle',     emoji: '✨' },
  { id: 'People',        label: 'People',        emoji: '⭐' },
  { id: 'Science',       label: 'Science',       emoji: '🔭' },
];

function CategoryPicker({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {CATEGORIES.map(cat => {
        const active = selected === cat.id;
        return (
          <motion.button key={String(cat.id)} onClick={() => onChange(cat.id)}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            style={{
              background: active ? 'var(--g-blue)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${active ? 'var(--g-blue)' : 'rgba(255,255,255,0.12)'}`,
              color: active ? '#fff' : 'rgba(240,244,248,0.65)',
              borderRadius: 50, padding: '7px 16px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              backdropFilter: 'blur(8px)',
              transition: 'background 0.15s, border 0.15s',
            }}>
            {cat.emoji} {cat.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Game() {
  const {
    gameState, GAME_STATES,
    round, result, selectedCountry, isCorrect,
    score, lastPoints, streak,
    roundNumber, totalRounds, bestScore,
    error, category, roundHistory,
    startGame, selectCountry, nextRound, resetGame,
  } = useGameState();

  const [muted, setMuted]         = useState(() => localStorage.getItem('sw_muted') === 'true');
  const [homeCategory, setHomeCategory] = useState(null);
  const [floatKey, setFloatKey]   = useState(0);

  const toggleMute = () => setMuted(m => { localStorage.setItem('sw_muted', String(!m)); return !m; });

  const { playCorrect, playWrong, playTick, playStreak, playNext, playGameOver, playNewBest } = useSound(muted);

  // ── Play reveal sounds ────────────────────────────────────────────────────
  const isRevealed     = gameState === GAME_STATES.REVEALING && result !== null;
  const prevRevealRef  = useRef(false);
  const prevBestRef    = useRef(bestScore);

  useEffect(() => {
    if (isRevealed && !prevRevealRef.current) {
      if (isCorrect) {
        setFloatKey(k => k + 1);          // trigger floating score
        if (streak >= 3) playStreak();
        else playCorrect();
      } else {
        playWrong();
      }
    }
    prevRevealRef.current = isRevealed;
  }, [isRevealed, isCorrect, streak]);

  useEffect(() => {
    if (gameState === GAME_STATES.GAME_OVER) {
      if (score > 0 && score >= prevBestRef.current) playNewBest();
      else playGameOver();
    }
    if (gameState !== GAME_STATES.GAME_OVER) prevBestRef.current = bestScore;
  }, [gameState]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING || !round) return;
    const handler = (e) => {
      if (['1','ArrowLeft','a','A'].includes(e.key))  { safePlay(playTick); selectCountry(round.countryA.code); }
      if (['2','ArrowRight','d','D'].includes(e.key)) { safePlay(playTick); selectCountry(round.countryB.code); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, round, selectCountry]);

  const safePlay = (fn) => { try { fn(); } catch {} };

  const handleSelectCountry = (code) => { safePlay(playTick); selectCountry(code); };
  const handleNext           = ()     => { safePlay(playNext); nextRound(); };
  const handleStart          = ()     => { safePlay(playTick); startGame(homeCategory); };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (gameState === GAME_STATES.IDLE) {
    return (
      <>
        <HomeBackground />

        {/* Foreground content */}
        <div style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '32px 16px',
        }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

            {/* Wordmark — staggered letter entrance */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Wordmark />
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ fontSize: 17, fontWeight: 500, color: 'rgba(240,244,248,0.55)', marginTop: 14, marginBottom: 36 }}
            >
              Which country Googles it more?
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}
            >
              {[['🌍','95 Countries'],['💡','219 Topics'],['📊','Live Data'],['🔥','Streaks']].map(([icon, label]) => (
                <div key={label} className="glass" style={{
                  borderRadius: 50, padding: '5px 13px',
                  fontSize: 12, fontWeight: 600, color: 'rgba(240,244,248,0.55)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {icon} {label}
                </div>
              ))}
            </motion.div>

            {/* Category picker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
            >
              <CategoryPicker selected={homeCategory} onChange={setHomeCategory} />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(234,67,53,0.12)', border: '1px solid rgba(234,67,53,0.35)', color: '#ff6b5b', borderRadius: 12, padding: '10px 16px', fontSize: 13, marginBottom: 20 }}
              >
                ⚠ {error}
              </motion.div>
            )}

            {/* Start button */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 48px rgba(66,133,244,0.65)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  width: '100%', background: 'var(--g-blue)',
                  color: '#fff', border: 'none',
                  fontSize: 18, fontWeight: 800,
                  padding: '17px', borderRadius: 50,
                  cursor: 'pointer',
                  boxShadow: '0 6px 32px rgba(66,133,244,0.45)',
                  letterSpacing: '0.01em',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {homeCategory ? `Start — ${homeCategory}` : 'Start Game'}
              </motion.button>

              {bestScore > 0 && (
                <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(240,244,248,0.4)' }}>
                  Personal best:{' '}
                  <span style={{ color: '#FBBC05', fontWeight: 700 }}>{bestScore} pts</span>
                </div>
              )}

              <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(240,244,248,0.22)' }}>
                Tip: press{' '}
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>1</kbd>
                {' or '}
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>2</kbd>
                {' to choose during the game'}
              </div>
            </motion.div>

          </div>
        </div>

        <MuteButton muted={muted} onToggle={toggleMute} />
      </>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (gameState === GAME_STATES.GAME_OVER) {
    return (
      <>
        <GameBackground imageUrl={round?.topic?.imageUrl} category={round?.topic?.category} roundKey="gameover" />
        <GameOverScreen score={score} bestScore={bestScore} totalRounds={totalRounds} roundHistory={roundHistory} onRestart={resetGame} />
        <MuteButton muted={muted} onToggle={toggleMute} />
      </>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (gameState === GAME_STATES.LOADING || !round) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--g-blue)' }} />
      </div>
    );
  }

  // ── PLAYING / REVEALING ───────────────────────────────────────────────────
  const { countryA, countryB, topic } = round;
  const volA = isRevealed ? result.countryA.monthlySearches : null;
  const volB = isRevealed ? result.countryB.monthlySearches : null;
  const maxSearches = isRevealed ? Math.max(volA, volB, 1) : 1;
  const winnerCode = isRevealed
    ? (volA === volB ? null : volA > volB ? countryA.code : countryB.code)
    : null;

  return (
    <>
      <GameBackground imageUrl={topic.imageUrl} category={topic.category} roundKey={`round-${roundNumber}`} />

      {/* Floating score popup */}
      <FloatingScore points={lastPoints} streak={streak} triggerKey={floatKey} />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Header score={score} streak={streak} roundNumber={roundNumber} totalRounds={totalRounds} bestScore={bestScore} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 700, padding: '0 16px 24px', gap: 28 }}>

          <AnimatePresence mode="wait">
            <motion.div key={`topic-${roundNumber}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3 }} style={{ width: '100%' }}>
              <TopicBadge topic={topic} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={`cards-${roundNumber}`}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', width: '100%' }}>

              <CountryCard country={countryA} onClick={() => handleSelectCountry(countryA.code)}
                disabled={gameState !== GAME_STATES.PLAYING} selected={selectedCountry === countryA.code}
                isWinner={isRevealed && (winnerCode === countryA.code || winnerCode === null)}
                isLoser={isRevealed && winnerCode !== null && winnerCode !== countryA.code}
                monthlySearches={volA} maxSearches={maxSearches}
                hint="1 / ←" />

              <div className="glass" style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'rgba(240,244,248,0.5)', flexShrink: 0 }}>
                VS
              </div>

              <CountryCard country={countryB} onClick={() => handleSelectCountry(countryB.code)}
                disabled={gameState !== GAME_STATES.PLAYING} selected={selectedCountry === countryB.code}
                isWinner={isRevealed && (winnerCode === countryB.code || winnerCode === null)}
                isLoser={isRevealed && winnerCode !== null && winnerCode !== countryB.code}
                monthlySearches={volB} maxSearches={maxSearches}
                hint="2 / →" />
            </motion.div>
          </AnimatePresence>

          {/* Keyboard hint — only shown on round 1 */}
          {roundNumber === 1 && gameState === GAME_STATES.PLAYING && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ fontSize: 12, color: 'rgba(240,244,248,0.3)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11 }}>1</kbd>
              or
              <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11 }}>2</kbd>
              to choose
            </motion.div>
          )}

          {gameState === GAME_STATES.REVEALING && !isRevealed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--g-blue)' }} />
              Fetching real data...
            </div>
          )}

          {isRevealed && (
            <ResultBanner isCorrect={isCorrect} onNext={handleNext}
              isLastRound={roundNumber >= totalRounds} streak={streak}
              source={result?.source} result={result} round={round} />
          )}
        </div>
      </div>

      <MuteButton muted={muted} onToggle={toggleMute} />
    </>
  );
}
