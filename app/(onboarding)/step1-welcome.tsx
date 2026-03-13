import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { getUser, createUser, updateUser, seedDemoData } from '@/db/queries';

export default function Step1Welcome() {
  const router = useRouter();
  const { skipToApp } = useOnboarding();

  const handleDevSkip = async () => {
    try {
      // Create a default user profile so the app doesn't crash
      const existingUser = await getUser();
      if (!existingUser) {
        await createUser('Dev User', ['Just Exploring'], 'calm');
      }
      await updateUser({
        name: 'Dev User',
        goals: JSON.stringify(['Just Exploring']),
        artie_mode: 'calm',
        reminder_enabled: 0,
        reminder_time: '09:00',
        has_completed_onboarding: 1,
      });
      // Seed demo data for heatmap and dashboard
      await seedDemoData();
      // Update context + AsyncStorage, which triggers the routing guard
      await skipToApp();
    } catch (e) {
      console.log('Dev skip error:', e);
      Alert.alert('Error', 'Could not skip onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotArea}>
          <View style={styles.mascotPlaceholder}>
            <Text style={styles.mascotText}>[Artie{'\n'}Illustration]</Text>
          </View>
        </View>

        <Text style={styles.heading}>
          Finally, a protocol tracker that actually gets it.
        </Text>

        <Text style={styles.subCopy}>
          Afteris helps you stay consistent, stay safe, and see results.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Let's Get Started →"
          onPress={() => router.push('/(onboarding)/step2-goals')}
        />

        <TouchableOpacity style={styles.ghostLink} activeOpacity={0.7}>
          <Text style={styles.ghostLinkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.devSkip}
          activeOpacity={0.6}
          onPress={handleDevSkip}
        >
          <Text style={styles.devSkipText}>Dev: Skip to App</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  mascotArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  mascotPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },
  heading: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subCopy: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ghostLink: {
    padding: Spacing.sm,
  },
  ghostLinkText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.primary,
  },
  devSkip: {
    padding: Spacing.xs,
    opacity: 0.4,
  },
  devSkipText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
