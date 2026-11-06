import { BlockColor } from '../types/game';

export const GRID_COLS = 8;
export const GRID_ROWS = 10;

export interface BlockStyleDef {
  background: string;
  borderTop: string;
  borderBottom: string;
  borderLeft: string;
  borderRight: string;
}

export const BLOCK_THEMES: Record<BlockColor, BlockStyleDef> = {
  orange: {
    background: '#ea7821',
    borderTop: '#ffa257',
    borderBottom: '#a54404',
    borderLeft: '#d66712',
    borderRight: '#b85207',
  },
  yellow: {
    background: '#e5aa24',
    borderTop: '#ffd459',
    borderBottom: '#9b6c06',
    borderLeft: '#d39914',
    borderRight: '#b07b06',
  },
  cyan: {
    background: '#34a5dd',
    borderTop: '#7fd5ff',
    borderBottom: '#106694',
    borderLeft: '#2495cb',
    borderRight: '#1676a6',
  },
  green: {
    background: '#47ba35',
    borderTop: '#84e470',
    borderBottom: '#227814',
    borderLeft: '#3ba52a',
    borderRight: '#29881a',
  },
  blue: {
    background: '#4760d7',
    borderTop: '#8698ff',
    borderBottom: '#233290',
    borderLeft: '#394fc3',
    borderRight: '#2b3ea3',
  },
  purple: {
    background: '#9544da',
    borderTop: '#c680ff',
    borderBottom: '#551789',
    borderLeft: '#8334c6',
    borderRight: '#6721a3',
  },
  red: {
    background: '#d73939',
    borderTop: '#ff7373',
    borderBottom: '#821212',
    borderLeft: '#c02929',
    borderRight: '#9d1919',
  },
};

// Theme for grey stone blocks (Game Over defeat state)
export const BLOCK_GREY_THEME: BlockStyleDef = {
  background: '#7c8496',
  borderTop: '#a8b0c4',
  borderBottom: '#4c5364',
  borderLeft: '#6a7283',
  borderRight: '#586071',
};

export const UI_COLORS = {
  appBackground: '#304884',       // Denim blue background
  boardBackground: '#1a2348',     // Dark game board background
  boardBorder: '#232f5d',         // Subtle board border
  gridLine: '#222d56',            // Grid cell borders
  scoreWhite: '#ffffff',          // Large white score
  trophyGold: '#ffb428',          // Gold accent for trophy and high score
  gearGray: '#8aa3ce',            // Muted blue-grey for settings gear
  previewTrack: '#161e3c',        // Bottom track background
  previewTrackBorder: '#212d59',  // Bottom track border
  previewNeon: '#00e5ff',         // Neon cyan laser bar

  // Game Over Screen Theme
  gameOverBg: '#1662d5',          // Vibrant royal blue background
  gameOverTitle: '#4fc3fc',       // Light blue text front
  gameOverTitleShadow: '#1768a5', // 3D extrusion text shadow
  gameOverScoreLabel: '#8bc7f0',  // "Score" label
  playBtnGreen: '#27cf72',        // Green play button face
  playBtnTop: '#6de9a2',          // Top highlight border
  playBtnBottom: '#17a353',       // Bottom 3D bevel border
  playBtnSide: '#23bc64',         // Side borders
};

// Animation Timings (in ms)
export const ANIMATION_TIMINGS = {
  SLIDE_SNAP: 120,     // Horizontal block slide
  GRAVITY_DROP: 180,   // Vertical gravity fall
  LINE_CLEAR: 250,     // Row elimination animation
  ROW_ELEVATION: 280,  // Bottom row elevation
  GREY_STEP: 70,       // Interval between row grey-out
};
