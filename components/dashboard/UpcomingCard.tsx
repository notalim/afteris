import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Compound } from '@/types';

interface UpcomingCardProps {
  compound: Compound;
  onLog: (compound: Compound) => void;
}

export function UpcomingCard({ compound, onLog }: UpcomingCardProps) {
  const doseDisplay = compound.dose_mcg
    ? `${compound.dose_mcg} mcg`
    : 'Dose not set';

  return (
    <Card style={styles.card}>
      <Text style={styles.name}>{compound.name}</Text>
      <Text style={styles.detail}>{doseDisplay}</Text>
      <Text style={styles.detail}>{compound.frequency}</Text>
      <Button
        title="LOG IT"
        onPress={() => onLog(compound)}
        style={styles.logButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  } as ViewStyle,
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  detail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  logButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
});
