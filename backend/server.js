const express = require('express');
const cors = require('cors');
const path = require('path');
const NodeCache = require('node-cache');
const googleTrends = require('google-trends-api');
const COUNTRIES = require('./data/countries');
const TOPICS = require('./data/topics');
const { getMockScore } = require('./data/mockScores');
const { fetchWikipediaImage } = require('./utils/wikipedia');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────

const countryMap = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));
const topicMap   = Object.fromEntries(TOPICS.map((t) => [t.keyword, t]));

function estimateVolume(globalMonthlySearches, relativeScore, countryCode) {
  const country = countryMap[countryCode];
  if (!country) return 0;
  return Math.round(globalMonthlySearches * (relativeScore / 100) * country.searchShare);
}

/**
 * A country is "viable" for a topic if, assuming an average relative interest
 * score of 35 out of 100, the estimated monthly searches exceed the threshold.
 * This filters out pairs that will almost certainly produce 0 or near-0 data.
 */
const VIABLE_THRESHOLD = 5_000;
const DEFAULT_SCORE    = 35;

function isViable(topic, country) {
  return estimateVolume(topic.globalMonthlySearches, DEFAULT_SCORE, country.code) >= VIABLE_THRESHOLD;
}

// Pre-compute viable country lists per topic and cache them
const viableCountryCache = new Map();
function getViableCountries(topic) {
  if (viableCountryCache.has(topic.keyword)) return viableCountryCache.get(topic.keyword);
  const viable = COUNTRIES.filter(c => isViable(topic, c));
  // Need at least 2; fall back gracefully
  const result = viable.length >= 2 ? viable : COUNTRIES;
  viableCountryCache.set(topic.keyword, result);
  return result;
}

function pickRound(topicPool) {
  const topic = topicPool[Math.floor(Math.random() * topicPool.length)];
  const viable = getViableCountries(topic);
  const shuffled = [...viable].sort(() => Math.random() - 0.5);
  return { topic, countryA: shuffled[0], countryB: shuffled[1] };
}

// ── Routes ────────────────────────────────────────────────────────────────

app.get('/api/countries', (_req, res) => res.json(COUNTRIES));

app.get('/api/topics', (req, res) => {
  const { category } = req.query;
  const list = category
    ? TOPICS.filter(t => t.category.toLowerCase() === category.toLowerCase())
    : TOPICS;
  res.json(list);
});

/**
 * GET /api/round?category=Sports&exclude=Cricket,NBA
 *
 * Returns a topic + two viable countries + Wikipedia image.
 * `exclude` is a comma-separated list of already-played keywords to avoid repeats.
 */
app.get('/api/round', async (req, res) => {
  const { category, exclude } = req.query;
  const excluded = exclude ? new Set(exclude.split(',').map(s => s.trim())) : new Set();

  // Build topic pool
  let pool = TOPICS.filter(t => {
    if (category && t.category.toLowerCase() !== category.toLowerCase()) return false;
    if (excluded.has(t.keyword)) return false;
    return true;
  });

  // Fall back if filters leave too little
  if (pool.length < 3) {
    pool = category
      ? TOPICS.filter(t => t.category.toLowerCase() === category.toLowerCase())
      : TOPICS;
  }

  const { topic, countryA, countryB } = pickRound(pool);
  const imageUrl = await fetchWikipediaImage(topic.wikiTitle || topic.keyword);

  res.json({ topic: { ...topic, imageUrl }, countryA, countryB });
});

/**
 * GET /api/compare?topic=Bitcoin&countryA=US&countryB=NG
 *
 * Returns monthly search volume estimates for each country.
 * Also returns `ratio` (higher/lower) and `insufficientData` flag.
 */
app.get('/api/compare', async (req, res) => {
  const { topic, countryA, countryB } = req.query;
  if (!topic || !countryA || !countryB) {
    return res.status(400).json({ error: 'Missing params: topic, countryA, countryB' });
  }

  const cacheKey = `${topic}::${countryA}::${countryB}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  const topicMeta = topicMap[topic];
  const global    = topicMeta?.globalMonthlySearches ?? 1_000_000;

  function buildResponse(scoreA, scoreB, source) {
    const volA = estimateVolume(global, scoreA, countryA);
    const volB = estimateVolume(global, scoreB, countryB);
    const minVol = Math.min(volA, volB);
    const maxVol = Math.max(volA, volB);
    const ratio  = minVol > 0 ? parseFloat((maxVol / minVol).toFixed(1)) : null;
    return {
      topic,
      countryA: { code: countryA, monthlySearches: volA },
      countryB: { code: countryB, monthlySearches: volB },
      ratio,
      insufficientData: volA < 1_000 || volB < 1_000,
      source,
    };
  }

  try {
    console.log(`Trends: "${topic}" (${countryA} vs ${countryB})`);

    const raw     = await googleTrends.interestByRegion({
      keyword: topic,
      resolution: 'COUNTRY',
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endTime: new Date(),
    });
    const regions = JSON.parse(raw).default?.geoMapData || [];
    const score   = (code) => regions.find(r => r.geoCode === code)?.value[0] ?? 0;

    const response = buildResponse(score(countryA), score(countryB), 'google-trends');
    cache.set(cacheKey, response);
    res.json(response);

  } catch (err) {
    console.warn(`Trends failed for "${topic}": ${err.message} — using mock data`);
    const response = buildResponse(getMockScore(topic, countryA), getMockScore(topic, countryB), 'mock');
    cache.set(cacheKey, response, 600);
    res.json(response);
  }
});

// ── Serve frontend in production ──────────────────────────────────────────────
const DIST = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
