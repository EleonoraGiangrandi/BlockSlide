export type BlockColor =
  | 'purple' // 1x1
  | 'blue'   // 2x1
  | 'orange' // 3x1
  | 'green'  // 2x1 or 3x1 variant
  | 'cyan'   // 2x1 variant
  | 'yellow' // 3x1 / 4x1 variant
  | 'red';   // 4x1

export interface BlockData {
  id: string;
  row: number; // 0 is bottom row, 9 is top row
  col: number; // 0 to 7
  width: number; // 1, 2, 3, or 4
  color: BlockColor;
  isClearing?: boolean; // True during elimination animation
  isGrey?: boolean;     // True when converted to grey stone on game over
}

export type GridMatrix = (BlockData | null)[][]; // 10 rows x 8 cols

export interface ScoreState {
  current: number;
  high: number;
  lastAdded: number;
  comboCount: number;
  isCascade: boolean;
}

export interface ClearEvent {
  rows: number[];
  points: number;
  timestamp: number;
  isAllClear?: boolean;
}

export interface GameStatus {
  isGameOver: boolean;
  showGameOverScreen: boolean;
  isBusy: boolean;
  turnCount: number;
}
