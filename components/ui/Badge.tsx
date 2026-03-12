import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';

type BadgeColor = 'primary' | 'success' | 'error';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  style?: ViewStyle;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryLight, text: Colors.primary },
  success: { bg: '#E8F5E9', text: Colors.success },
  error: { bg: '#FDEAEA', text: Colors.error },
};

export function Badge({ label, color = 'primary', style }: BadgeProps) {
  const colors = colorMap[color];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  } as ViewStyle,
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,
});
