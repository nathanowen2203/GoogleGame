const BASE = '/api';

export async function fetchRound(category = null, excludeKeywords = []) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (excludeKeywords.length) params.set('exclude', excludeKeywords.join(','));
  const qs = params.toString();
  const res = await fetch(`${BASE}/round${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch round');
  return res.json();
}

export async function fetchCompare(topic, countryA, countryB) {
  const params = new URLSearchParams({ topic, countryA, countryB });
  const res = await fetch(`${BASE}/compare?${params}`);
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}
