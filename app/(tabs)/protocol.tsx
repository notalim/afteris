import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { InputField } from '@/components/calculator/InputField';
import { ResultCard } from '@/components/calculator/ResultCard';
import { DayDetailModal } from '@/components/calendar/DayDetailModal';
import { CalendarLogModal } from '@/components/calendar/LogModal';
import { useProtocol } from '@/hooks/useProtocol';
import { useInjectionLog } from '@/hooks/useInjectionLog';
import { peptides } from '@/constants/peptides';
import type { InjectionLog, Compound } from '@/types';

type Section = 'calendar' | 'calculator' | 'reference';
type DotEntry = { key: string; color: string };

function getIntervalDays(frequency: string): number {
  const lower = frequency.toLowerCase();
  if (lower.includes('daily') || lower.includes('every day')) return 1;
  if (lower.includes('eod') || lower.includes('every other')) return 2;
  if (lower.includes('3x') || lower.includes('three times')) return 2;
  if (lower.includes('2x') || lower.includes('twice')) return 3;
  if (lower.includes('weekly') || lower.includes('once a week')) return 7;
  if (lower.includes('biweekly') || lower.includes('every 2 weeks')) return 14;
  if (lower.includes('monthly')) return 30;
  const match = lower.match(/every\s+(\d+)\s+day/);
  if (match) return parseInt(match[1], 10);
  return 7;
}

function formatHalfLife(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${hours} hr`;
  return `${Math.round(hours / 24)} days`;
}

export default function ProtocolScreen() {
  const [activeSection, setActiveSection] = useState<Section>('calendar');
  const { compounds, refresh: refreshCompounds } = useProtocol();
  const { log, fetchBetweenDates } = useInjectionLog();

  // ─── Calendar state ───
  const [monthLogs, setMonthLogs] = useState<InjectionLog[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDayLogs, setSelectedDayLogs] = useState<InjectionLog[]>([]);
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

  const compoundNames = useMemo(() => {
    const map: Record<number, string> = {};
    compounds.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [compounds]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: DotEntry[] }> = {};
    const logsByDate: Record<string, InjectionLog[]> = {};
    monthLogs.forEach((l) => {
      const d = l.logged_at.split('T')[0];
      if (!logsByDate[d]) logsByDate[d] = [];
      logsByDate[d].push(l);
    });

    Object.keys(logsByDate).forEach((d) => {
      marks[d] = { dots: [{ key: 'logged', color: Colors.success }] };
    });

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

        if (!marks[dateStr]) marks[dateStr] = { dots: [] };
        const alreadyLogged = marks[dateStr].dots.some((d) => d.key === 'logged');

        if (!alreadyLogged) {
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
    (day: DateData) => {
      const dateStr = day.dateString;
      const dayLogs = monthLogs.filter((l) => l.logged_at.split('T')[0] === dateStr);
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
      textMonthFontFamily: Fonts.headingBold,
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

  // ─── Calculator state ───
  const [vialMg, setVialMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [doseMcg, setDoseMcg] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleFreq, setCycleFreq] = useState('');
  const [cycleDoses, setCycleDoses] = useState('');
  const [calcTab, setCalcTab] = useState<'reconstitution' | 'cycle'>('reconstitution');

  const reconResults = useMemo(() => {
    const vial = parseFloat(vialMg);
    const water = parseFloat(bacWaterMl);
    const dose = parseFloat(doseMcg);
    if (!vial || !water || vial <= 0 || water <= 0) return null;

    const concentration = (vial * 1000) / water;
    const results: { label: string; value: string }[] = [
      { label: 'Concentration', value: `${concentration.toFixed(1)} mcg/mL` },
    ];

    if (dose && dose > 0) {
      const mlToDraw = dose / concentration;
      const units = mlToDraw * 100;
      const dosesPerVial = (vial * 1000) / dose;
      results.push(
        { label: 'mL to draw', value: `${mlToDraw.toFixed(3)} mL` },
        { label: 'Units (U-100)', value: `${units.toFixed(1)} IU` },
        { label: 'Doses per vial', value: `${Math.floor(dosesPerVial)}` },
      );
    }

    return results;
  }, [vialMg, bacWaterMl, doseMcg]);

  const cycleResults = useMemo(() => {
    const freqDays = parseFloat(cycleFreq);
    const numDoses = parseInt(cycleDoses, 10);
    if (!freqDays || !numDoses || freqDays <= 0 || numDoses <= 0) return null;
    if (!cycleStart) return null;

    const startParts = cycleStart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!startParts) return null;

    const start = new Date(cycleStart + 'T12:00:00');
    if (isNaN(start.getTime())) return null;

    const totalDays = (numDoses - 1) * freqDays;
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + totalDays);

    const endStr = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return [
      { label: 'End date', value: endStr },
      { label: 'Total days', value: `${totalDays}` },
      { label: 'Total doses', value: `${numDoses}` },
    ];
  }, [cycleStart, cycleFreq, cycleDoses]);

  // ─── Half-life reference state ───
  const [search, setSearch] = useState('');

  const filteredPeptides = useMemo(() => {
    if (!search.trim()) return peptides;
    const q = search.toLowerCase();
    return peptides.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.aliases.some((a: string) => a.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
    );
  }, [search]);

  // ─── Segment sections ───
  const sections: [Section, string][] = [
    ['calendar', 'Calendar'],
    ['calculator', 'Calculator'],
    ['reference', 'Reference'],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Protocol</Text>

        {/* Segmented Control */}
        <View style={styles.segmentRow}>
          {sections.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveSection(key)}
              activeOpacity={0.7}
              style={[styles.segment, activeSection === key && styles.segmentActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeSection === key && styles.segmentTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══════════ Calendar Section ═══════════ */}
        {activeSection === 'calendar' && (
          <View style={styles.section}>
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
          </View>
        )}

        {/* ═══════════ Calculator Section ═══════════ */}
        {activeSection === 'calculator' && (
          <View style={styles.section}>
            {/* Sub-tabs for reconstitution / cycle */}
            <View style={styles.subTabRow}>
              <TouchableOpacity
                onPress={() => setCalcTab('reconstitution')}
                activeOpacity={0.7}
                style={[styles.subTab, calcTab === 'reconstitution' && styles.subTabActive]}
              >
                <Text style={[styles.subTabText, calcTab === 'reconstitution' && styles.subTabTextActive]}>
                  Reconstitution
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCalcTab('cycle')}
                activeOpacity={0.7}
                style={[styles.subTab, calcTab === 'cycle' && styles.subTabActive]}
              >
                <Text style={[styles.subTabText, calcTab === 'cycle' && styles.subTabTextActive]}>
                  Cycle Length
                </Text>
              </TouchableOpacity>
            </View>

            {calcTab === 'reconstitution' && (
              <View style={styles.calcSection}>
                <Text style={styles.sectionTitle}>Reconstitution Calculator</Text>
                <Text style={styles.sectionDesc}>
                  Calculate how much to draw for your dose.
                </Text>

                <View style={styles.inputGroup}>
                  <InputField
                    label="Vial Size"
                    value={vialMg}
                    onChangeText={setVialMg}
                    placeholder="e.g. 5"
                    unit="mg"
                  />
                  <InputField
                    label="Bacteriostatic Water"
                    value={bacWaterMl}
                    onChangeText={setBacWaterMl}
                    placeholder="e.g. 2"
                    unit="mL"
                  />
                  <InputField
                    label="Desired Dose"
                    value={doseMcg}
                    onChangeText={setDoseMcg}
                    placeholder="e.g. 250"
                    unit="mcg"
                  />
                </View>

                {reconResults && (
                  <ResultCard title="Results" results={reconResults} />
                )}
              </View>
            )}

            {calcTab === 'cycle' && (
              <View style={styles.calcSection}>
                <Text style={styles.sectionTitle}>Cycle Length Estimator</Text>
                <Text style={styles.sectionDesc}>
                  Estimate when your cycle will end.
                </Text>

                <View style={styles.inputGroup}>
                  <InputField
                    label="Start Date"
                    value={cycleStart}
                    onChangeText={setCycleStart}
                    placeholder="YYYY-MM-DD"
                    keyboardType="default"
                  />
                  <InputField
                    label="Frequency"
                    value={cycleFreq}
                    onChangeText={setCycleFreq}
                    placeholder="e.g. 7"
                    unit="days"
                  />
                  <InputField
                    label="Number of Doses"
                    value={cycleDoses}
                    onChangeText={setCycleDoses}
                    placeholder="e.g. 12"
                  />
                </View>

                {cycleResults && (
                  <ResultCard title="Cycle Summary" results={cycleResults} />
                )}
              </View>
            )}
          </View>
        )}

        {/* ═══════════ Reference Section ═══════════ */}
        {activeSection === 'reference' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Half-Life Reference</Text>
            <Text style={styles.sectionDesc}>
              Lookup half-lives and typical dosing for common peptides.
            </Text>

            <View style={styles.searchRow}>
              <Feather
                name="search"
                size={18}
                color={Colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search peptides..."
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {filteredPeptides.map((p) => (
              <Card key={p.name} style={styles.peptideCard}>
                <View style={styles.peptideHeader}>
                  <Text style={styles.peptideName}>{p.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{p.category}</Text>
                  </View>
                </View>
                <View style={styles.peptideDetails}>
                  <Text style={styles.peptideDetail}>
                    Half-life: {formatHalfLife(p.half_life_hours)}
                  </Text>
                  <Text style={styles.peptideDetail}>
                    Typical dose: {p.typical_dose_mcg >= 1000
                      ? `${p.typical_dose_mcg / 1000}mg`
                      : `${p.typical_dose_mcg}mcg`}
                  </Text>
                  <Text style={styles.peptideDetail}>
                    Frequency: {p.frequency_options.join(', ')}
                  </Text>
                </View>
              </Card>
            ))}

            {filteredPeptides.length === 0 && (
              <Text style={styles.emptyText}>No peptides match your search.</Text>
            )}
          </View>
        )}

        {/* Tab bar spacer */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>

      {/* Calendar modals */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  } as ViewStyle,
  title: {
    ...Typography.h1,
    marginBottom: Spacing.lg,
  } as TextStyle,
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  } as ViewStyle,
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  } as ViewStyle,
  segmentActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  } as ViewStyle,
  segmentText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  } as TextStyle,
  segmentTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  } as TextStyle,
  section: {
    gap: Spacing.lg,
  } as ViewStyle,
  calendar: {
    borderRadius: 16,
  } as ViewStyle,
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
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
    alignSelf: 'flex-end',
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
  subTabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  } as ViewStyle,
  subTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  } as ViewStyle,
  subTabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  } as ViewStyle,
  subTabText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  } as TextStyle,
  subTabTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  } as TextStyle,
  calcSection: {
    gap: Spacing.lg,
  } as ViewStyle,
  sectionTitle: {
    ...Typography.h2,
  } as TextStyle,
  sectionDesc: {
    ...Typography.bodySmall,
  } as TextStyle,
  inputGroup: {
    gap: Spacing.md,
  } as ViewStyle,
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  searchIcon: {
    marginRight: Spacing.sm,
  } as TextStyle,
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  peptideCard: {
    gap: Spacing.sm,
  } as ViewStyle,
  peptideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  peptideName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  } as TextStyle,
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  } as ViewStyle,
  categoryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.primary,
  } as TextStyle,
  peptideDetails: {
    gap: Spacing.xs,
  } as ViewStyle,
  peptideDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  } as TextStyle,
  tabBarSpacer: {
    height: 80,
  } as ViewStyle,
});
