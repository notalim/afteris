import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import type { Compound } from '@/types';

interface LogModalProps {
  visible: boolean;
  compound: Compound | null;
  onClose: () => void;
  onSubmit: (data: {
    compound_id: number;
    dose_mcg: number;
    site: string;
    notes: string;
  }) => void;
}

const INJECTION_SITES = ['Abdomen', 'Thigh', 'Deltoid', 'Glute'];

export function LogModal({ visible, compound, onClose, onSubmit }: LogModalProps) {
  const [dose, setDose] = useState('');
  const [site, setSite] = useState('Abdomen');
  const [notes, setNotes] = useState('');

  const handleOpen = () => {
    if (compound) {
      setDose(compound.dose_mcg ? String(compound.dose_mcg) : '');
      setSite('Abdomen');
      setNotes('');
    }
  };

  const handleSubmit = () => {
    if (!compound) return;
    const doseNum = parseFloat(dose);
    if (isNaN(doseNum) || doseNum <= 0) return;

    onSubmit({
      compound_id: compound.id,
      dose_mcg: doseNum,
      site,
      notes,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Log {compound?.name ?? 'Injection'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Dose (mcg)</Text>
          <TextInput
            style={styles.input}
            value={dose}
            onChangeText={setDose}
            keyboardType="numeric"
            placeholder="e.g. 250"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Injection Site</Text>
          <View style={styles.siteRow}>
            {INJECTION_SITES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSite(s)}
                activeOpacity={0.7}
                style={[styles.sitePill, site === s && styles.sitePillSelected]}
              >
                <Text style={[styles.siteText, site === s && styles.siteTextSelected]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any observations..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />

          <Button
            title="Mark as Done ✓"
            onPress={handleSubmit}
            disabled={!dose || parseFloat(dose) <= 0}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  } as ViewStyle,
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
    gap: Spacing.md,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  title: {
    ...Typography.h2,
  } as TextStyle,
  label: {
    ...Typography.label,
  } as TextStyle,
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  } as TextStyle,
  siteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  } as ViewStyle,
  sitePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  } as ViewStyle,
  sitePillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  } as ViewStyle,
  siteText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  } as TextStyle,
  siteTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  } as TextStyle,
});
