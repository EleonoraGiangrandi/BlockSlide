import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState } from 'react-native';
import { BlockData, ClearEvent } from '../types/game';
import { GRID_COLS, GRID_ROWS, ANIMATION_TIMINGS } from '../constants/theme';
import { calculateScore, ALL_CLEAR_BONUS } from '../utils/scoreCalculator';
import {
  settleGravity,
  getCompletedRows,
  generateRow,
  generateStableInitialBlocks,
  generateId,
} from '../utils/physicsEngine';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/soundManager';
import {
  loadHighScore,
  saveHighScore,
  loadTotalLines,
  saveTotalLines,
  loadSoundSetting,
  saveSoundSetting,
  loadHapticsSetting,
  saveHapticsSetting,
} from '../utils/storage';

export function useBlockSlide() {
  const [blocks, setBlocks] = useState<BlockData[]>(generateStableInitialBlocks);
  const [previewRow, setPreviewRow] = useState<BlockData[]>(() => generateRow(0, 0));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);
  const [lastScoreAdded, setLastScoreAdded] = useState(0);
  const [lastComboCount, setLastComboCount] = useState(0);
  const [isCascadeActive, setIsCascadeActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Particle animation event
  const [clearEvent, setClearEvent] = useState<ClearEvent | null>(null);

  // User Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const hapticsRef = useRef(hapticsEnabled);
  hapticsRef.current = hapticsEnabled;

  const previewRowRef = useRef(previewRow);
  previewRowRef.current = previewRow;

  // Unique session ID to cancel pending async operations on restart
  const gameSessionRef = useRef(0);

  // Load persistent data (high score, stats, and user preferences)
  useEffect(() => {
    loadHighScore().then((saved) => {
      if (saved > 0) setHighScore(saved);
    });
    loadTotalLines().then((saved) => {
      if (saved > 0) setTotalLinesCleared(saved);
    });
    loadSoundSetting().then((saved) => {
      setSoundEnabled(saved);
      soundManager.setSoundEnabled(saved);
      if (saved) {
        soundManager.startBackgroundMusic();
      }
    });
    loadHapticsSetting().then((saved) => {
      setHapticsEnabled(saved);
    });

    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

  const toggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    saveSoundSetting(enabled);
  }, []);

  const toggleHaptics = useCallback((enabled: boolean) => {
    setHapticsEnabled(enabled);
    saveHapticsSetting(enabled);
  }, []);

  const awardPoints = useCallback((pts: number) => {
    setScore((prev) => {
      const next = prev + pts;
      setHighScore((h) => {
        const nextHigh = Math.max(h, next);
        if (nextHigh > h) {
          saveHighScore(nextHigh);
        }
        return nextHigh;
      });
      return next;
    });
  }, []);

  const addClearedLines = useCallback((count: number) => {
    setTotalLinesCleared((prev) => {
      const next = prev + count;
      saveTotalLines(next);
      return next;
    });
  }, []);

  // Synchronize audio state with SoundManager
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // App lifecycle: pause audio when backgrounded, resume when active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        if (soundEnabled && !isGameOver) {
          soundManager.resumeBackgroundMusic();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        soundManager.pauseBackgroundMusic();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [soundEnabled, isGameOver]);

  /**
   * Progressive grey stone transformation sequence on Game Over
   */
  const triggerGameOverSequence = useCallback(async (sessionId: number) => {
    setIsGameOver(true);
    soundManager.pauseBackgroundMusic();
    triggerHaptic('heavy', hapticsRef.current);

    // Transform row by row from top to bottom
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      if (gameSessionRef.current !== sessionId) return;
      setBlocks((prev) =>
        prev.map((b) => (b.row === r ? { ...b, isGrey: true } : b))
      );
      triggerHaptic('light', hapticsRef.current);
      await new Promise((res) => setTimeout(res, ANIMATION_TIMINGS.GREY_STEP));
    }

    if (gameSessionRef.current !== sessionId) return;

    // Brief dramatic pause before showing game over screen
    await new Promise((res) => setTimeout(res, 400));

    if (gameSessionRef.current !== sessionId) return;

    setShowGameOverScreen(true);
  }, []);

  /**
   * Calculates horizontal bounds for block dragging
   */
  const getMoveBounds = useCallback((blockId: string): { minCol: number; maxCol: number } => {
    const currentBlocks = blocksRef.current;
    const target = currentBlocks.find((b) => b.id === blockId);
    if (!target) return { minCol: 0, maxCol: 0 };

    let minCol = 0;
    let maxCol = GRID_COLS - target.width;

    for (const b of currentBlocks) {
      if (b.id === blockId || b.row !== target.row) continue;
      if (b.col + b.width <= target.col) {
        minCol = Math.max(minCol, b.col + b.width);
      }
      if (b.col >= target.col + target.width) {
        maxCol = Math.min(maxCol, b.col - target.width);
      }
    }

    return { minCol, maxCol };
  }, []);

  /**
   * Sequential resolution of gravity, line clears, and elevation
   */
  const resolveMoveSequence = useCallback(async (currentBlocks: BlockData[]) => {
    setIsBusy(true);
    const sessionId = gameSessionRef.current;

    try {
      // Wait for horizontal slide animation
      await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.SLIDE_SNAP + 20));
      if (gameSessionRef.current !== sessionId) return;

      let activeBlocks = [...currentBlocks];
      let isCascade = false;
      let cascadeChainCount = 0;

      // PHASE A: GRAVITY -> CLEAR LINES -> RE-GRAVITY CASCADE
      while (true) {
        if (gameSessionRef.current !== sessionId) return;

        // 1. Deterministic gravity settlement
        const { blocks: postGravity, anyFell } = settleGravity(activeBlocks);
        if (anyFell) {
          activeBlocks = postGravity;
          setBlocks([...activeBlocks]);
          triggerHaptic('light', hapticsRef.current);
          await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.GRAVITY_DROP + 30));
          if (gameSessionRef.current !== sessionId) return;
        }

        // 2. Check for completed rows
        const completedRows = getCompletedRows(activeBlocks);
        if (completedRows.length === 0) {
          if (!anyFell) break;
          const checkAgain = settleGravity(activeBlocks);
          if (!checkAgain.anyFell) break;
          continue;
        }

        // 3. Clear animation and score calculation
        activeBlocks = activeBlocks.map((b) =>
          completedRows.includes(b.row) ? { ...b, isClearing: true } : b
        );
        setBlocks([...activeBlocks]);

        const scoreResult = calculateScore(completedRows.length, isCascade);
        awardPoints(scoreResult.pointsAwarded);
        addClearedLines(completedRows.length);
        setLastScoreAdded(scoreResult.pointsAwarded);
        setLastComboCount(completedRows.length);
        setIsCascadeActive(isCascade);

        // Play combo sound corresponding to level
        const comboTier = Math.min(6, completedRows.length + cascadeChainCount);
        soundManager.playCombo(comboTier);

        // Trigger particle effects
        setClearEvent({
          rows: completedRows,
          points: scoreResult.pointsAwarded,
          timestamp: Date.now(),
        });

        triggerHaptic(
          completedRows.length >= 2 || isCascade ? 'medium' : 'light',
          hapticsRef.current
        );

        await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.LINE_CLEAR));
        if (gameSessionRef.current !== sessionId) return;

        activeBlocks = activeBlocks.filter((b) => !completedRows.includes(b.row));
        setBlocks([...activeBlocks]);

        isCascade = true;
        cascadeChainCount++;
      }

      // ALL CLEAR BONUS: Board completely emptied
      if (activeBlocks.length === 0) {
        awardPoints(ALL_CLEAR_BONUS);
        setLastScoreAdded(ALL_CLEAR_BONUS);
        soundManager.playCombo(6);
        triggerHaptic('heavy', hapticsRef.current);
        setClearEvent({
          rows: [2],
          points: ALL_CLEAR_BONUS,
          timestamp: Date.now(),
          isAllClear: true,
        });
        await new Promise((r) => setTimeout(r, 650));
        if (gameSessionRef.current !== sessionId) return;
      }

      // PHASE B: BOTTOM ROW ELEVATION
      const hasTopExceededPre = activeBlocks.some((b) => b.row >= GRID_ROWS - 1);
      if (hasTopExceededPre) {
        await triggerGameOverSequence(sessionId);
        return;
      }

      // Elevate all blocks by 1 row
      activeBlocks = activeBlocks.map((b) => ({ ...b, row: b.row + 1 }));

      // Insert preview row at bottom (row 0)
      const incomingRow = previewRowRef.current.map((b) => ({ ...b, row: 0, id: generateId() }));
      activeBlocks.push(...incomingRow);

      setBlocks([...activeBlocks]);

      // Generate next preview row parameterized by current score
      const currentTotalScore = scoreRef.current;
      setPreviewRow(generateRow(0, currentTotalScore));

      await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.ROW_ELEVATION));
      if (gameSessionRef.current !== sessionId) return;

      // PHASE C: POST-ELEVATION GRAVITY CASCADE
      let postElevCascade = false;
      let postChainCount = 0;
      while (true) {
        if (gameSessionRef.current !== sessionId) return;

        const { blocks: settledPost, anyFell: fellPost } = settleGravity(activeBlocks);
        if (fellPost) {
          activeBlocks = settledPost;
          setBlocks([...activeBlocks]);
          triggerHaptic('light', hapticsRef.current);
          await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.GRAVITY_DROP + 30));
          if (gameSessionRef.current !== sessionId) return;
        }

        const completedPost = getCompletedRows(activeBlocks);
        if (completedPost.length === 0) {
          if (!fellPost) break;
          const checkAgain = settleGravity(activeBlocks);
          if (!checkAgain.anyFell) break;
          continue;
        }

        activeBlocks = activeBlocks.map((b) =>
          completedPost.includes(b.row) ? { ...b, isClearing: true } : b
        );
        setBlocks([...activeBlocks]);

        const scoreResult = calculateScore(completedPost.length, postElevCascade);
        awardPoints(scoreResult.pointsAwarded);
        addClearedLines(completedPost.length);
        setLastScoreAdded(scoreResult.pointsAwarded);
        setLastComboCount(completedPost.length);
        setIsCascadeActive(postElevCascade);

        const postComboTier = Math.min(6, completedPost.length + postChainCount);
        soundManager.playCombo(postComboTier);

        setClearEvent({
          rows: completedPost,
          points: scoreResult.pointsAwarded,
          timestamp: Date.now(),
        });
        triggerHaptic('medium', hapticsRef.current);

        await new Promise((r) => setTimeout(r, ANIMATION_TIMINGS.LINE_CLEAR));
        if (gameSessionRef.current !== sessionId) return;

        activeBlocks = activeBlocks.filter((b) => !completedPost.includes(b.row));
        setBlocks([...activeBlocks]);

        postElevCascade = true;
        postChainCount++;
      }

      // ALL CLEAR BONUS POST-ELEVATION: Board completely emptied
      if (activeBlocks.length === 0) {
        awardPoints(ALL_CLEAR_BONUS);
        setLastScoreAdded(ALL_CLEAR_BONUS);
        soundManager.playCombo(6);
        triggerHaptic('heavy', hapticsRef.current);
        setClearEvent({
          rows: [2],
          points: ALL_CLEAR_BONUS,
          timestamp: Date.now(),
          isAllClear: true,
        });
        await new Promise((r) => setTimeout(r, 650));
        if (gameSessionRef.current !== sessionId) return;
      }

      const hasTopExceededPost = activeBlocks.some((b) => b.row >= GRID_ROWS);
      if (hasTopExceededPost) {
        await triggerGameOverSequence(sessionId);
      }
    } finally {
      if (gameSessionRef.current === sessionId) {
        setIsBusy(false);
        setIsCascadeActive(false);
      }
    }
  }, [triggerGameOverSequence, awardPoints, addClearedLines]);

  /**
   * Moves a block horizontally
   */
  const moveBlock = useCallback((blockId: string, targetCol: number) => {
    if (isBusy || isGameOver) return;

    const currentBlocks = blocksRef.current;
    const target = currentBlocks.find((b) => b.id === blockId);
    if (!target) return;

    const { minCol, maxCol } = getMoveBounds(blockId);
    const clampedCol = Math.max(minCol, Math.min(maxCol, targetCol));

    if (clampedCol === target.col) {
      return;
    }

    setIsBusy(true);
    triggerHaptic('light', hapticsRef.current);

    const updated = currentBlocks.map((b) =>
      b.id === blockId ? { ...b, col: clampedCol } : b
    );
    setBlocks(updated);

    resolveMoveSequence(updated);
  }, [isBusy, isGameOver, getMoveBounds, resolveMoveSequence]);

  /**
   * Restarts game safely
   */
  const restartGame = useCallback(() => {
    gameSessionRef.current += 1;
    setBlocks(generateStableInitialBlocks());
    setPreviewRow(generateRow(0, 0));
    setScore(0);
    scoreRef.current = 0;
    setLastScoreAdded(0);
    setLastComboCount(0);
    setIsCascadeActive(false);
    setIsGameOver(false);
    setShowGameOverScreen(false);
    setIsBusy(false);
    setClearEvent(null);
    soundManager.resumeBackgroundMusic();
  }, []);

  return {
    blocks,
    previewRow,
    score,
    highScore,
    totalLinesCleared,
    lastScoreAdded,
    lastComboCount,
    isCascadeActive,
    isGameOver,
    showGameOverScreen,
    isBusy,
    clearEvent,
    soundEnabled,
    hapticsEnabled,
    setSoundEnabled: toggleSound,
    setHapticsEnabled: toggleHaptics,
    moveBlock,
    getMoveBounds,
    restartGame,
  };
}
