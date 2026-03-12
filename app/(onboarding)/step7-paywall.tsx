import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { createUser, getUser, updateUser } from '@/db/queries';

type PricingPlan = 'monthly' | 'annual';

const VALUE_POINTS = [
  'Unlimited compounds & stack management',
  'Reconstitution calculator & half-life charts',
  'Daily tips from Artie + priority support',
];

export default function Step7Paywall() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('annual');

  const completeOnboarding = async () => {
    try {
      // Read all onboarding data from AsyncStorage
      const [nameVal, goalsVal, artieModeVal, reminderEnabledVal, reminderTimeVal] =
        await Promise.all([
          AsyncStorage.getItem('onboarding_name'),
          AsyncStorage.getItem('onboarding_goals'),
          AsyncStorage.getItem('onboarding_artie_mode'),
          AsyncStorage.getItem('onboarding_reminder_enabled'),
          AsyncStorage.getItem('onboarding_reminder_time'),
        ]);

      const userName = nameVal ?? '';
      const goals: string[] = goalsVal ? JSON.parse(goalsVal) : [];
      const artieMode = artieModeVal ?? 'calm';
      const reminderEnabled = reminderEnabledVal !== '0' ? 1 : 0;
      const reminderTime = reminderTimeVal ?? '09:00';

      // Save to SQLite
      const existingUser = await getUser();
      if (!existingUser) {
        await createUser(userName, goals, artieMode);
      }
      await updateUser({
        name: userName,
        goals: JSON.stringify(goals),
        artie_mode: artieMode as 'calm' | 'hype' | 'nerdy',
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime,
        has_completed_onboarding: 1,
      });

      // Set AsyncStorage flag and clean up temp keys
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_goals',
        'onboarding_artie_mode',
        'onboarding_reminder_enabled',
        'onboarding_reminder_time',
      ]);
    } catch (e) {
      console.log('Error saving onboarding state:', e);
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    }
  };

  const handleStartTrial = async () => {
    console.log(`[RevenueCat] startTrial: ${selectedPlan} plan`);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleFreePlan = async () => {
    console.log('[RevenueCat] User chose free plan');
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={7 / 7} style={styles.progress} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.heading}>Unlock your full protocol.</Text>

        <View style={styles.valueList}>
          {VALUE_POINTS.map((point) => (
            <View key={point} style={styles.valueRow}>
              <Feather name="check-circle" size={20} color={Colors.primary} />
              <Text style={styles.valueText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pricingToggle}>
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
            style={[styles.pricingPill, selectedPlan === 'monthly' && styles.pricingPillSelected]}
          >
            <Text
              style={[
                styles.pricingLabel,
                selectedPlan === 'monthly' && styles.pricingLabelSelected,
              ]}
            >
              Monthly
            </Text>
            <Text
              style={[
                styles.pricingPrice,
                selectedPlan === 'monthly' && styles.pricingPriceSelected,
              ]}
            >
              $6.99
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.7}
            style={[styles.pricingPill, selectedPlan === 'annual' && styles.pricingPillSelected]}
          >
            <View style={styles.annualHeader}>
              <Text
                style={[
                  styles.pricingLabel,
                  selectedPlan === 'annual' && styles.pricingLabelSelected,
                ]}
              >
                Annual
              </Text>
              <Badge label="Save 52%" />
            </View>
            <Text
              style={[
                styles.pricingPrice,
                selectedPlan === 'annual' && styles.pricingPriceSelected,
              ]}
            >
              $39.99
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start 7-Day Free Trial →" onPress={handleStartTrial} />
        <Text style={styles.cancelNote}>Cancel anytime. No charges during trial.</Text>
        <TouchableOpacity onPress={handleFreePlan} style={styles.freeLink}>
          <Text style={styles.freeLinkText}>Continue with Free Plan →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  progress: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  heading: {
    ...Typography.h1,
    marginBottom: Spacing.xxxl,
  },
  valueList: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  valueText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  pricingToggle: {
    gap: Spacing.md,
  },
  pricingPill: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
  },
  pricingPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  annualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pricingLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  pricingLabelSelected: {
    color: Colors.primary,
  },
  pricingPrice: {
    fontFamily: Fonts.bodyBold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  pricingPriceSelected: {
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  cancelNote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  freeLink: {
    padding: Spacing.sm,
  },
  freeLinkText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.primary,
  },
});
