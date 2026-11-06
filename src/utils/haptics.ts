import { Vibration } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Robust native vibration & haptic manager for Android and iOS.
 * Uses React Native's built-in Vibration module directly,
 * guaranteeing 100% universal support with zero missing native dependencies.
 */
export function triggerHaptic(type: HapticType = 'light', enabled: boolean = true) {
  if (!enabled) return;

  try {
    switch (type) {
      case 'selection':
        Vibration.vibrate(30);
        break;
      case 'light':
        Vibration.vibrate(50);
        break;
      case 'medium':
        Vibration.vibrate(90);
        break;
      case 'heavy':
        Vibration.vibrate([0, 80, 50, 120]);
        break;
      default:
        Vibration.vibrate(50);
    }
  } catch {
    // Silent fallback on simulators or devices without vibration motor
  }
}
