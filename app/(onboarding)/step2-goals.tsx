import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { GoalOption } from '@/types';

const GOAL_OPTIONS: GoalOption[] = [
  'Recovery & Healing',
  'Body Composition',
  'Longevity',
  'Sleep & Recovery',
  'Cognitive Performance',
  'Focus & Clarity',
  'Looksmaxxing',
  'Just Exploring',
];

export default function Step2Goals() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<GoalOption[]>([]);

  const toggleGoal = (goal: GoalOption) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const canProceed = selectedGoals.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={2 / 7} style={styles.progress} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.heading}>What are you focused on?</Text>
        <Text style={styles.subtitle}>We'll personalize your experience.</Text>

        <View style={styles.pillGrid}>
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoals.includes(goal);
            return (
              <TouchableOpacity
                key={goal}
                onPress={() => toggleGoal(goal)}
                activeOpacity={0.7}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={async () => {
            await AsyncStorage.setItem('onboarding_goals', JSON.stringify(selectedGoals));
            router.push('/(onboarding)/step3-protocol');
          }}
          disabled={!canProceed}
        />
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
  },
  heading: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pillText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pillTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
