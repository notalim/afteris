import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';

interface CategoryPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, selected, onPress }: CategoryPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  } as ViewStyle,
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  } as ViewStyle,
  text: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  textSelected: {
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  } as TextStyle,
});
