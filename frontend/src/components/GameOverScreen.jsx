import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';
import { formatSearchVolume } from '../utils/format';

const GRADES = [
  { min: 0.9, label: 'World Expert',   emoji: '🏆', color: '#FBBC05' },
  { min: 0.7, label: 'Trend Hunter',   emoji: '🌟', color: '#4285F4' },
  { min: 0.5, label: 'Search Pro',     emoji: '🔍', color: '#34A853' },
  { min: 0.3, label: 'Casual Googler', emoji: '🤷', color: 'rgba(240,244,248,0.6)' },
  { min: 0,   label: 'Try Again!',     emoji: '😅', color: '#EA4335' },
];

function getGrade(score, total) {
  const pct = score / (total * 10);
  return GRADES.find(g => pct >= g.min) ?? GRADES[GRADES.length - 1];
}

export default function GameOverScreen({ score, bestScore, totalRounds, roundHistory, onRestart }) {
  const { width, height } = useWindowSize();
  const grade      = getGrade(score, totalRounds);
  const isNewBest  = score > 0 && score >= bestScore;
  const [copied, setCopied]         = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleShare = async () => {
    const correct = roundHistory.filter(r => r.correct).length;
    const text = `🌍 Search Wars — I scored ${score}/${totalRounds * 10} pts (${correct}/${totalRounds} correct)!\n"${grade.label}" — Can you beat me?`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing silently
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px 16px', overflowY: 'auto' }}>
      {isNewBest && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={280} colors={['#4285F4','#34A853','#EA4335','#FBBC05']} />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="glass"
        style={{ padding: '36px 32px', textAlign: 'center', maxWidth: 440, width: '100%', borderRadius: 28 }}
      >
        {/* Grade */}
        <motion.div animate={{ rotate: [0,-10,10,-5,0] }} transition={{ delay: 0.4, duration: 0.6 }} style={{ fontSize: 68, marginBottom: 12 }}>
          {grade.emoji}
        </motion.div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Game Over</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: grade.color, marginBottom: 28 }}>{grade.label}</div>

        {/* Score row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Score', value: score, sub: `/ ${totalRounds * 10}`, color: '#f0f4f8' },
            { label: 'Best',  value: bestScore, sub: isNewBest ? '🎉 New!' : null, color: '#FBBC05' },
            { label: 'Correct', value: `${roundHistory.filter(r=>r.correct).length}/${totalRounds}`, sub: null, color: '#4dde80' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ flex: 1, padding: '14px 8px', borderRadius: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>{s.label}</div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 350 }}
                style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</motion.div>
              {s.sub && <div style={{ fontSize: 11, color: s.color === '#FBBC05' ? '#FBBC05' : 'var(--muted)', marginTop: 3 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <motion.button onClick={onRestart} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 2, background: 'var(--g-blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, padding: '13px', borderRadius: 50, cursor: 'pointer', boxShadow: '0 4px 20px rgba(66,133,244,0.4)' }}>
            Play Again
          </motion.button>
          <motion.button onClick={handleShare} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, background: copied ? 'rgba(52,168,83,0.2)' : 'rgba(255,255,255,0.07)', color: copied ? '#4dde80' : 'rgba(240,244,248,0.7)', border: `1px solid ${copied ? 'rgba(52,168,83,0.5)' : 'rgba(255,255,255,0.12)'}`, fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied' : '↗ Share'}
          </motion.button>
        </div>

        {/* Round history toggle */}
        <button onClick={() => setShowHistory(h => !h)}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto' }}>
          {showHistory ? '▲' : '▼'} Round Recap
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', marginTop: 14 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {roundHistory.map((r, i) => {
                  const picked  = r.pickedCode === r.countryA.code ? r.countryA : r.countryB;
                  const winner  = r.winnerCode === r.countryA.code ? r.countryA
                                : r.winnerCode === r.countryB.code ? r.countryB : null;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 12,
                      background: r.correct ? 'rgba(52,168,83,0.08)' : 'rgba(234,67,53,0.08)',
                      border: `1px solid ${r.correct ? 'rgba(52,168,83,0.25)' : 'rgba(234,67,53,0.2)'}`,
                      textAlign: 'left',
                    }}>
                      {/* Correct/wrong icon */}
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{r.correct ? '✓' : '✗'}</span>
                      {/* Topic */}
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.emoji} {r.keyword}
                      </span>
                      {/* You picked */}
                      <span style={{ fontSize: 12, color: r.correct ? '#4dde80' : '#ff6b5b', flexShrink: 0 }}>
                        {picked.emoji}
                      </span>
                      {/* Correct answer if wrong */}
                      {!r.correct && winner && (
                        <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                          → {winner.emoji}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
