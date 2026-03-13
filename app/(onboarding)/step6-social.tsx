import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Testimonial {
  initials: string;
  color: string;
  name: string;
  handle: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'MR',
    color: '#5B8DEF',
    name: 'Marcus R.',
    handle: 'Peptide user, 8 months',
    quote: 'Finally off the spreadsheet. Afteris just works — I actually remember my doses now.',
  },
  {
    initials: 'PK',
    color: '#E88B5A',
    name: 'Priya K.',
    handle: 'BPC-157 protocol',
    quote: "The reconstitution calculator alone is worth it. No more second-guessing my draws.",
  },
  {
    initials: 'JT',
    color: '#4CAF7D',
    name: 'Jake T.',
    handle: 'Running 3 compounds',
    quote: "Tracking multiple peptides was a nightmare before. Now it takes 10 seconds.",
  },
];

export default function Step6Social() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={6 / 7} style={styles.progress} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.heading}>Join 2,400+ users{'\n'}tracking their protocols.</Text>

        <View style={styles.testimonialList}>
          {TESTIMONIALS.map((t) => (
            <View key={t.name} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <View style={[styles.avatar, { backgroundColor: t.color }]}>
                  <Text style={styles.avatarText}>{t.initials}</Text>
                </View>
                <View style={styles.testimonialMeta}>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialHandle}>{t.handle}</Text>
                </View>
              </View>
              <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
            </View>
          ))}
        </View>

        <Text style={styles.stats}>
          20+ compounds tracked  {'\u2022'}  Built for biohackers
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={() => router.push('/(onboarding)/step7-paywall')}
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
    paddingBottom: Spacing.xxl,
  },
  heading: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  testimonialList: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  testimonialCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  testimonialMeta: {
    flex: 1,
    gap: 2,
  },
  testimonialName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  testimonialHandle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  testimonialQuote: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  stats: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
