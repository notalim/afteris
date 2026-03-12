import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface ResultItem {
  label: string;
  value: string;
}

interface ResultCardProps {
  title: string;
  results: ResultItem[];
}

export function ResultCard({ title, results }: ResultCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {results.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  } as ViewStyle,
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 16,
    color: Colors.primary,
  } as TextStyle,
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  label: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,
  value: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.textPrimary,
  } as TextStyle,
});
