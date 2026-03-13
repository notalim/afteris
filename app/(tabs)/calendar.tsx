import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { useProtocol } from '@/hooks/useProtocol';
import { useInjectionLog } from '@/hooks/useInjectionLog';
import { DayDetailModal } from '@/components/calendar/DayDetailModal';
import { CalendarLogModal } from '@/components/calendar/LogModal';
import type { InjectionLog, Compound } from '@/types';

type DotEntry = { key: string; color: string };

export default function CalendarScreen() {
  const { compounds, refresh: refreshCompounds } = useProtocol();
  const { log, fetchBetweenDates } = useInjectionLog();

  const [monthLogs, setMonthLogs] = useState<InjectionLog[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Day detail modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDayLogs, setSelectedDayLogs] = useState<InjectionLog[]>([]);

  // Log modal (FAB or late-log)
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logDate, setLogDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadMonth = useCallback(
    async (yearMonth: string) => {
      const [y, m] = yearMonth.split('-').map(Number);
      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const data = await fetchBetweenDates(start, end);
      setMonthLogs(data ?? []);
    },
    [fetchBetweenDates],
  );

  useFocusEffect(
    useCallback(() => {
      refreshCompounds();
      loadMonth(currentMonth);
    }, [refreshCompounds, loadMonth, currentMonth]),
  );

  // Build compound name lookup
  const compoundNames = useMemo(() => {
    const map: Record<number, string> = {};
    compounds.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [compounds]);

  // Build marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: DotEntry[] }> = {};

    // Group logs by date
    const logsByDate: Record<string, InjectionLog[]> = {};
    monthLogs.forEach((l) => {
      const d = l.logged_at.split('T')[0];
      if (!logsByDate[d]) logsByDate[d] = [];
      logsByDate[d].push(l);
    });

    // Green dots for logged dates
    Object.keys(logsByDate).forEach((d) => {
      marks[d] = {
        dots: [{ key: 'logged', color: Colors.success }],
      };
    });

    // Determine scheduled dates in the visible month
    const [y, m] = currentMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();

    compounds.forEach((c) => {
      if (!c.start_date || !c.frequency) return;
      const startDate = new Date(c.start_date + 'T12:00:00');
      const intervalDays = getIntervalDays(c.frequency);
      if (intervalDays <= 0) return;

      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const checkDate = new Date(dateStr + 'T12:00:00');
        if (checkDate < startDate) continue;

        const diffDays = Math.round(
          (checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays % intervalDays !== 0) continue;

        // This is a scheduled date
        if (!marks[dateStr]) marks[dateStr] = { dots: [] };
        const alreadyLogged = marks[dateStr].dots.some((d) => d.key === 'logged');

        if (!alreadyLogged) {
          // Past and not logged → missed (red); future → upcoming (coral/primary)
          if (dateStr < today) {
            marks[dateStr].dots.push({ key: `missed-${c.id}`, color: Colors.error });
          } else {
            marks[dateStr].dots.push({ key: `upcoming-${c.id}`, color: Colors.primary });
          }
        }
      }
    });

    return marks;
  }, [monthLogs, compounds, currentMonth, today]);

  const handleDayPress = useCallback(
    async (day: DateData) => {
      const dateStr = day.dateString;
      const dayLogs = monthLogs.filter(
        (l) => l.logged_at.split('T')[0] === dateStr,
      );
      setSelectedDate(dateStr);
      setSelectedDayLogs(dayLogs);
      setDetailVisible(true);
    },
    [monthLogs],
  );

  const handleMonthChange = useCallback(
    (month: DateData) => {
      const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
      setCurrentMonth(ym);
      loadMonth(ym);
    },
    [loadMonth],
  );

  const openLogModal = useCallback((date: string) => {
    setLogDate(date);
    setLogModalVisible(true);
  }, []);

  const handleLogSubmit = useCallback(
    async (data: {
      compound_id: number;
      dose_mcg: number;
      site: string;
      notes: string;
      is_late_log: number;
    }) => {
      await log({
        compound_id: data.compound_id,
        dose_mcg: data.dose_mcg,
        site: data.site,
        notes: data.notes,
        is_late_log: data.is_late_log,
        logged_at: logDate + 'T12:00:00',
      });
      setLogModalVisible(false);
      loadMonth(currentMonth);
    },
    [log, logDate, currentMonth, loadMonth],
  );

  const handleLateLog = useCallback(() => {
    setDetailVisible(false);
    openLogModal(selectedDate);
  }, [selectedDate, openLogModal]);

  const handleFabPress = useCallback(() => {
    openLogModal(today);
  }, [today, openLogModal]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: Colors.background,
      textDayFontFamily: Fonts.body,
      textMonthFontFamily: Fonts.bodyBold,
      textDayHeaderFontFamily: Fonts.bodySemiBold,
      textDayFontSize: 15,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 13,
      dayTextColor: Colors.textPrimary,
      monthTextColor: Colors.textPrimary,
      arrowColor: Colors.primary,
      todayTextColor: Colors.primary,
      selectedDayBackgroundColor: Colors.primary,
      selectedDayTextColor: Colors.white,
      textDisabledColor: Colors.border,
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Logged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFabPress}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>

      <DayDetailModal
        visible={detailVisible}
        date={selectedDate}
        logs={selectedDayLogs}
        compoundNames={compoundNames}
        isPast={selectedDate < today}
        onClose={() => setDetailVisible(false)}
        onLogLate={handleLateLog}
      />

      <CalendarLogModal
        visible={logModalVisible}
        compounds={compounds}
        date={logDate}
        onClose={() => setLogModalVisible(false)}
        onSubmit={handleLogSubmit}
      />
    </SafeAreaView>
  );
}

function getIntervalDays(frequency: string): number {
  const lower = frequency.toLowerCase();
  if (lower.includes('daily') || lower.includes('every day')) return 1;
  if (lower.includes('eod') || lower.includes('every other')) return 2;
  if (lower.includes('3x') || lower.includes('three times')) return 2;
  if (lower.includes('2x') || lower.includes('twice')) return 3;
  if (lower.includes('weekly') || lower.includes('once a week')) return 7;
  if (lower.includes('biweekly') || lower.includes('every 2 weeks')) return 14;
  if (lower.includes('monthly')) return 30;
  // Attempt to parse "every N days"
  const match = lower.match(/every\s+(\d+)\s+day/);
  if (match) return parseInt(match[1], 10);
  return 7; // default weekly
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  headerRow: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  } as ViewStyle,
  title: {
    ...Typography.h1,
  } as TextStyle,
  calendar: {
    marginHorizontal: Spacing.md,
    borderRadius: 16,
  } as ViewStyle,
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  } as ViewStyle,
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  } as ViewStyle,
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  } as ViewStyle,
  legendText: {
    ...Typography.caption,
  } as TextStyle,
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  } as ViewStyle,
});
