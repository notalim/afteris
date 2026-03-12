import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  keyboardType?: 'numeric' | 'decimal-pad' | 'default';
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = 'decimal-pad',
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType={keyboardType}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  } as ViewStyle,
  label: {
    ...Typography.label,
  } as TextStyle,
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  } as ViewStyle,
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  unit: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    minWidth: 30,
  } as TextStyle,
});
