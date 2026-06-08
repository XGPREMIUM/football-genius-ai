import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MODES, Mode } from '../types';
import ModeCard from '../components/ModeCard';
import { Colors, Spacing, FontSize } from '../theme';

interface Props {
  currentMode: string;
  onSelectMode: (key: string) => void;
  onClose: () => void;
}

export default function ModeSelectorScreen({ currentMode, onSelectMode, onClose }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚽ Football Genius AI</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Selecciona un modo de análisis</Text>

      <FlatList
        data={MODES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ModeCard
            mode={item}
            isSelected={item.key === currentMode}
            onSelect={(key) => {
              onSelectMode(key);
              onClose();
            }}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.gold,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeText: {
    color: Colors.white,
    fontSize: FontSize.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    padding: Spacing.md,
    paddingBottom: 0,
  },
  list: {
    paddingVertical: Spacing.md,
  },
});
