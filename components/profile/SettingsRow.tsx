import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  textColor?: string;
  onPress?: () => void;
}

export function SettingsRow({
  icon,
  label,
  value,
  textColor,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={styles.row}
    >
      <Feather
        name={icon}
        size={20}
        color={textColor ?? Colors.textSecondary}
        style={styles.icon}
      />
      <Text
        style={[styles.label, textColor ? { color: textColor } : undefined]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={18} color={Colors.border} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  } as ViewStyle,
  icon: {
    marginRight: Spacing.md,
  } as TextStyle,
  label: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textPrimary,
  } as TextStyle,
  value: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  } as TextStyle,
});
