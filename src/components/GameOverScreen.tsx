import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { UI_COLORS } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface GameOverScreenProps {
  score: number;
  hapticsEnabled?: boolean;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  hapticsEnabled = true,
  onRestart,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const btnScale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    scale.value = withSpring(1.0, { damping: 14, stiffness: 120 });
    btnScale.value = withSpring(1.0, { damping: 12, stiffness: 140 });
  }, []);

  const screenAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, screenAnimStyle]}>
      {/* 1. Header: 3D Extruded Title */}
      <View style={styles.titleSection}>
        <View style={styles.text3dContainer}>
          <Text style={[styles.titleText, styles.title3dShadow]}>Game Over</Text>
          <Text style={[styles.titleText, styles.titleFront]}>Game Over</Text>
        </View>
      </View>

      {/* 2. Score Section */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {/* 3. Action Section: Centered Play Button */}
      <View style={styles.buttonSection}>
        <Animated.View style={btnAnimStyle}>
          <TouchableOpacity
            style={styles.greenPlayButton}
            onPress={() => {
              triggerHaptic('medium', hapticsEnabled);
              onRestart();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.playIconWrapper}>
              <Ionicons name="play" size={34} color="#ffffff" style={styles.playIcon} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: UI_COLORS.gameOverBg,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '22%',
    zIndex: 999,
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text3dContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title3dShadow: {
    position: 'absolute',
    top: 5,
    color: UI_COLORS.gameOverTitleShadow,
  },
  titleFront: {
    color: UI_COLORS.gameOverTitle,
  },
  scoreSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    color: UI_COLORS.gameOverScoreLabel,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 76,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buttonSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  greenPlayButton: {
    width: 118,
    height: 60,
    borderRadius: 16,
    backgroundColor: UI_COLORS.playBtnGreen,
    borderTopWidth: 3.5,
    borderTopColor: UI_COLORS.playBtnTop,
    borderBottomWidth: 5.5,
    borderBottomColor: UI_COLORS.playBtnBottom,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: UI_COLORS.playBtnSide,
    borderRightColor: UI_COLORS.playBtnSide,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  playIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  playIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
