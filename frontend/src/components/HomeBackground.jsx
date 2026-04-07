import { motion } from 'framer-motion';

// ── Scrolling keyword rows — actual game topics as ambient typography ──────────
const ROWS = [
  {
    text: 'TAYLOR SWIFT  ·  BITCOIN  ·  FIFA WORLD CUP  ·  CHATGPT  ·  NETFLIX  ·  CRISTIANO RONALDO  ·  IPHONE  ·  TIKTOK  ·  MICHAEL JACKSON  ·  ',
    direction: 'left',
    fontSize: 22,
    opacity: 0.09,
    duration: 42,
    top: '5%',
    color: '#4285F4',
  },
  {
    text: 'GAME OF THRONES  ·  MINECRAFT  ·  PREMIER LEAGUE  ·  YOUTUBE  ·  SPIDER-MAN  ·  BTS  ·  FORTNITE  ·  POKEMON  ·  STAR WARS  ·  ONE PIECE  ·  NARUTO  ·  ',
    direction: 'right',
    fontSize: 13,
    opacity: 0.05,
    duration: 60,
    top: '18%',
    color: '#f0f4f8',
  },
  {
    text: 'GOOGLE  ·  AMAZON  ·  APPLE  ·  TESLA  ·  OPENAI  ·  WHATSAPP  ·  SPOTIFY  ·  NVIDIA  ·  MICROSOFT  ·  SAMSUNG  ·  META  ·  XBOX  ·  ',
    direction: 'left',
    fontSize: 30,
    opacity: 0.10,
    duration: 30,
    top: '30%',
    color: '#34A853',
  },
  {
    text: 'CRICKET  ·  LIONEL MESSI  ·  BAD BUNNY  ·  HARRY POTTER  ·  DRAKE  ·  LEBRON JAMES  ·  BEYONCE  ·  OLYMPICS  ·  ERLING HAALAND  ·  LEWIS HAMILTON  ·  ',
    direction: 'right',
    fontSize: 17,
    opacity: 0.065,
    duration: 50,
    top: '43%',
    color: '#FBBC05',
  },
  {
    text: 'SQUID GAME  ·  ELON MUSK  ·  GTA 6  ·  KYLIAN MBAPPE  ·  BREAKING BAD  ·  STRANGER THINGS  ·  FORMULA 1  ·  NASA  ·  SPACEX  ·  DEMON SLAYER  ·  ',
    direction: 'left',
    fontSize: 16,
    opacity: 0.055,
    duration: 55,
    top: '56%',
    color: '#f0f4f8',
  },
  {
    text: 'CHRISTMAS  ·  HALLOWEEN  ·  PIZZA  ·  SUSHI  ·  STARBUCKS  ·  AIRBNB  ·  ROBLOX  ·  ANIME  ·  SUPER BOWL  ·  NIKE  ·  GUCCI  ·  LOUIS VUITTON  ·  ',
    direction: 'right',
    fontSize: 25,
    opacity: 0.08,
    duration: 38,
    top: '69%',
    color: '#EA4335',
  },
  {
    text: 'MRBEAST  ·  DONALD TRUMP  ·  NBA  ·  DUA LIPA  ·  ED SHEERAN  ·  KIM KARDASHIAN  ·  ADELE  ·  ZENDAYA  ·  PEDRO PASCAL  ·  BLACK HOLE  ·  ',
    direction: 'left',
    fontSize: 12,
    opacity: 0.04,
    duration: 70,
    top: '81%',
    color: '#f0f4f8',
  },
];

// ── Animated gradient blobs (Google 4 colours) ───────────────────────────────
const BLOBS = [
  {
    color: 'rgba(66, 133, 244, 0.20)',
    style: { width: 640, height: 640, top: '-18%', right: '-12%' },
    anim:  { x: [0, 60, -30, 40, 0], y: [0, -50, 35, -20, 0], scale: [1, 1.15, 0.92, 1.08, 1] },
    dur:   24,
  },
  {
    color: 'rgba(234, 67, 53, 0.15)',
    style: { width: 540, height: 540, bottom: '-14%', left: '-10%' },
    anim:  { x: [0, -45, 55, -25, 0], y: [0, 40, -30, 15, 0], scale: [1, 0.90, 1.10, 0.95, 1] },
    dur:   28,
  },
  {
    color: 'rgba(251, 188, 5, 0.12)',
    style: { width: 480, height: 480, top: '22%', left: '28%' },
    anim:  { x: [0, 35, -55, 20, 0], y: [0, -35, 45, -15, 0], scale: [1, 1.10, 0.94, 1.06, 1] },
    dur:   20,
  },
  {
    color: 'rgba(52, 168, 83, 0.14)',
    style: { width: 580, height: 580, bottom: '2%', right: '-10%' },
    anim:  { x: [0, -50, 25, -30, 0], y: [0, 25, -45, 20, 0], scale: [1, 1.07, 0.91, 1.12, 1] },
    dur:   26,
  },
];

// ── Individual scrolling row ──────────────────────────────────────────────────
function KeywordRow({ text, direction, fontSize, opacity, duration, top, color }) {
  return (
    <div style={{
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      <span style={{
        display: 'inline-block',
        animation: `${direction === 'left' ? 'kwScrollLeft' : 'kwScrollRight'} ${duration}s linear infinite`,
        fontSize,
        lineHeight: 1.7,
        opacity,
        color,
        fontWeight: 900,
        letterSpacing: '0.08em',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Duplicated for seamless loop — translateX(-50%) = exactly one copy */}
        {text}{text}
      </span>
    </div>
  );
}

// ── Subtle dot-grid overlay ───────────────────────────────────────────────────
function DotGrid() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }} />
  );
}

// ── Radial vignette — pulls focus to center ───────────────────────────────────
function Vignette() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 50%, transparent 15%, rgba(4,7,14,0.88) 100%)',
    }} />
  );
}

// ── Scanline texture ─────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
    }} />
  );
}

export default function HomeBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, background: '#04070e' }}>

      {/* Gradient blobs */}
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          animate={b.anim}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: b.color,
            filter: 'blur(110px)',
            ...b.style,
          }}
        />
      ))}

      {/* Scrolling keyword rows */}
      {ROWS.map((row, i) => (
        <KeywordRow key={i} {...row} />
      ))}

      {/* Dot grid */}
      <DotGrid />

      {/* Subtle scanlines */}
      <Scanlines />

      {/* Vignette */}
      <Vignette />
    </div>
  );
}
