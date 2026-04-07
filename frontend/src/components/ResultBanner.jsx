import { motion } from 'framer-motion';
import { formatSearchVolume } from '../utils/format';

function RatioInsight({ result, round }) {
  if (!result || !round) return null;
  const { ratio, countryA: rA, countryB: rB } = result;
  if (!ratio || ratio < 1.1) {
    return (
      <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', marginBottom: 4 }}>
        Almost identical search volumes!
      </div>
    );
  }

  const winnerCode = rA.monthlySearches >= rB.monthlySearches ? rA.code : rB.code;
  const winner = winnerCode === round.countryA.code ? round.countryA : round.countryB;
  const loser  = winnerCode === round.countryA.code ? round.countryB : round.countryA;
  const winVol = Math.max(rA.monthlySearches, rB.monthlySearches);
  const losVol = Math.min(rA.monthlySearches, rB.monthlySearches);

  const ratioLabel = ratio >= 10
    ? `${Math.round(ratio)}×`
    : `${ratio.toFixed(1)}×`;

  const exclaim = ratio >= 5 ? ' 🔥' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ fontSize: 13, color: 'rgba(240,244,248,0.6)', marginBottom: 4, textAlign: 'center', lineHeight: 1.5 }}
    >
      <span style={{ color: '#f0f4f8', fontWeight: 700 }}>{winner.emoji} {winner.name}</span>
      {' searches this '}
      <span style={{ color: '#FBBC05', fontWeight: 800 }}>{ratioLabel} more</span>
      {' than '}
      <span style={{ fontWeight: 600 }}>{loser.emoji} {loser.name}</span>
      {exclaim}
      <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(240,244,248,0.35)' }}>
        {formatSearchVolume(winVol)} vs {formatSearchVolume(losVol)}
      </div>
    </motion.div>
  );
}

export default function ResultBanner({ isCorrect, onNext, isLastRound, streak, source, result, round }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 10 }}
    >
      {/* Correct / Wrong */}
      <motion.div
        animate={isCorrect ? { scale: [1, 1.18, 1] } : { x: [0, -10, 10, -6, 6, 0] }}
        transition={{ duration: 0.4 }}
        style={{
          fontSize: 28, fontWeight: 900,
          color: isCorrect ? '#4dde80' : '#ff6b5b',
          textShadow: isCorrect
            ? '0 0 30px rgba(52,200,100,0.6)'
            : '0 0 30px rgba(234,67,53,0.6)',
        }}
      >
        {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
      </motion.div>

      {/* Streak bonus badge */}
      {isCorrect && streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
          className="glass"
          style={{
            borderRadius: 50, padding: '4px 14px',
            fontSize: 12, fontWeight: 700, color: '#FBBC05',
            border: '1px solid rgba(251,188,5,0.4)',
            background: 'rgba(251,188,5,0.12)',
          }}
        >
          🔥 {streak} streak — bonus!
        </motion.div>
      )}

      {/* Ratio insight */}
      <RatioInsight result={result} round={round} />

      {source === 'mock' && (
        <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.25)' }}>
          Estimated data · live API unavailable
        </div>
      )}
      {result?.insufficientData && source !== 'mock' && (
        <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.25)' }}>
          Low search volume for this pair
        </div>
      )}

      {/* Next button */}
      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          marginTop: 4,
          background: 'var(--g-blue)',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 800,
          padding: '12px 36px', borderRadius: 50,
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(66,133,244,0.5)',
        }}
      >
        {isLastRound ? 'See Results →' : 'Next Round →'}
      </motion.button>
    </motion.div>
  );
}
