import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Fonts, Spacing, BorderRadius } from '@/constants/theme';

export function SafetyBanner() {
  return (
    <View style={styles.container}>
      <Feather name="info" size={18} color="#946B2D" style={styles.icon} />
      <Text style={styles.text}>
        Afteris provides information for educational purposes only. Always
        consult a qualified healthcare provider.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#F0D9A0',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  } as ViewStyle,
  icon: {
    marginTop: 2,
  } as TextStyle,
  text: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B5320',
  } as TextStyle,
});
