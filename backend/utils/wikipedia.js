const NodeCache = require('node-cache');
const imageCache = new NodeCache({ stdTTL: 86400 }); // 24-hour cache

/**
 * Fetch the primary thumbnail image URL for a Wikipedia article.
 * Returns null if not found or on error.
 */
async function fetchWikipediaImage(title) {
  const cacheKey = `img::${title}`;
  const cached = imageCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const params = new URLSearchParams({
      action:      'query',
      titles:      title,
      prop:        'pageimages',
      format:      'json',
      pithumbsize: '600',
      origin:      '*',
    });

    const url = `https://en.wikipedia.org/w/api.php?${params}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SearchWarsGame/1.0 (educational game)' },
    });
    clearTimeout(timeout);

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) { imageCache.set(cacheKey, null); return null; }

    const page = Object.values(pages)[0];
    const imageUrl = page?.thumbnail?.source ?? null;

    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch {
    imageCache.set(cacheKey, null, 300); // short TTL on failure
    return null;
  }
}

module.exports = { fetchWikipediaImage };
