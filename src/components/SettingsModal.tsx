import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface SettingsModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  totalLinesCleared: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleSound: (value: boolean) => void;
  onToggleHaptics: (value: boolean) => void;
  onRestart: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  highScore,
  totalLinesCleared,
  soundEnabled,
  hapticsEnabled,
  onToggleSound,
  onToggleHaptics,
  onRestart,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#8aa3ce" />
            </TouchableOpacity>
          </View>

          {/* Controls Section */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={soundEnabled ? 'volume-high' : 'volume-mute'}
                  size={22}
                  color="#ffd54f"
                />
                <Text style={styles.rowLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  triggerHaptic('selection', hapticsEnabled);
                  onToggleSound(val);
                }}
                trackColor={{ false: '#26345e', true: '#4760d7' }}
                thumbColor={soundEnabled ? '#00e5ff' : '#8aa3ce'}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={hapticsEnabled ? 'phone-portrait' : 'phone-portrait-outline'}
                  size={22}
                  color="#81c784"
                />
                <Text style={styles.rowLabel}>Vibration & Haptics</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={(val) => {
                  triggerHaptic(val ? 'medium' : 'selection', true);
                  onToggleHaptics(val);
                }}
                trackColor={{ false: '#26345e', true: '#4760d7' }}
                thumbColor={hapticsEnabled ? '#00e5ff' : '#8aa3ce'}
              />
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>HIGH SCORE</Text>
              <Text style={[styles.statValue, { color: '#ffb428' }]}>{highScore}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>LINES CLEARED</Text>
              <Text style={[styles.statValue, { color: '#00e5ff' }]}>{totalLinesCleared}</Text>
            </View>
          </View>

          {/* Restart Game Button */}
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => {
              triggerHaptic('medium', hapticsEnabled);
              onClose();
              onRestart();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.restartText}>Restart Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 38, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1b254c',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2b3a6d',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    backgroundColor: '#151d3e',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#233059',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#e0e7ff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#151d3e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#233059',
  },
  statLabel: {
    color: '#8aa3ce',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  restartBtn: {
    backgroundColor: '#ea7821',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#a54404',
  },
  restartText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
