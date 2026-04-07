import { motion } from 'framer-motion';

export default function Header({ score, streak, roundNumber, totalRounds, bestScore }) {
  return (
    <div style={{
      position: 'relative', zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, padding: '14px 18px',
      width: '100%', maxWidth: 700, margin: '0 auto',
    }}>
      {/* Score pill */}
      <div className="glass" style={{ borderRadius: 50, padding: '7px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score</span>
        <motion.span
          key={score}
          initial={{ scale: 1.35, color: '#FBBC05' }}
          animate={{ scale: 1, color: '#f0f4f8' }}
          transition={{ duration: 0.35 }}
          style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}
        >
          {score}
        </motion.span>
      </div>

      {/* Centre: round + progress + streak */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {/* Progress bar */}
        <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(roundNumber / totalRounds) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%', background: 'var(--g-blue)', borderRadius: 3 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            Round <strong style={{ color: '#f0f4f8', fontWeight: 900 }}>{roundNumber}</strong>
            <span style={{ opacity: 0.4 }}> / {totalRounds}</span>
          </span>

          {streak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="glass"
              style={{
                borderRadius: 50, padding: '2px 10px',
                fontSize: 12, fontWeight: 700, color: '#FBBC05',
                border: '1px solid rgba(251,188,5,0.35)',
                background: 'rgba(251,188,5,0.12)',
              }}
            >
              🔥 {streak}x
            </motion.span>
          )}
        </div>
      </div>

      {/* Best pill */}
      <div className="glass" style={{ borderRadius: 50, padding: '7px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Best</span>
        <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1, color: '#FBBC05' }}>{bestScore}</span>
      </div>
    </div>
  );
}
