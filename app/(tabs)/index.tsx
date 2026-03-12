import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { MascotBlock } from '@/components/ui/MascotBlock';
import { ProfileButton } from '@/components/dashboard/ProfileButton';
import { StreakChart } from '@/components/charts/StreakChart';
import { DecayCurve } from '@/components/charts/DecayCurve';
import { UpcomingCard } from '@/components/dashboard/UpcomingCard';
import { LogModal } from '@/components/dashboard/LogModal';
import { useProtocol } from '@/hooks/useProtocol';
import { useInjectionLog } from '@/hooks/useInjectionLog';
import { getUser } from '@/db/queries';
import { tips } from '@/constants/tips';
import type { Compound, ArtieMode } from '@/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTipOfTheDay(mode: ArtieMode): string {
  const modeTips = tips.filter((t) => t.personality === mode);
  if (modeTips.length === 0) return 'Stay consistent!';
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return modeTips[dayOfYear % modeTips.length].text;
}

export default function DashboardScreen() {
  const { compounds, refresh: refreshCompounds } = useProtocol();
  const { streak, log, refreshStreak, fetchBetweenDates } = useInjectionLog();
  const [userName, setUserName] = useState('');
  const [artieMode, setArtieMode] = useState<ArtieMode>('calm');
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [weekData, setWeekData] = useState<boolean[]>([false, false, false, false, false, false, false]);

  const loadUser = useCallback(async () => {
    const user = await getUser();
    if (user) {
      setUserName(user.name);
      setArtieMode(user.artie_mode);
    }
  }, []);

  const loadWeekData = useCallback(async () => {
    const today = new Date();
    const days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const logs = await fetchBetweenDates(dateStr, dateStr);
      days.push((logs?.length ?? 0) > 0);
    }
    setWeekData(days);
  }, [fetchBetweenDates]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      refreshCompounds();
      refreshStreak();
      loadWeekData();
    }, [loadUser, refreshCompounds, refreshStreak, loadWeekData])
  );

  const greeting = useMemo(() => getGreeting(), []);
  const dailyTip = useMemo(() => getTipOfTheDay(artieMode), [artieMode]);

  const handleLogPress = (compound: Compound) => {
    setSelectedCompound(compound);
    setLogModalVisible(true);
  };

  const handleLogSubmit = async (data: {
    compound_id: number;
    dose_mcg: number;
    site: string;
    notes: string;
  }) => {
    await log({
      compound_id: data.compound_id,
      logged_at: new Date().toISOString(),
      dose_mcg: data.dose_mcg,
      site: data.site,
      is_late_log: 0,
      notes: data.notes,
    });
    setLogModalVisible(false);
    setSelectedCompound(null);
    refreshStreak();
    loadWeekData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header row with greeting + profile button */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>
            {greeting}, {userName || 'friend'}.
          </Text>
          <ProfileButton initial={userName ? userName.charAt(0).toUpperCase() : '?'} />
        </View>

        {/* Streak Chart */}
        <StreakChart dayData={weekData} streak={streak} />

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {compounds.length === 0 ? (
          <Text style={styles.emptyText}>
            No active compounds yet. Add one from the onboarding or profile.
          </Text>
        ) : (
          <FlatList
            data={compounds}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <UpcomingCard compound={item} onLog={handleLogPress} />
            )}
            style={styles.scheduleList}
            contentContainerStyle={styles.scheduleListContent}
          />
        )}

        {/* Active Compounds */}
        <Text style={styles.sectionTitle}>Active Compounds</Text>
        {compounds.length === 0 ? (
          <Text style={styles.emptyText}>No active compounds.</Text>
        ) : (
          compounds.map((c) => (
            <Card key={c.id} style={styles.compoundCard}>
              <View style={styles.compoundRow}>
                <View style={styles.compoundInfo}>
                  <Text style={styles.compoundName}>{c.name}</Text>
                  <Text style={styles.compoundDetail}>
                    {c.dose_mcg ? `${c.dose_mcg} mcg` : 'Dose not set'} • {c.frequency}
                  </Text>
                  {c.half_life_hours ? (
                    <Text style={styles.compoundDetail}>
                      Half-life: {c.half_life_hours}h
                    </Text>
                  ) : null}
                </View>
                {c.half_life_hours ? (
                  <DecayCurve halfLifeHours={c.half_life_hours} />
                ) : (
                  <View style={styles.halfLifePlaceholder}>
                    <Text style={styles.halfLifeText}>N/A</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}

        <MascotBlock text={dailyTip} />

        {/* Tab bar spacer */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>

      <LogModal
        visible={logModalVisible}
        compound={selectedCompound}
        onClose={() => {
          setLogModalVisible(false);
          setSelectedCompound(null);
        }}
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
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  greeting: {
    ...Typography.h1,
    fontSize: 26,
    lineHeight: 34,
    flex: 1,
  } as TextStyle,
  sectionTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  } as TextStyle,
  emptyText: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
  } as TextStyle,
  scheduleList: {
    marginHorizontal: -Spacing.lg,
  } as ViewStyle,
  scheduleListContent: {
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  compoundCard: {
    marginBottom: Spacing.sm,
  } as ViewStyle,
  compoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  compoundInfo: {
    flex: 1,
    gap: 2,
  } as ViewStyle,
  compoundName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  compoundDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  halfLifePlaceholder: {
    width: 64,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  } as ViewStyle,
  halfLifeText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.primary,
  } as TextStyle,
  tabBarSpacer: {
    height: 80,
  } as ViewStyle,
});
