import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Mode } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

interface Props {
  mode: Mode;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

export default function ModeCard({ mode, isSelected, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={() => onSelect(mode.key)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{mode.icon}</Text>
      <Text style={[styles.name, isSelected && styles.selectedText]}>{mode.name}</Text>
      <Text style={styles.description} numberOfLines={1}>
        {mode.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  selectedCard: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceLight,
  },
  icon: {
    fontSize: FontSize.xl,
    marginBottom: Spacing.xs,
  },
  name: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  selectedText: {
    color: Colors.gold,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
});
