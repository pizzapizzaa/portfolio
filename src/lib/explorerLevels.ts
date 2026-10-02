// Level/rank helpers shared by Explorer pages and the site HUD.
// Kept free of the Supabase client so the HUD can import it cheaply.

/** EXP thresholds: 100 EXP per level (level = floor(exp/100)+1) */
export function calcLevel(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

/** Progress within the current level (0–1) */
export function expProgress(exp: number): number {
  const level = calcLevel(exp);
  const base  = (level - 1) * 100;
  return (exp - base) / 100;
}

export const RANK_TITLES = ['CADET', 'SCOUT', 'NAVIGATOR', 'PATHFINDER', 'EXPLORER', 'CAPTAIN', 'COMMANDER'] as const;

export function rankTitle(level: number): string {
  return RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];
}
