/**
 * Format a raw monthly search count into a human-readable string.
 * e.g. 1_234_567 → "1.2M/mo"   |   450_000 → "450K/mo"   |   800 → "800/mo"
 */
export function formatSearchVolume(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M/mo`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K/mo`;
  return `${n}/mo`;
}
