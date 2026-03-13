import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { createUser, getUser, updateUser } from '@/db/queries';
import { seedDemoData } from '@/db/queries';
import { useOnboarding } from '@/contexts/OnboardingContext';

type PricingPlan = 'monthly' | 'annual';

const GREEN = '#4CAF7D';

interface ComparisonRow {
  feature: string;
  free: boolean;
  pro: boolean;
}

const COMPARISON: ComparisonRow[] = [
  { feature: 'Basic logging', free: true, pro: true },
  { feature: '3 compounds', free: true, pro: true },
  { feature: 'Unlimited compounds', free: false, pro: true },
  { feature: 'Reconstitution calculator', free: false, pro: true },
  { feature: 'Half-life charts', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
];

export default function Step7Paywall() {
  const router = useRouter();
  const { completeOnboarding: markOnboardingComplete } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('annual');

  const completeOnboarding = async () => {
    try {
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

      // Seed demo data for the heatmap and dashboard
      await seedDemoData();

      await markOnboardingComplete();
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_goals',
        'onboarding_artie_mode',
        'onboarding_reminder_enabled',
        'onboarding_reminder_time',
      ]);
    } catch (e) {
      console.log('Error saving onboarding state:', e);
      await markOnboardingComplete();
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

        {/* Free vs Pro Comparison */}
        <View style={styles.comparisonTable}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonFeatureLabel}>Feature</Text>
            <Text style={styles.comparisonColLabel}>Free</Text>
            <Text style={[styles.comparisonColLabel, { color: GREEN }]}>Pro</Text>
          </View>
          {COMPARISON.map((row) => (
            <View key={row.feature} style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>{row.feature}</Text>
              <View style={styles.comparisonCol}>
                {row.free ? (
                  <Feather name="check" size={16} color={Colors.textSecondary} />
                ) : (
                  <Feather name="minus" size={16} color={Colors.border} />
                )}
              </View>
              <View style={styles.comparisonCol}>
                {row.pro ? (
                  <Feather name="check" size={16} color={GREEN} />
                ) : (
                  <Feather name="minus" size={16} color={Colors.border} />
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingCards}>
          {/* Annual — highlighted */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.7}
            style={[
              styles.pricingCard,
              selectedPlan === 'annual' && styles.pricingCardAnnual,
            ]}
          >
            <View style={styles.pricingCardHeader}>
              <Text style={[styles.pricingLabel, selectedPlan === 'annual' && styles.pricingLabelActive]}>
                Annual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 52%</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceMain, selectedPlan === 'annual' && styles.priceMainActive]}>
                $39.99
              </Text>
              <Text style={styles.pricePer}>/year</Text>
            </View>
            <Text style={styles.priceCalculated}>$3.33/mo</Text>
            {selectedPlan === 'annual' && (
              <View style={styles.bestValueTag}>
                <Text style={styles.bestValueText}>Best Value</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardMonthly,
            ]}
          >
            <Text style={[styles.pricingLabel, selectedPlan === 'monthly' && { color: Colors.primary }]}>
              Monthly
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceMain, selectedPlan === 'monthly' && { color: Colors.primary }]}>
                $6.99
              </Text>
              <Text style={styles.pricePer}>/month</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start Free Trial — 7 Days Free" onPress={handleStartTrial} />
        <Text style={styles.cancelNote}>then $39.99/year {'\u2022'} Cancel anytime</Text>
        <Text style={styles.trustedNote}>Trusted by 2,400+ users</Text>
        <TouchableOpacity onPress={handleFreePlan} style={styles.freeLink}>
          <Text style={styles.freeLinkText}>Continue with Free Plan →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const GREEN_COLOR = '#4CAF7D';

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
    marginBottom: Spacing.xxl,
  },
  // Comparison table
  comparisonTable: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  comparisonFeatureLabel: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonColLabel: {
    width: 48,
    textAlign: 'center',
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  comparisonFeature: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  comparisonCol: {
    width: 48,
    alignItems: 'center',
  },
  // Pricing cards
  pricingCards: {
    gap: Spacing.md,
  },
  pricingCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    position: 'relative',
  },
  pricingCardAnnual: {
    backgroundColor: '#F0FAF4',
    borderColor: GREEN_COLOR,
    borderWidth: 2,
  },
  pricingCardMonthly: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pricingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pricingLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  pricingLabelActive: {
    color: GREEN_COLOR,
  },
  saveBadge: {
    backgroundColor: GREEN_COLOR,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  saveBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceMain: {
    fontFamily: Fonts.bodyBold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  priceMainActive: {
    color: GREEN_COLOR,
  },
  pricePer: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceCalculated: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: GREEN_COLOR,
    marginTop: 2,
  },
  bestValueTag: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    backgroundColor: GREEN_COLOR,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  bestValueText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.white,
  },
  // Footer
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cancelNote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trustedNote: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
