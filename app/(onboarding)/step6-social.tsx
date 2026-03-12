import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MascotBlock } from '@/components/ui/MascotBlock';

interface Testimonial {
  name: string;
  age: number;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marcus',
    age: 34,
    quote: 'Finally off the spreadsheet. Afteris just works.',
  },
  {
    name: 'Priya',
    age: 28,
    quote: "The calculator alone is worth it. No more second-guessing.",
  },
  {
    name: 'Jake',
    age: 41,
    quote: "Artie keeps me accountable. It's like having a tiny coach.",
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
        <Text style={styles.heading}>You're in good company.</Text>

        {TESTIMONIALS.map((t) => (
          <Card key={t.name} style={styles.testimonialCard}>
            <Text style={styles.testimonialName}>
              {t.name}, {t.age}
            </Text>
            <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
          </Card>
        ))}

        <Text style={styles.stats}>
          20+ compounds tracked {'  \u2022  '} Built for biohackers
        </Text>

        <MascotBlock text="Almost there! Here's what's waiting for you →" />
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
  testimonialCard: {
    marginBottom: Spacing.md,
  },
  testimonialName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
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
    marginVertical: Spacing.xxl,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
