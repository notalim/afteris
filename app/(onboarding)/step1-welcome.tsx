import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export default function Step1Welcome() {
  const router = useRouter();

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
});
