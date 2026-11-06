import React, { useState } from 'react';
import { StyleSheet, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Grid } from './src/components/Grid';
import { GameOverScreen } from './src/components/GameOverScreen';
import { SettingsModal } from './src/components/SettingsModal';
import { useBlockSlide } from './src/hooks/useBlockSlide';
import { UI_COLORS } from './src/constants/theme';

function MainGame() {
  const insets = useSafeAreaInsets();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    blocks,
    previewRow,
    score,
    highScore,
    totalLinesCleared,
    isGameOver,
    showGameOverScreen,
    isBusy,
    clearEvent,
    soundEnabled,
    hapticsEnabled,
    setSoundEnabled,
    setHapticsEnabled,
    moveBlock,
    getMoveBounds,
    restartGame,
  } = useBlockSlide();

  // Screen padding accounting for platform bars (Android Status Bar & Navigation Bar)
  const androidStatusHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight || 28 : 0;
  const topPadding = Math.max(insets.top, androidStatusHeight) + 26;
  const bottomPadding = Math.max(insets.bottom, 20) + 10;

  return (
    <View
      style={[
        styles.safeContainer,
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Grid
          blocks={blocks}
          previewRow={previewRow}
          isBusy={isBusy}
          isGameOver={isGameOver}
          score={score}
          highScore={highScore}
          clearEvent={clearEvent}
          hapticsEnabled={hapticsEnabled}
          onMove={moveBlock}
          getMoveBounds={getMoveBounds}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsOpen}
        score={score}
        highScore={highScore}
        totalLinesCleared={totalLinesCleared}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        onToggleSound={setSoundEnabled}
        onToggleHaptics={setHapticsEnabled}
        onRestart={restartGame}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Game Over Screen */}
      {showGameOverScreen && (
        <GameOverScreen
          score={score}
          hapticsEnabled={hapticsEnabled}
          onRestart={restartGame}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <MainGame />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI_COLORS.appBackground,
  },
  safeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: UI_COLORS.appBackground,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
