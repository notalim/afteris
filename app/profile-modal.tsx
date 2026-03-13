import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { getUser, getCompounds, getStreak } from '@/db/queries';
import { useInjectionLog } from '@/hooks/useInjectionLog';
import { useOnboarding } from '@/contexts/OnboardingContext';
import type { User } from '@/types';

export default function ProfileModal() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const [user, setUser] = useState<User | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [compoundCount, setCompoundCount] = useState(0);
  const { fetchBetweenDates } = useInjectionLog();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const u = await getUser();
        setUser(u);

        const s = await getStreak();
        setStreak(s);

        const compounds = await getCompounds(true);
        setCompoundCount(compounds.length);

        const logs = await fetchBetweenDates('2020-01-01', '2099-12-31');
        setTotalLogs(logs?.length ?? 0);
      })();
    }, [fetchBetweenDates]),
  );

  const handleRerunOnboarding = () => {
    Alert.alert(
      'Re-run Onboarding',
      'This will restart the onboarding flow. Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Re-run',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/(onboarding)/step1-welcome');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Close handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{totalLogs || 0}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{compoundCount || 0}</Text>
            <Text style={styles.statLabel}>Compounds</Text>
          </Card>
        </View>

        {/* Protocol Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Protocol</Text>
          <SettingsRow icon="clipboard" label="My Protocol" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="plus-circle" label="Add Compound" onPress={() => {}} />
        </Card>

        {/* Preferences Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsRow
            icon="bell"
            label="Notifications"
            value={user?.reminder_time ?? '09:00'}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="refresh-cw"
            label="Re-run Onboarding"
            onPress={handleRerunOnboarding}
          />
        </Card>

        {/* Integrations Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          <SettingsRow
            icon="heart"
            label="Apple Health"
            onPress={() =>
              Alert.alert(
                'Apple Health',
                'Apple Health integration will be available in the production build. It requires a custom build to access HealthKit.',
              )
            }
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="share-2"
            label="Refer a Friend"
            onPress={() =>
              Alert.alert(
                'Referral Program',
                'The referral program is coming soon. You\'ll be able to earn free Pro months by inviting friends.',
              )
            }
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="message-circle"
            label="Join Discord"
            onPress={() =>
              Alert.alert(
                'Discord Community',
                'The Afteris Discord community is launching soon. Stay tuned for the invite link.',
              )
            }
          />
        </Card>

        {/* Subscription Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <SettingsRow
            icon="credit-card"
            label="Manage Subscription"
            onPress={() => console.log('RevenueCat: manage')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="refresh-cw"
            label="Restore Purchases"
            onPress={() => console.log('RevenueCat: restore')}
          />
        </Card>

        {/* Data Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingsRow
            icon="download"
            label="Export Data"
            onPress={() => Alert.alert('Coming Soon', 'Data export is coming in a future update.')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="trash-2"
            label="Delete All Data"
            textColor={Colors.error}
            onPress={() =>
              Alert.alert(
                'Delete All Data',
                'This will permanently remove all your protocols, logs, and settings. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: () => console.log('Delete all data'),
                  },
                ],
              )
            }
          />
        </Card>

        {/* Legal Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <SettingsRow icon="shield" label="Privacy Policy" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="info" label="About Afteris" value="v1.0.0" />
        </Card>
      </ScrollView>
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
    gap: Spacing.lg,
  } as ViewStyle,
  handleRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  } as ViewStyle,
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  } as ViewStyle,
  headerCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  } as ViewStyle,
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  avatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 24,
    color: Colors.primary,
  } as TextStyle,
  userName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: Colors.textPrimary,
  } as TextStyle,
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  } as ViewStyle,
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  } as ViewStyle,
  statNumber: {
    fontFamily: Fonts.bodyBold,
    fontSize: 24,
    color: Colors.textPrimary,
  } as TextStyle,
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  } as TextStyle,
  sectionCard: {
    gap: 0,
  } as ViewStyle,
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing.xs,
  } as ViewStyle,
});
