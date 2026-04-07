import { motion } from 'framer-motion';
import { formatSearchVolume } from '../utils/format';
import { useCountUp } from '../hooks/useCountUp';

const FLAG_URL = (code) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

export default function CountryCard({
  country, onClick, disabled, selected,
  isWinner, isLoser, monthlySearches, maxSearches,
  hint,    // e.g. "1 / ←"
}) {
  const isRevealed = monthlySearches !== null && monthlySearches !== undefined;
  const countedSearches = useCountUp(monthlySearches ?? 0, 900, isRevealed);
  const barPct = isRevealed && maxSearches > 0
    ? Math.max(4, Math.round((countedSearches / maxSearches) * 100))
    : 0;

  const winBorder  = '1px solid rgba(52,200,100,0.7)';
  const lossBorder = '1px solid rgba(234,67,53,0.6)';
  const selBorder  = '1px solid rgba(66,133,244,0.7)';
  const idleBorder = '1px solid var(--glass-border)';

  const border = isWinner ? winBorder : isLoser ? lossBorder : selected && !isRevealed ? selBorder : idleBorder;

  const bgOverlay = isWinner
    ? 'rgba(52,168,83,0.15)'
    : isLoser
    ? 'rgba(234,67,53,0.10)'
    : selected && !isRevealed
    ? 'rgba(66,133,244,0.10)'
    : 'transparent';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !isRevealed ? { scale: 1.03, y: -4 } : {}}
      whileTap={!disabled && !isRevealed ? { scale: 0.97 } : {}}
      animate={
        isWinner ? { scale: [1, 1.04, 1] } :
        isLoser  ? { x: [0, -10, 10, -6, 6, -3, 3, 0] } : {}
      }
      transition={{ duration: 0.45 }}
      style={{
        all: 'unset',
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12,
        padding: '20px 16px',
        borderRadius: 20,
        border,
        background: `linear-gradient(160deg, ${bgOverlay}, rgba(8,12,24,0.6))`,
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        width: '100%',
        minHeight: 200,
        textAlign: 'center',
        boxShadow: isWinner
          ? '0 0 40px rgba(52,168,83,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
          : isLoser
          ? '0 0 20px rgba(234,67,53,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.07)',
        transition: 'border 0.2s, box-shadow 0.3s, background 0.3s',
        userSelect: 'none',
      }}
    >
      {/* Keyboard hint badge — top-left, only when idle */}
      {hint && !isRevealed && !selected && (
        <div style={{
          position: 'absolute', top: 9, left: 10,
          fontSize: 10, fontWeight: 700, color: 'rgba(240,244,248,0.25)',
          fontFamily: 'monospace', letterSpacing: '0.03em',
        }}>{hint}</div>
      )}

      {/* Win/loss badge */}
      {isWinner && (
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: '#34A853', color: '#fff',
            fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 50,
            letterSpacing: '0.05em',
          }}
        >✓ WIN</motion.div>
      )}
      {isLoser && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: '#EA4335', color: '#fff',
            fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 50,
          }}
        >✗</motion.div>
      )}

      {/* Flag */}
      <motion.div
        animate={isWinner ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.5 }}
        style={{
          width: 120, height: 80, borderRadius: 10,
          overflow: 'hidden', flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src={FLAG_URL(country.code)}
          alt={`${country.name} flag`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.fontSize = '38px';
            e.target.parentElement.style.display = 'flex';
            e.target.parentElement.style.alignItems = 'center';
            e.target.parentElement.style.justifyContent = 'center';
            e.target.parentElement.textContent = country.emoji;
          }}
        />
      </motion.div>

      {/* Country name */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
          {country.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{country.emoji}</div>
      </div>

      {/* Monthly search reveal */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ width: '100%' }}
        >
          <div style={{
            fontSize: 24, fontWeight: 900, marginBottom: 8,
            color: isWinner ? '#4dde80' : 'rgba(240,244,248,0.5)',
            textShadow: isWinner ? '0 0 20px rgba(52,200,100,0.5)' : 'none',
          }}>
            {formatSearchVolume(countedSearches)}
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              className="bar-anim"
              style={{
                '--w': `${barPct}%`,
                height: '100%', borderRadius: 4,
                background: isWinner
                  ? 'linear-gradient(90deg, #34A853, #4dde80)'
                  : 'rgba(255,255,255,0.2)',
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            searches / month
          </div>
        </motion.div>
      )}

      {/* Loading spinner */}
      {selected && !isRevealed && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            borderTopColor: '#4285F4',
          }}
        />
      )}
    </motion.button>
  );
}
