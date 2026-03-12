import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MascotBlock } from '@/components/ui/MascotBlock';

type TimePreset = 'morning' | 'afternoon' | 'evening' | 'custom';

interface PresetOption {
  key: TimePreset;
  label: string;
  time: string;
  display: string;
}

const TIME_PRESETS: PresetOption[] = [
  { key: 'morning', label: 'Morning', time: '08:00', display: '8 AM' },
  { key: 'afternoon', label: 'Afternoon', time: '12:00', display: '12 PM' },
  { key: 'evening', label: 'Evening', time: '18:00', display: '6 PM' },
  { key: 'custom', label: 'Custom', time: '', display: '' },
];

const CUSTOM_TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
];

export default function Step4Notifications() {
  const router = useRouter();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>('morning');
  const [customTime, setCustomTime] = useState('09:00');

  const getReminderTime = (): string => {
    if (selectedPreset === 'custom') return customTime;
    const preset = TIME_PRESETS.find((p) => p.key === selectedPreset);
    return preset?.time ?? '09:00';
  };

  const handleContinue = async () => {
    if (remindersEnabled) {
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.log('Notification permission request failed:', e);
      }
    }
    await AsyncStorage.setItem('onboarding_reminder_enabled', remindersEnabled ? '1' : '0');
    await AsyncStorage.setItem('onboarding_reminder_time', getReminderTime());
    router.push('/(onboarding)/step5-personalize');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={4 / 7} style={styles.progress} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.heading}>Never miss a dose.</Text>

        <MascotBlock text="I'll remind you — promise! 🧡" style={styles.mascot} />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Enable Reminders</Text>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={remindersEnabled ? Colors.primary : Colors.white}
          />
        </View>

        {remindersEnabled && (
          <View style={styles.presetsSection}>
            <Text style={styles.presetsLabel}>Reminder time</Text>
            <View style={styles.presetsRow}>
              {TIME_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.key}
                  onPress={() => setSelectedPreset(preset.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.presetPill,
                    selectedPreset === preset.key && styles.presetPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedPreset === preset.key && styles.presetTextSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                  {preset.display !== '' && (
                    <Text
                      style={[
                        styles.presetTime,
                        selectedPreset === preset.key && styles.presetTimeSelected,
                      ]}
                    >
                      {preset.display}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedPreset === 'custom' && (
              <View style={styles.customSection}>
                <Text style={styles.customLabel}>Pick a time</Text>
                <View style={styles.customGrid}>
                  {CUSTOM_TIME_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setCustomTime(opt.value)}
                      activeOpacity={0.7}
                      style={[
                        styles.timeChip,
                        customTime === opt.value && styles.timeChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          customTime === opt.value && styles.timeChipTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.changeLaterHint}>
              You can always change this later in Settings.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue →" onPress={handleContinue} />
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
  mascot: {
    marginBottom: Spacing.xxl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  toggleLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  presetsSection: {
    gap: Spacing.md,
  },
  presetsLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  presetPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  presetText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  presetTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  },
  presetTime: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  presetTimeSelected: {
    color: Colors.primary,
  },
  customSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  customLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  customGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  timeChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  timeChipTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  },
  changeLaterHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
