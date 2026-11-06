import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { BlockData } from '../types/game';
import { ANIMATION_TIMINGS } from '../constants/theme';
import { BLOCK_TEXTURES } from '../constants/blockTextures';
import { triggerHaptic } from '../utils/haptics';

interface BlockProps {
  block: BlockData;
  cellSize: number;
  cellGap: number;
  boardHeight: number;
  isBusy: boolean;
  minCol: number;
  maxCol: number;
  hapticsEnabled?: boolean;
  onMove: (blockId: string, targetCol: number) => void;
}

export const Block: React.FC<BlockProps> = React.memo(({
  block,
  cellSize,
  cellGap,
  boardHeight,
  isBusy,
  minCol,
  maxCol,
  hapticsEnabled = true,
  onMove,
}) => {
  const isGrey = !!block.isGrey;
  const tex = isGrey ? BLOCK_TEXTURES.gray : (BLOCK_TEXTURES[block.color] || BLOCK_TEXTURES.cyan);
  const blockWidth = block.width * cellSize + (block.width - 1) * cellGap;
  const blockHeight = cellSize;
  const finalHeight = blockHeight - cellGap;
  const capWidth = Math.round(finalHeight * (30 / 106));

  // Coordinates: row 0 is bottom, row 9 is top
  const targetX = block.col * (cellSize + cellGap);
  const targetY = boardHeight - (block.row + 1) * (cellSize + cellGap) + cellGap;

  const translateX = useSharedValue(targetX);
  const translateY = useSharedValue(targetY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Horizontal position update
  useEffect(() => {
    translateX.value = withTiming(targetX, {
      duration: ANIMATION_TIMINGS.SLIDE_SNAP,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetX]);

  // Gravity drop update
  useEffect(() => {
    translateY.value = withTiming(targetY, {
      duration: ANIMATION_TIMINGS.GRAVITY_DROP,
      easing: Easing.out(Easing.quad),
    });
  }, [targetY]);

  // Line clear elimination animation
  useEffect(() => {
    if (block.isClearing) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 60 }),
        withTiming(0, { duration: ANIMATION_TIMINGS.LINE_CLEAR - 60 })
      );
      opacity.value = withTiming(0, { duration: ANIMATION_TIMINGS.LINE_CLEAR });
    }
  }, [block.isClearing]);

  // Grey stone conversion animation (Game Over)
  useEffect(() => {
    if (isGrey) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 70 }),
        withTiming(1.0, { duration: 90 })
      );
    }
  }, [isGrey]);

  // Horizontal pan drag gesture
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(!isBusy && !block.isClearing && !isGrey)
    .onStart(() => {
      startX.value = translateX.value;
      scale.value = withSpring(1.03);
      runOnJS(triggerHaptic)('selection', hapticsEnabled);
    })
    .onUpdate((event) => {
      const minX = minCol * (cellSize + cellGap);
      const maxX = maxCol * (cellSize + cellGap);
      const proposedX = startX.value + event.translationX;
      translateX.value = Math.max(minX, Math.min(maxX, proposedX));
    })
    .onEnd(() => {
      scale.value = withSpring(1.0);
      const step = cellSize + cellGap;
      const targetCol = Math.round(translateX.value / step);
      const clampedCol = Math.max(minCol, Math.min(maxCol, targetCol));

      translateX.value = withTiming(clampedCol * step, {
        duration: ANIMATION_TIMINGS.SLIDE_SNAP,
        easing: Easing.out(Easing.cubic),
      });

      runOnJS(onMove)(block.id, clampedCol);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            width: blockWidth,
            height: finalHeight,
          },
          animatedStyle,
        ]}
      >
        {block.width === 1 ? (
          <Image
            source={tex.full}
            style={{
              width: blockWidth,
              height: finalHeight,
            }}
            resizeMode="stretch"
          />
        ) : (
          <View style={styles.slicedBlockRow}>
            <Image
              source={tex.left}
              style={{
                width: capWidth,
                height: finalHeight,
              }}
              resizeMode="stretch"
            />
            <Image
              source={tex.mid}
              style={{
                flex: 1,
                height: finalHeight,
              }}
              resizeMode="stretch"
            />
            <Image
              source={tex.right}
              style={{
                width: capWidth,
                height: finalHeight,
              }}
              resizeMode="stretch"
            />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
  },
  slicedBlockRow: {
    flex: 1,
    flexDirection: 'row',
  },
});
