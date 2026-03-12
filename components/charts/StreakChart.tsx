import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface StreakChartProps {
  dayData: boolean[];
  streak: number;
}

const BAR_WIDTH = 24;
const BAR_GAP = 8;
const CHART_HEIGHT = 48;
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakChart({ dayData, streak }: StreakChartProps) {
  const last7 = dayData.length >= 7 ? dayData.slice(-7) : [...Array(7 - dayData.length).fill(false), ...dayData];
  const totalWidth = last7.length * BAR_WIDTH + (last7.length - 1) * BAR_GAP;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
      <View style={styles.chartRow}>
        <Svg width={totalWidth} height={CHART_HEIGHT}>
          {last7.map((logged, i) => (
            <Rect
              key={i}
              x={i * (BAR_WIDTH + BAR_GAP)}
              y={logged ? 0 : CHART_HEIGHT - 12}
              width={BAR_WIDTH}
              height={logged ? CHART_HEIGHT : 12}
              rx={6}
              fill={logged ? Colors.success : Colors.border}
            />
          ))}
        </Svg>
        <View style={[styles.dayLabelsRow, { width: totalWidth }]}>
          {last7.map((_, i) => {
            const today = new Date();
            const dayIndex = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i)).getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            return (
              <Text
                key={i}
                style={[styles.dayLabel, { width: BAR_WIDTH, marginRight: i < 6 ? BAR_GAP : 0 }]}
              >
                {DAY_LABELS[adjustedIndex]}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  } as ViewStyle,
  streakNumber: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: Colors.textPrimary,
  } as TextStyle,
  streakLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
  } as TextStyle,
  chartRow: {
    alignItems: 'center',
    gap: Spacing.xs,
  } as ViewStyle,
  dayLabelsRow: {
    flexDirection: 'row',
  } as ViewStyle,
  dayLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
});
