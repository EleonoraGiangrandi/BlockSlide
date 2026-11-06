import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = '@block_slide_high_score';
const TOTAL_LINES_KEY = '@block_slide_total_lines';
const SOUND_ENABLED_KEY = '@block_slide_sound_enabled';
const HAPTICS_ENABLED_KEY = '@block_slide_haptics_enabled';

/**
 * Loads locally saved high score
 */
export async function loadHighScore(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    if (value !== null) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
  } catch (error) {
    console.warn('Error loading high score:', error);
  }
  return 0;
}

/**
 * Saves high score locally
 */
export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch (error) {
    console.warn('Error saving high score:', error);
  }
}

/**
 * Loads total cleared lines count
 */
export async function loadTotalLines(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(TOTAL_LINES_KEY);
    if (value !== null) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
  } catch (error) {
    console.warn('Error loading cleared lines:', error);
  }
  return 0;
}

/**
 * Saves total cleared lines count
 */
export async function saveTotalLines(lines: number): Promise<void> {
  try {
    await AsyncStorage.setItem(TOTAL_LINES_KEY, lines.toString());
  } catch (error) {
    console.warn('Error saving cleared lines:', error);
  }
}

/**
 * Loads locally saved sound preference (defaults to true if unset)
 */
export async function loadSoundSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    if (value !== null) {
      return value === 'true';
    }
  } catch (error) {
    console.warn('Error loading sound setting:', error);
  }
  return true;
}

/**
 * Saves sound preference locally
 */
export async function saveSoundSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.warn('Error saving sound setting:', error);
  }
}

/**
 * Loads locally saved haptics preference (defaults to true if unset)
 */
export async function loadHapticsSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    if (value !== null) {
      return value === 'true';
    }
  } catch (error) {
    console.warn('Error loading haptics setting:', error);
  }
  return true;
}

/**
 * Saves haptics preference locally
 */
export async function saveHapticsSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.warn('Error saving haptics setting:', error);
  }
}
