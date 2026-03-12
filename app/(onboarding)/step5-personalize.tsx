import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ArtieMode } from '@/types';

interface PersonalityOption {
  mode: ArtieMode;
  label: string;
  subtitle: string;
}

const PERSONALITIES: PersonalityOption[] = [
  { mode: 'calm', label: 'Calm', subtitle: 'Gentle and encouraging' },
  { mode: 'hype', label: 'Hype', subtitle: 'Energetic and motivating' },
  { mode: 'nerdy', label: 'Nerdy', subtitle: 'Science-forward and detailed' },
];

export default function Step5Personalize() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<ArtieMode | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const canProceed = name.trim().length > 0 && selectedMode !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={5 / 7} style={styles.progress} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>What should we call you?</Text>

        <TextInput
          style={[styles.nameInput, inputFocused && styles.nameInputFocused]}
          placeholder="Your first name"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.subtitle}>And give Artie a little personality:</Text>

        <View style={styles.personalityRow}>
          {PERSONALITIES.map((p) => {
            const isSelected = selectedMode === p.mode;
            return (
              <TouchableOpacity
                key={p.mode}
                onPress={() => setSelectedMode(p.mode)}
                activeOpacity={0.7}
                style={[styles.personalityCard, isSelected && styles.personalityCardSelected]}
              >
                <View style={[styles.artieCircle, isSelected && styles.artieCircleSelected]}>
                  <Text style={styles.artieEmoji}>
                    {p.mode === 'calm' ? '😌' : p.mode === 'hype' ? '🔥' : '🧬'}
                  </Text>
                </View>
                <Text style={[styles.personalityLabel, isSelected && styles.personalityLabelSelected]}>
                  {p.label}
                </Text>
                <Text style={styles.personalitySubtitle}>{p.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={async () => {
            await AsyncStorage.setItem('onboarding_name', name.trim());
            await AsyncStorage.setItem('onboarding_artie_mode', selectedMode!);
            router.push('/(onboarding)/step6-social');
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
    paddingBottom: Spacing.xxl,
  },
  heading: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxl,
  },
  nameInputFocused: {
    borderColor: Colors.primary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  personalityRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  personalityCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: 'center',
  },
  personalityCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  artieCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  artieCircleSelected: {
    backgroundColor: Colors.white,
  },
  artieEmoji: {
    fontSize: 24,
  },
  personalityLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  personalityLabelSelected: {
    color: Colors.primary,
  },
  personalitySubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
