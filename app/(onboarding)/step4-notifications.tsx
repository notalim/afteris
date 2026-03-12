import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MascotBlock } from '@/components/ui/MascotBlock';

type TimePreset = 'morning' | 'midday' | 'evening' | 'custom';

interface PresetOption {
  key: TimePreset;
  label: string;
  time: string;
}

const TIME_PRESETS: PresetOption[] = [
  { key: 'morning', label: 'Morning', time: '08:00' },
  { key: 'midday', label: 'Midday', time: '12:00' },
  { key: 'evening', label: 'Evening', time: '18:00' },
  { key: 'custom', label: 'Custom', time: '' },
];

export default function Step4Notifications() {
  const router = useRouter();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>('morning');
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('00');

  const getReminderTime = (): string => {
    if (selectedPreset === 'custom') return `${customHour}:${customMinute}`;
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

      <View style={styles.content}>
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
                  {preset.key !== 'custom' && (
                    <Text
                      style={[
                        styles.presetTime,
                        selectedPreset === preset.key && styles.presetTimeSelected,
                      ]}
                    >
                      {preset.key === 'morning'
                        ? '8 AM'
                        : preset.key === 'midday'
                        ? '12 PM'
                        : '6 PM'}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedPreset === 'custom' && (
              <View style={styles.customTimeRow}>
                <TextInput
                  style={styles.timeInput}
                  value={customHour}
                  onChangeText={(t) => setCustomHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="numeric"
                  placeholder="HH"
                  placeholderTextColor={Colors.textSecondary}
                  maxLength={2}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={customMinute}
                  onChangeText={(t) => setCustomMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="numeric"
                  placeholder="MM"
                  placeholderTextColor={Colors.textSecondary}
                  maxLength={2}
                />
              </View>
            )}
          </View>
        )}
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
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
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  timeInput: {
    width: 64,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.bodyMedium,
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
