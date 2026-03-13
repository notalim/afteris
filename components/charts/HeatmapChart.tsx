import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface HeatmapChartProps {
  /** Map of 'YYYY-MM-DD' → number of logs that day */
  logCounts: Record<string, number>;
  streak: number;
  totalLogs: number;
}

const CELL_SIZE = 14;
const CELL_GAP = 3;
const WEEKS = 12;
const DAYS = 7;
const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''];

function getColorForCount(count: number): string {
  if (count === 0) return Colors.border;
  if (count === 1) return '#C6E48B';
  if (count === 2) return '#7BC96F';
  return '#239A3B';
}

function getMonthLabels(weeks: Date[][]): { label: string; x: number }[] {
  const labels: { label: string; x: number }[] = [];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDayOfWeek = week.find((d) => d !== null);
    if (!firstDayOfWeek) return;
    const m = firstDayOfWeek.getMonth();
    if (m !== lastMonth) {
      labels.push({
        label: months[m],
        x: wi * (CELL_SIZE + CELL_GAP),
      });
      lastMonth = m;
    }
  });
  return labels;
}

export function HeatmapChart({ logCounts, streak, totalLogs }: HeatmapChartProps) {
  // Build grid: 12 weeks × 7 days, ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = WEEKS * DAYS;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  // Align start to Monday
  const startDow = startDate.getDay(); // 0=Sun
  const mondayOffset = startDow === 0 ? -6 : 1 - startDow;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const weeks: Date[][] = [];
  const current = new Date(startDate);
  for (let w = 0; w < WEEKS; w++) {
    const week: Date[] = [];
    for (let d = 0; d < DAYS; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels = getMonthLabels(weeks);
  const gridWidth = WEEKS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const leftPadding = 20; // space for day labels
  const topPadding = 16; // space for month labels
  const svgWidth = leftPadding + gridWidth;
  const svgHeight = topPadding + DAYS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        <View style={styles.spacer} />
        <Text style={styles.totalLabel}>{totalLogs} total</Text>
      </View>

      <Svg width={svgWidth} height={svgHeight}>
        {/* Month labels */}
        {monthLabels.map((ml, i) => (
          <Rect key={`ml-${i}`} x={0} y={0} width={0} height={0} />
        ))}

        {/* Day labels + Cells */}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const count = logCounts[dateStr] ?? 0;
            const isFuture = day > today;
            const x = leftPadding + wi * (CELL_SIZE + CELL_GAP);
            const y = topPadding + di * (CELL_SIZE + CELL_GAP);

            return (
              <Rect
                key={`${wi}-${di}`}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={3}
                fill={isFuture ? 'transparent' : getColorForCount(count)}
                opacity={isFuture ? 0 : 1}
              />
            );
          })
        )}
      </Svg>

      {/* Overlay text labels (month + day) with RN Text for correct font rendering */}
      <View style={[styles.monthRow, { marginLeft: leftPadding }]}>
        {monthLabels.map((ml, i) => (
          <Text
            key={`month-${i}`}
            style={[styles.monthLabel, { position: 'absolute', left: ml.x }]}
          >
            {ml.label}
          </Text>
        ))}
      </View>

      <View style={[styles.dayLabelColumn, { top: topPadding + 42 }]}>
        {DAY_LABELS.map((label, i) => (
          <Text
            key={`day-${i}`}
            style={[styles.dayLabel, { height: CELL_SIZE + CELL_GAP }]}
          >
            {label}
          </Text>
        ))}
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
  spacer: {
    flex: 1,
  } as ViewStyle,
  totalLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,
  monthRow: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    height: 16,
  } as ViewStyle,
  monthLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textSecondary,
  } as TextStyle,
  dayLabelColumn: {
    position: 'absolute',
    left: Spacing.lg,
  } as ViewStyle,
  dayLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: CELL_SIZE + CELL_GAP,
  } as TextStyle,
});
