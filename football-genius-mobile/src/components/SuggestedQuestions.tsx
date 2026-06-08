import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MODE_QUESTIONS } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

interface Props {
  currentMode: string;
  onSelectQuestion: (question: string) => void;
}

export default function SuggestedQuestions({ currentMode, onSelectQuestion }: Props) {
  const questions = MODE_QUESTIONS[currentMode] || MODE_QUESTIONS.general;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Preguntas sugeridas</Text>
      {questions.slice(0, 4).map((q, i) => (
        <TouchableOpacity
          key={i}
          style={styles.questionButton}
          onPress={() => onSelectQuestion(q)}
          activeOpacity={0.7}
        >
          <Text style={styles.questionText}>{q}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  title: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  questionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  questionText: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.sm,
  },
  arrow: {
    color: Colors.gold,
    fontSize: FontSize.md,
    marginLeft: Spacing.sm,
  },
});
