import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlockData, ClearEvent } from '../types/game';
import { Block } from './Block';
import { BubbleParticles } from './BubbleParticles';
import {
  GRID_COLS,
  GRID_ROWS,
  UI_COLORS,
} from '../constants/theme';

interface GridProps {
  blocks: BlockData[];
  previewRow: BlockData[];
  isBusy: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
  clearEvent: ClearEvent | null;
  hapticsEnabled?: boolean;
  onMove: (blockId: string, targetCol: number) => void;
  getMoveBounds: (blockId: string) => { minCol: number; maxCol: number };
  onOpenSettings: () => void;
  usableHeight?: number;
}

const BOARD_PADDING = 8;
const CELL_GAP = 2;

export const Grid: React.FC<GridProps> = ({
  blocks,
  previewRow,
  isBusy,
  score,
  highScore,
  clearEvent,
  hapticsEnabled = true,
  onMove,
  getMoveBounds,
  onOpenSettings,
  usableHeight,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const effectiveHeight = usableHeight || (SCREEN_HEIGHT - 210);
  const maxBoardWidth = Math.min(SCREEN_WIDTH - 32, 410);

  const cellFromWidth = Math.floor(
    (maxBoardWidth - BOARD_PADDING * 2 - (GRID_COLS - 1) * CELL_GAP) / GRID_COLS
  );
  // Reserve space for top stats, header, and preview bar
  const cellFromHeight = Math.floor((effectiveHeight - 145) / GRID_ROWS);

  const CELL_SIZE = Math.max(34, Math.min(cellFromWidth, cellFromHeight, 46));

  const BOARD_WIDTH = CELL_SIZE * GRID_COLS + (GRID_COLS - 1) * CELL_GAP + BOARD_PADDING * 2;
  const BOARD_HEIGHT = CELL_SIZE * GRID_ROWS + (GRID_ROWS - 1) * CELL_GAP;
  const INNER_WIDTH = BOARD_WIDTH - BOARD_PADDING * 2;

  return (
    <View style={styles.wrapper}>
      {/* 1. Top Bar: Trophy with High Score and Settings Icon */}
      <View style={[styles.topBar, { width: BOARD_WIDTH }]}>
        <View style={styles.trophyContainer}>
          <Ionicons name="trophy" size={24} color={UI_COLORS.trophyGold} />
          <Text style={styles.highScoreText}>{highScore}</Text>
        </View>

        <TouchableOpacity
          style={styles.gearButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-sharp" size={24} color={UI_COLORS.gearGray} />
        </TouchableOpacity>
      </View>

      {/* 2. Main Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      {/* 3. Game Board */}
      <View
        style={[
          styles.boardContainer,
          {
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT + BOARD_PADDING * 2,
            padding: BOARD_PADDING,
          },
        ]}
      >
        {/* Background Grid Slots */}
        <View
          style={[
            styles.gridSlotsLayer,
            { width: INNER_WIDTH, height: BOARD_HEIGHT },
          ]}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) => (
            <View key={`row_${r}`} style={styles.slotRow}>
              {Array.from({ length: GRID_COLS }).map((_, c) => (
                <View
                  key={`cell_${r}_${c}`}
                  style={[
                    styles.slotCell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginRight: c < GRID_COLS - 1 ? CELL_GAP : 0,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Active Blocks Layer */}
        <View
          style={[
            styles.blocksLayer,
            { width: INNER_WIDTH, height: BOARD_HEIGHT },
          ]}
        >
          {blocks.map((block) => {
            const bounds = getMoveBounds(block.id);
            return (
              <Block
                key={block.id}
                block={block}
                cellSize={CELL_SIZE}
                cellGap={CELL_GAP}
                boardHeight={BOARD_HEIGHT}
                isBusy={isBusy}
                minCol={bounds.minCol}
                maxCol={bounds.maxCol}
                hapticsEnabled={hapticsEnabled}
                onMove={onMove}
              />
            );
          })}
        </View>

        {/* Particle and Floating Score Effects */}
        <BubbleParticles
          event={clearEvent}
          boardWidth={INNER_WIDTH}
          boardHeight={BOARD_HEIGHT}
          cellSize={CELL_SIZE}
          cellGap={CELL_GAP}
        />
      </View>

      {/* 4. Bottom Preview Indicator Track */}
      <View
        style={[
          styles.previewTrack,
          {
            width: BOARD_WIDTH,
          },
        ]}
      >
        {previewRow.map((b) => {
          const w = b.width * CELL_SIZE + (b.width - 1) * CELL_GAP;
          const left = BOARD_PADDING + b.col * (CELL_SIZE + CELL_GAP);
          return (
            <View
              key={b.id}
              style={[
                styles.previewLaserBar,
                {
                  left,
                  width: w,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  trophyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highScoreText: {
    color: UI_COLORS.trophyGold,
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  gearButton: {
    padding: 6,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  scoreText: {
    color: UI_COLORS.scoreWhite,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 1,
  },
  boardContainer: {
    backgroundColor: UI_COLORS.boardBackground,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: UI_COLORS.boardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  gridSlotsLayer: {
    position: 'absolute',
    top: BOARD_PADDING,
    left: BOARD_PADDING,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  slotRow: {
    flexDirection: 'row',
  },
  slotCell: {
    backgroundColor: '#1b244b',
    borderWidth: 0.5,
    borderColor: UI_COLORS.gridLine,
  },
  blocksLayer: {
    position: 'relative',
  },
  previewTrack: {
    marginTop: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: UI_COLORS.previewTrack,
    borderWidth: 1,
    borderColor: UI_COLORS.previewTrackBorder,
    position: 'relative',
    justifyContent: 'center',
  },
  previewLaserBar: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: UI_COLORS.previewNeon,
    shadowColor: UI_COLORS.previewNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
});
