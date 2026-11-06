# Block Slide

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK_58-000020.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg)](https://www.typescriptlang.org)

**Block Slide** is a high-performance sliding block puzzle game engineered with **React Native**, **Expo**, and **TypeScript**. The application implements deterministic physics simulation, horizontal gesture controls, cascading combo mechanics, and universal hardware haptics.

---

## Overview

Block Slide challenges players to strategically reposition multi-width blocks across an 8-column by 10-row grid. Completing a full horizontal row triggers line eliminations and gravitational collapse, opening opportunities for secondary chain reactions and multi-line combos.

---

## Key Features

- **Gesture Physics Engine**: Responsive horizontal drag interactions powered by `react-native-gesture-handler` with UI-thread 60 FPS transitions via `react-native-reanimated`.
- **Cascading Combo Logic**: Iterative gravity resolution that identifies and rewards secondary chain clears with automatic score multiplier bonuses.
- **Audio Subsystem**: Low-latency sound playback and ambient background tracks managed via `expo-audio` with resource pooling.
- **Hardware Haptic Feedback**: Non-blocking native vibration feedback using React Native's core vibration interface, ensuring broad compatibility across Android and iOS devices.
- **Visual Composition**: Multi-sliced textured block components (1x1, 2x1, 3x1, 4x1) with dynamic beveling, glow highlights, and particle effects on line clears.
- **Local State Persistence**: High scores and career statistics stored locally on-device using `@react-native-async-storage/async-storage`.
- **Lifecycle Integration**: Automatic audio suspension and state preservation upon application pause, minimization, or backgrounding.
- **Privacy First**: Fully self-contained application requiring zero network connectivity, tracking SDKs, telemetry, or external service dependencies.

---

## Gameplay Mechanics

1. **Slide Blocks**: Drag any block horizontally into unoccupied space within the row boundaries.
2. **Line Clearance**: Filling all 8 cells of a horizontal row clears the row and triggers a score event.
3. **Gravity Settlement**: Any unsupported blocks above a cleared row drop vertically into available space.
4. **Cascade Combos**: When falling blocks spontaneously complete additional rows, a cascade bonus (+50%) is applied.
5. **Board Clearance**: Clearing all blocks entirely from the grid awards a high-value All Clear Bonus (+300 pts).
6. **Elevation & Game Over**: Each move elevates a new row from the bottom staging track. The game concludes when blocks exceed the top grid boundary.

---

## Technical Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 58)
- **Runtime**: [React Native](https://reactnative.dev/) (0.88)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (v4)
- **Gesture Handling**: [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) (v3)
- **Audio**: [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- **Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)

---

## Download & Installation (Pre-built Release)

For users who want to play the game directly without configuring a local development environment:

### Android APK

1. Navigate to the [Releases](https://github.com/EleonoraGiangrandi/BlockSlide/releases) section of this repository.
2. Under the latest release entry, open the **Assets** dropdown and download `BlockSlide.apk`.
3. Open the downloaded package on your Android device.
4. If prompted, allow your browser or file manager to install applications from external sources:
   - Go to **Settings** > **Apps** > **Special App Access** > **Install Unknown Apps**.
   - Enable permission for the application you used to download the APK.
5. Confirm installation and launch Block Slide from your app drawer.

---

## Development Setup

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn package manager
- Expo Go application on an iOS/Android device, or a configured mobile emulator

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EleonoraGiangrandi/BlockSlide.git
   cd BlockSlide
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run start
   ```

4. Run on a connected device or simulator:
   - **Android Device**: Scan the terminal QR code with the Expo Go app.
   - **iOS Device**: Scan the terminal QR code with the iOS Camera app.
   - **Android Emulator**: Press `a` in the terminal window.
   - **iOS Simulator**: Press `i` in the terminal window.

---

## Project Structure

```
BlockSlide/
├── .github/                 # Issue templates for bug reports and feature requests
├── assets/                  # Root application assets
├── src/
│   ├── assets/              # Component images, sliced textures, and sound files
│   │   ├── images/          # Block slices, trophy, and application icon
│   │   └── sounds/          # Combo audio effects and background music
│   ├── components/
│   │   ├── Block.tsx        # Interactive animated block component
│   │   ├── BubbleParticles.tsx # Row clearance particle burst and floating scores
│   │   ├── GameOverScreen.tsx  # End-of-game overlay and restart control
│   │   ├── Grid.tsx         # Primary game board grid layout
│   │   └── SettingsModal.tsx   # Audio, haptics, and statistics dialog
│   ├── constants/
│   │   ├── blockTextures.ts # Texture resolution mappings
│   │   └── theme.ts         # Color palette, grid dimensions, animation intervals
│   ├── hooks/
│   │   └── useBlockSlide.ts # Game loop state machine, turn and cascade manager
│   ├── types/
│   │   └── game.ts          # Type declarations and data models
│   └── utils/
│       ├── haptics.ts       # Native vibration controller
│       ├── physicsEngine.ts # Gravity resolution and procedural row generator
│       ├── scoreCalculator.ts # Deterministic scoring and combo multipliers
│       ├── soundManager.ts  # Audio playback engine and caching
│       └── storage.ts       # Persistent local storage helpers
├── App.tsx                  # Application entry point
├── app.json                 # Expo project configuration
├── package.json             # Manifest and dependency tree
└── tsconfig.json            # TypeScript compiler configuration
```

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run start` | Boots the Expo Metro bundler |
| `npm run android` | Starts Metro and attempts launch on an Android target |
| `npm run ios` | Starts Metro and attempts launch on an iOS target |
| `npm run web` | Launches the browser-based development preview |
| `npm run check` | Executes strict TypeScript compilation verification (`tsc --noEmit`) |

---

## Production Build

Standalone binaries (Android APK/AAB and iOS IPA) can be generated using EAS Build:

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Authenticate with your Expo account:
   ```bash
   eas login
   ```

3. Initialize project build profiles:
   ```bash
   eas build:configure
   ```

4. Trigger platform builds:
   ```bash
   # Android APK (for direct device installation)
   eas build -p android --profile preview

   # Android App Bundle (AAB for Google Play Store)
   eas build -p android --profile production

   # iOS Binary (for TestFlight and App Store)
   eas build -p ios --profile production
   ```

---

## License

This project is open-source software licensed under the terms of the [MIT License](LICENSE).
