/**
 * Score Calculator for Block Slide
 * 
 * Deterministic scoring algorithm:
 * 1. Base single line clear: 30 points.
 * 2. Simultaneous multi-line combos:
 *    - 1 line:  30 x 1.0 = 30 pts
 *    - 2 lines: 30 x 2.5 = 75 pts
 *    - 3 lines: 30 x 4.0 = 120 pts
 *    - 4 lines: 30 x 6.0 = 180 pts
 *    Formula: Points = Base (30) * ComboMultiplier(Lines)
 * 3. Secondary gravity cascades (Clear Cascade):
 *    When blocks fall and spontaneously form another completed line,
 *    a +50% bonus multiplier (x1.5) is applied.
 */

export const BASE_ROW_SCORE = 30;
export const ALL_CLEAR_BONUS = 300; // Bonus awarded when the entire board is cleared

export const COMBO_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 2.5,
  3: 4.0,
  4: 6.0,
  5: 8.5,
};

export const CASCADE_BONUS_MULTIPLIER = 1.5; // +50% bonus for secondary cascades

export interface ScoreCalculationResult {
  linesCleared: number;
  baseScore: number;
  comboMultiplier: number;
  isCascade: boolean;
  cascadeMultiplier: number;
  pointsAwarded: number;
  breakdown: string;
}

/**
 * Calculates deterministic score for a line clear event
 * 
 * @param linesCleared Number of lines cleared simultaneously (>= 1)
 * @param isCascade Whether this clear was triggered by a secondary cascade
 */
export function calculateScore(
  linesCleared: number,
  isCascade: boolean = false
): ScoreCalculationResult {
  if (linesCleared <= 0) {
    return {
      linesCleared: 0,
      baseScore: 0,
      comboMultiplier: 0,
      isCascade: false,
      cascadeMultiplier: 1.0,
      pointsAwarded: 0,
      breakdown: '0 points',
    };
  }

  // Combo multiplier for simultaneous lines
  const comboMult = COMBO_MULTIPLIERS[linesCleared] ?? (linesCleared * 2.0);
  
  // Base points with combo
  const rawPoints = Math.round(BASE_ROW_SCORE * comboMult);

  // Apply cascade multiplier (+50% if secondary)
  const cascadeMult = isCascade ? CASCADE_BONUS_MULTIPLIER : 1.0;
  const pointsAwarded = Math.round(rawPoints * cascadeMult);

  const breakdown = isCascade
    ? `${linesCleared} Line(s) (${BASE_ROW_SCORE} x ${comboMult}) + Cascade Bonus (+50%) = ${pointsAwarded} pts`
    : `${linesCleared} Line(s) (${BASE_ROW_SCORE} x ${comboMult}) = ${pointsAwarded} pts`;

  return {
    linesCleared,
    baseScore: BASE_ROW_SCORE,
    comboMultiplier: comboMult,
    isCascade,
    cascadeMultiplier: cascadeMult,
    pointsAwarded,
    breakdown,
  };
}
