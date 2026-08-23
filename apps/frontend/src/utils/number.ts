export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Formats a 0-1 ratio as a percentage string, e.g. 0.604 -> "60.4%". */
export function formatRatioAsPercent(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

/**
 * Formats a difference between two ratios in percentage points, e.g. +5.2pt.
 * Percentage points, not percent: the difference between 50% and 55% is 5pt.
 */
export function formatRatioDeltaAsPoints(delta: number, fractionDigits = 1): string {
  const points = delta * 100;
  const sign = points > 0 ? "+" : "";
  return `${sign}${points.toFixed(fractionDigits)}pt`;
}
