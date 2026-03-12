import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.baseText, variantTextStyles[variant], disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  baseText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  } as TextStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  disabledText: {
    opacity: 0.7,
  } as TextStyle,
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: Colors.white,
  },
  secondary: {
    color: Colors.primary,
  },
  ghost: {
    color: Colors.primary,
  },
};
