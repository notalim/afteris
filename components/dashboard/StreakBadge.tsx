import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';

interface StreakBadgeProps {
  streak: number;
  style?: ViewStyle;
}

export function StreakBadge({ streak, style }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.text}>
        {streak}-day streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    gap: Spacing.xs,
  } as ViewStyle,
  emoji: {
    fontSize: 16,
  } as TextStyle,
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
  } as TextStyle,
});
