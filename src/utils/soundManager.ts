import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

// Audio sources mapping
const COMBO_SOUNDS = [
  require('../assets/sounds/s_combo_1.ogg'),
  require('../assets/sounds/s_combo_2.ogg'),
  require('../assets/sounds/s_combo_3.ogg'),
  require('../assets/sounds/s_combo_4.ogg'),
  require('../assets/sounds/s_combo_5.ogg'),
  require('../assets/sounds/s_combo_6.ogg'),
];

const BG_MUSIC_SOURCE = require('../assets/sounds/bg_music.ogg');

class SoundManager {
  private bgMusicPlayer: AudioPlayer | null = null;
  private comboPlayers: (AudioPlayer | null)[] = new Array(COMBO_SOUNDS.length).fill(null);
  private isAudioModeConfigured = false;
  private soundEnabled = true;

  constructor() {
    this.initAudioMode();
  }

  private async initAudioMode() {
    if (this.isAudioModeConfigured) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
      });
      this.isAudioModeConfigured = true;
    } catch {
      // Silent catch if audio mode configuration is unsupported in the current environment
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.pauseBackgroundMusic();
    } else {
      this.resumeBackgroundMusic();
    }
  }

  /**
   * Plays combo sound effect according to combo level (1 to 6).
   */
  public async playCombo(comboLevel: number = 1) {
    if (!this.soundEnabled) return;

    try {
      await this.initAudioMode();
      const index = Math.max(0, Math.min(COMBO_SOUNDS.length - 1, comboLevel - 1));

      let player = this.comboPlayers[index];
      if (!player) {
        player = createAudioPlayer(COMBO_SOUNDS[index]);
        player.volume = 1.0;
        this.comboPlayers[index] = player;
      } else {
        try {
          player.seekTo(0);
        } catch {
          // If seekTo fails, proceed with playback
        }
      }

      player.play();
    } catch {
      // Safe fallback without interrupting game loop
    }
  }

  /**
   * Starts looping background music.
   */
  public async startBackgroundMusic() {
    if (!this.soundEnabled) return;

    try {
      await this.initAudioMode();

      if (this.bgMusicPlayer) {
        this.bgMusicPlayer.play();
        return;
      }

      const player = createAudioPlayer(BG_MUSIC_SOURCE);
      player.loop = true;
      player.volume = 0.35;
      player.play();

      this.bgMusicPlayer = player;
    } catch {
      // Silent fallback if audio playback is unavailable
    }
  }

  public pauseBackgroundMusic() {
    try {
      if (this.bgMusicPlayer) {
        this.bgMusicPlayer.pause();
      }
    } catch {}
  }

  public resumeBackgroundMusic() {
    if (!this.soundEnabled) return;
    try {
      if (this.bgMusicPlayer) {
        this.bgMusicPlayer.play();
      } else {
        this.startBackgroundMusic();
      }
    } catch {}
  }

  public stopBackgroundMusic() {
    try {
      if (this.bgMusicPlayer) {
        this.bgMusicPlayer.pause();
        this.bgMusicPlayer.remove();
        this.bgMusicPlayer = null;
      }
    } catch {}
  }
}

export const soundManager = new SoundManager();
