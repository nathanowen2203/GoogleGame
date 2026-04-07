import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_GRADIENTS = {
  Music:         ['#3d0000', '#7a1a1a'],
  Sports:        ['#003d00', '#1a5c1a'],
  Tech:          ['#00103d', '#0a2060'],
  Entertainment: ['#3d2a00', '#6b4a00'],
  Lifestyle:     ['#3d1500', '#6b2d00'],
  People:        ['#1e003d', '#3d0066'],
};

export default function GameBackground({ imageUrl, category, roundKey }) {
  const [c1, c2] = CATEGORY_GRADIENTS[category] ?? ['#0a0a0a', '#1a1a1a'];

  return (
    /* Fixed layer — sits behind everything */
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>

      {/* Cross-fading image or gradient per round */}
      <AnimatePresence mode="sync">
        <motion.div
          key={roundKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                filter: 'blur(14px) brightness(0.32) saturate(1.4)',
                transform: 'scale(1.10)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `radial-gradient(ellipse at 50% 30%, ${c2} 0%, ${c1} 70%)`,
            }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — darkens edges & bottom for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 10%, rgba(0,0,0,0.55) 100%),
          linear-gradient(to bottom,
            rgba(0,0,0,0.45) 0%,
            rgba(0,0,0,0.10) 35%,
            rgba(0,0,0,0.10) 55%,
            rgba(0,0,0,0.75) 85%,
            rgba(0,0,0,0.92) 100%)
        `,
      }} />
    </div>
  );
}
