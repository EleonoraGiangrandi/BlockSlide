import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ClearEvent } from '../types/game';

interface BubbleParticlesProps {
  event: ClearEvent | null;
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
  cellGap: number;
}

interface ParticleConfig {
  id: string;
  x: number;
  y: number;
  size: number;
  isCircle: boolean;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
}

const SingleParticle: React.FC<{ p: ParticleConfig }> = React.memo(({ p }) => {
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    transX.value = withDelay(
      p.delay,
      withTiming(p.driftX, { duration: p.duration, easing: Easing.out(Easing.quad) })
    );
    transY.value = withDelay(
      p.delay,
      withTiming(p.driftY, { duration: p.duration, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      p.delay,
      withTiming(1.2, { duration: p.duration * 0.4 })
    );
    opacity.value = withDelay(
      p.delay,
      withTiming(0.9, { duration: p.duration * 0.2 }, () => {
        opacity.value = withTiming(0, { duration: p.duration * 0.8 });
      })
    );
  }, [p]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transX.value },
      { translateY: transY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particleBase,
        {
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          borderRadius: p.isCircle ? p.size / 2 : 2,
          backgroundColor: p.isCircle ? 'rgba(120, 220, 255, 0.4)' : '#ffffff',
          borderColor: p.isCircle ? 'rgba(255, 255, 255, 0.85)' : '#4fe4ff',
          borderWidth: p.isCircle ? 1.5 : 0.5,
        },
        animStyle,
      ]}
    />
  );
});

const FloatingScoreText: React.FC<{
  points: number;
  y: number;
  boardWidth: number;
  isAllClear?: boolean;
}> = React.memo(({ points, y, boardWidth, isAllClear }) => {
  const transY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withTiming(isAllClear ? 1.3 : 1.15, { duration: 180 }, () => {
      scale.value = withTiming(1.0, { duration: 150 });
    });
    transY.value = withTiming(isAllClear ? -48 : -38, {
      duration: isAllClear ? 850 : 650,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withDelay(
      isAllClear ? 500 : 320,
      withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) })
    );
  }, [points, y, isAllClear]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: transY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const containerWidth = isAllClear ? 240 : 120;

  return (
    <Animated.View
      style={[
        styles.scoreFloatContainer,
        {
          top: y - 10,
          left: (boardWidth - containerWidth) / 2,
          width: containerWidth,
        },
        animStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.scoreFloatText, isAllClear && styles.allClearText]}>
        {isAllClear ? `PERFECT CLEAR!\n+${points}` : `+${points}`}
      </Text>
    </Animated.View>
  );
});

const RowFlashAura: React.FC<{
  y: number;
  width: number;
  height: number;
}> = React.memo(({ y, width, height }) => {
  const opacity = useSharedValue(0.75);

  useEffect(() => {
    opacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  }, [y]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.rowAura,
        {
          top: y,
          width,
          height,
        },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
});

export const BubbleParticles: React.FC<BubbleParticlesProps> = ({
  event,
  boardWidth,
  boardHeight,
  cellSize,
  cellGap,
}) => {
  if (!event || event.rows.length === 0) return null;

  // Vertical coordinates for cleared rows
  const rowYs = useMemo(() => {
    return event.rows.map(
      (r) => boardHeight - (r + 1) * (cellSize + cellGap) + cellGap
    );
  }, [event.rows, boardHeight, cellSize, cellGap]);

  // Generate particles for each cleared row
  const particles = useMemo(() => {
    const list: ParticleConfig[] = [];
    let idx = 0;

    event.rows.forEach((r) => {
      const rowY = boardHeight - (r + 1) * (cellSize + cellGap) + cellGap;
      const count = 14;

      for (let i = 0; i < count; i++) {
        const seg = (boardWidth - 24) / count;
        const x = 12 + i * seg + (Math.random() * 8 - 4);
        const y = rowY + Math.random() * (cellSize * 0.7);
        const size = Math.floor(Math.random() * 8) + 6;
        const isCircle = Math.random() > 0.35;
        const driftX = (Math.random() - 0.5) * 32;
        const driftY = -(Math.random() * 35 + 35);
        const delay = Math.random() * 100;
        const duration = 550 + Math.random() * 200;

        list.push({
          id: `p_${event.timestamp}_${idx++}`,
          x,
          y,
          size,
          isCircle,
          driftX,
          driftY,
          delay,
          duration,
        });
      }
    });

    return list;
  }, [event.timestamp, event.rows, boardWidth, boardHeight, cellSize, cellGap]);

  // Calculate average Y position for floating score text
  const avgRowY = rowYs.reduce((a, b) => a + b, 0) / rowYs.length;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Row Flash Aura */}
      {rowYs.map((y, i) => (
        <RowFlashAura
          key={`aura_${event.timestamp}_${i}`}
          y={y}
          width={boardWidth}
          height={cellSize}
        />
      ))}

      {/* 2. Floating bubbles and sparkles */}
      {particles.map((p) => (
        <SingleParticle key={p.id} p={p} />
      ))}

      {/* 3. Floating points indicator */}
      <FloatingScoreText
        key={`score_${event.timestamp}`}
        points={event.points}
        y={avgRowY}
        boardWidth={boardWidth}
        isAllClear={event.isAllClear}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  particleBase: {
    position: 'absolute',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  rowAura: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 4,
  },
  scoreFloatContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  scoreFloatText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 229, 255, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  allClearText: {
    color: '#ffd700',
    fontSize: 28,
    lineHeight: 34,
    textShadowColor: 'rgba(255, 180, 0, 0.95)',
    textShadowRadius: 12,
  },
});
