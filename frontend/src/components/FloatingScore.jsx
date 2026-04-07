import { AnimatePresence, motion } from 'framer-motion';

/**
 * Shows a "+10" or "+15 streak!" bubble that floats upward and fades.
 * Keyed on `triggerKey` so a new animation fires each correct answer.
 */
export default function FloatingScore({ points, streak, triggerKey }) {
  if (!points) return null;

  const isBonus = points > 10;
  const label   = isBonus ? `+${points} 🔥` : `+${points}`;

  return (
    <div style={{ position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', zIndex: 200, pointerEvents: 'none' }}>
      <AnimatePresence>
        <motion.div
          key={triggerKey}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -70, scale: 1.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: isBonus ? 32 : 26,
            fontWeight: 900,
            color: isBonus ? '#FBBC05' : '#4dde80',
            textShadow: isBonus
              ? '0 0 24px rgba(251,188,5,0.7)'
              : '0 0 20px rgba(52,200,100,0.6)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
