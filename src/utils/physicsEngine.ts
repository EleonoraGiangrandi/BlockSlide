import { BlockData, BlockColor } from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../constants/theme';

let blockIdCounter = 1;
export const generateId = () => `b_${Date.now()}_${blockIdCounter++}`;

export const COLOR_POOL: Record<number, BlockColor[]> = {
  1: ['purple', 'cyan'],
  2: ['blue', 'green', 'cyan'],
  3: ['orange', 'yellow'],
  4: ['red', 'yellow', 'green'],
};

export function getRandomColorForWidth(width: number): BlockColor {
  const pool = COLOR_POOL[width] || ['cyan'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface DifficultyTier {
  level: number;
  name: string;
  minFill: number;
  maxFill: number;
  allowWidth4: boolean;
  probWidth4: number;
}

/**
 * Difficulty tiers based on current player score
 */
export function getDifficulty(score: number): DifficultyTier {
  if (score < 300) {
    return {
      level: 1,
      name: 'Beginner',
      minFill: 5,
      maxFill: 6,
      allowWidth4: true,
      probWidth4: 0.20,
    };
  } else if (score < 900) {
    return {
      level: 2,
      name: 'Intermediate',
      minFill: 6,
      maxFill: 6,
      allowWidth4: true,
      probWidth4: 0.25,
    };
  } else if (score < 1800) {
    return {
      level: 3,
      name: 'Advanced',
      minFill: 6,
      maxFill: 7,
      allowWidth4: true,
      probWidth4: 0.28,
    };
  } else {
    return {
      level: 4,
      name: 'Expert',
      minFill: 6,
      maxFill: 7,
      allowWidth4: true,
      probWidth4: 0.30,
    };
  }
}

/**
 * Finds all partitions of target length into 1, 2, 3, and 4 width blocks.
 */
function getPartitions(targetFill: number, allowWidth4: boolean): number[][] {
  const results: number[][] = [];
  const maxPiece = allowWidth4 ? 4 : 3;

  function search(remaining: number, maxW: number, current: number[]) {
    if (remaining === 0) {
      if (current.length >= 2 && current.length <= 4) {
        results.push([...current]);
      }
      return;
    }
    for (let w = Math.min(maxW, remaining); w >= 1; w--) {
      current.push(w);
      search(remaining - w, maxPiece, current);
      current.pop();
    }
  }

  search(targetFill, maxPiece, []);
  return results;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Checks if two horizontal segments on the grid overlap.
 */
export function horizontalOverlap(
  colA: number,
  widthA: number,
  colB: number,
  widthB: number
): boolean {
  return Math.max(colA, colB) < Math.min(colA + widthA, colB + widthB);
}

/**
 * Checks if a block has direct physical support below it (at row - 1).
 */
export function hasSupportBelow(block: BlockData, allBlocks: BlockData[]): boolean {
  if (block.row === 0) return true;

  return allBlocks.some(
    (other) =>
      other.id !== block.id &&
      other.row === block.row - 1 &&
      horizontalOverlap(block.col, block.width, other.col, other.width)
  );
}

/**
 * Iterative gravity resolution engine for all blocks on the board.
 */
export function settleGravity(blocks: BlockData[]): {
  blocks: BlockData[];
  anyFell: boolean;
} {
  let active = blocks.map((b) => ({ ...b }));
  let overallFell = false;
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 30) {
    changed = false;
    iterations++;

    // Sort bottom to top
    active.sort((a, b) => a.row - b.row);

    for (let i = 0; i < active.length; i++) {
      const b = active[i];
      if (b.row === 0) continue;

      const hasSupport = active.some(
        (other) =>
          other.id !== b.id &&
          other.row === b.row - 1 &&
          horizontalOverlap(b.col, b.width, other.col, other.width)
      );

      if (!hasSupport) {
        b.row -= 1;
        changed = true;
        overallFell = true;
      }
    }
  }

  return { blocks: active, anyFell: overallFell };
}

/**
 * Identifies fully occupied rows (sum of block widths equals GRID_COLS).
 */
export function getCompletedRows(blocks: BlockData[]): number[] {
  const rowCounts = new Array(GRID_ROWS).fill(0);
  for (const b of blocks) {
    if (b.row >= 0 && b.row < GRID_ROWS && !b.isClearing) {
      rowCounts[b.row] += b.width;
    }
  }
  const completed: number[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    if (rowCounts[r] === GRID_COLS) {
      completed.push(r);
    }
  }
  return completed;
}

/**
 * Row generation algorithm:
 * - Uniform spatial distribution with no left bias.
 * - Empty slots (gaps) distributed evenly across blocks.
 * - Naturally balanced block lengths.
 */
export function generateRow(rowIndex: number = 0, currentScore: number = 0): BlockData[] {
  const diff = getDifficulty(currentScore);

  // Determine total filled cells for this row (5, 6, or 7 of 8)
  let targetFill: number;
  if (diff.minFill === diff.maxFill) {
    targetFill = diff.minFill;
  } else {
    targetFill = diff.minFill + Math.floor(Math.random() * (diff.maxFill - diff.minFill + 1));
  }

  const wantWidth4 = diff.allowWidth4 && Math.random() < diff.probWidth4;
  const partitions = getPartitions(targetFill, diff.allowWidth4);
  let selectedPartition: number[];

  if (wantWidth4) {
    const with4 = partitions.filter((p) => p.includes(4));
    if (with4.length > 0) {
      selectedPartition = shuffleArray(with4[Math.floor(Math.random() * with4.length)]);
    } else {
      selectedPartition = shuffleArray(partitions[Math.floor(Math.random() * partitions.length)]);
    }
  } else {
    const without4 = partitions.filter((p) => !p.includes(4));
    const pool = without4.length > 0 ? without4 : partitions;
    selectedPartition = shuffleArray(pool[Math.floor(Math.random() * pool.length)]);
  }

  const numBlocks = selectedPartition.length;
  const numGaps = GRID_COLS - targetFill;

  // Distribute empty gap slots evenly across (numBlocks + 1) slots
  const gapSlots = new Array(numBlocks + 1).fill(0);
  for (let g = 0; g < numGaps; g++) {
    const slotIdx = Math.floor(Math.random() * (numBlocks + 1));
    gapSlots[slotIdx]++;
  }

  const blocks: BlockData[] = [];
  let col = 0;

  for (let i = 0; i < numBlocks; i++) {
    col += gapSlots[i];
    const width = selectedPartition[i];
    const color = getRandomColorForWidth(width);

    blocks.push({
      id: generateId(),
      row: rowIndex,
      col,
      width,
      color,
    });

    col += width;
  }

  return blocks;
}

/**
 * Generates a stable initial block layout with zero floating pieces.
 */
export function generateStableInitialBlocks(): BlockData[] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const rawBlocks: BlockData[] = [];
    for (let r = 0; r < 4; r++) {
      rawBlocks.push(...generateRow(r, 0));
    }

    const { blocks: settled } = settleGravity(rawBlocks);
    const completed = getCompletedRows(settled);

    if (completed.length === 0) {
      const maxRow = Math.max(...settled.map((b) => b.row));
      const hasWidth4 = settled.some((b) => b.width === 4);
      if (maxRow <= 4 && hasWidth4) {
        return settled;
      }
    }
  }

  // Hand-crafted fallback configuration
  return [
    { id: generateId(), row: 0, col: 0, width: 4, color: 'red' },
    { id: generateId(), row: 0, col: 5, width: 2, color: 'blue' },
    { id: generateId(), row: 1, col: 1, width: 2, color: 'green' },
    { id: generateId(), row: 1, col: 4, width: 3, color: 'orange' },
    { id: generateId(), row: 2, col: 0, width: 3, color: 'yellow' },
    { id: generateId(), row: 2, col: 4, width: 2, color: 'cyan' },
    { id: generateId(), row: 2, col: 7, width: 1, color: 'purple' },
    { id: generateId(), row: 3, col: 2, width: 4, color: 'green' },
  ];
}
