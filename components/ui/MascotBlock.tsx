import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Card } from './Card';
import { Colors, Fonts, BorderRadius, Spacing } from '@/constants/theme';

interface MascotBlockProps {
  text: string;
  style?: ViewStyle;
}

export function MascotBlock({ text, style }: MascotBlockProps) {
  return (
    <Card style={{ ...styles.container, ...style }}>
      <View style={styles.illustration}>
        <Text style={styles.placeholderText}>[Artie Illustration]</Text>
      </View>
      <Text style={styles.message}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  } as ViewStyle,
  illustration: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  } as ViewStyle,
  placeholderText: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.primary,
    textAlign: 'center',
  } as TextStyle,
  message: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
  } as TextStyle,
});
