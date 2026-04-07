import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  Music:         { bg: 'rgba(234,67,53,0.18)',  border: 'rgba(234,67,53,0.50)',  text: '#ff6b5b' },
  Sports:        { bg: 'rgba(52,168,83,0.18)',  border: 'rgba(52,168,83,0.50)', text: '#4dde80' },
  Tech:          { bg: 'rgba(66,133,244,0.18)', border: 'rgba(66,133,244,0.50)',text: '#6ba8ff' },
  Entertainment: { bg: 'rgba(251,188,5,0.18)',  border: 'rgba(251,188,5,0.50)', text: '#fdd44e' },
  Lifestyle:     { bg: 'rgba(255,109,0,0.18)',  border: 'rgba(255,109,0,0.50)', text: '#ff9340' },
  People:        { bg: 'rgba(180,80,255,0.18)', border: 'rgba(180,80,255,0.50)',text: '#cc80ff' },
};

export default function TopicBadge({ topic }) {
  const colors = CATEGORY_COLORS[topic.category] ?? CATEGORY_COLORS.Tech;

  return (
    <motion.div
      key={topic.keyword}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: '0 16px' }}
    >
      {/* Subtle label */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, letterSpacing: '0.01em' }}>
        Which country searches more for...
      </div>

      {/* Keyword — the big headline */}
      <h2 style={{
        fontSize: 'clamp(32px, 7vw, 58px)',
        fontWeight: 900,
        color: '#fff',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        textShadow: '0 2px 30px rgba(0,0,0,0.8)',
        marginBottom: 14,
      }}>
        {topic.keyword}
      </h2>

      {/* Category pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: colors.bg, border: `1px solid ${colors.border}`,
        color: colors.text, fontSize: 11, fontWeight: 700,
        padding: '4px 12px', borderRadius: 50,
        textTransform: 'uppercase', letterSpacing: '0.09em',
        backdropFilter: 'blur(8px)',
      }}>
        {topic.emoji} {topic.category}
      </div>
    </motion.div>
  );
}
