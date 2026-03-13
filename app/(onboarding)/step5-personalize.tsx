import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function Step5Personalize() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const canProceed = name.trim().length > 0;

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
        <Text style={styles.subtitle}>
          This helps us personalize your experience.
        </Text>

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
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={async () => {
            await AsyncStorage.setItem('onboarding_name', name.trim());
            await AsyncStorage.setItem('onboarding_artie_mode', 'calm');
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
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
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
  },
  nameInputFocused: {
    borderColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
