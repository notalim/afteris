import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import type { Compound } from '@/types';

interface CalendarLogModalProps {
  visible: boolean;
  compounds: Compound[];
  date: string;
  onClose: () => void;
  onSubmit: (data: {
    compound_id: number;
    dose_mcg: number;
    site: string;
    notes: string;
    is_late_log: number;
  }) => void;
}

const INJECTION_SITES = ['Abdomen', 'Thigh', 'Deltoid', 'Glute'];

export function CalendarLogModal({
  visible,
  compounds,
  date,
  onClose,
  onSubmit,
}: CalendarLogModalProps) {
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null);
  const [dose, setDose] = useState('');
  const [site, setSite] = useState('Abdomen');
  const [notes, setNotes] = useState('');
  const submittingRef = useRef(false);

  const handleOpen = () => {
    submittingRef.current = false;
    setSelectedCompound(compounds.length > 0 ? compounds[0].id : null);
    setDose(compounds.length > 0 && compounds[0].dose_mcg ? String(compounds[0].dose_mcg) : '');
    setSite('Abdomen');
    setNotes('');
  };

  const selectCompound = (id: number) => {
    setSelectedCompound(id);
    const c = compounds.find((cp) => cp.id === id);
    if (c?.dose_mcg) setDose(String(c.dose_mcg));
  };

  const today = new Date().toISOString().split('T')[0];
  const isLateLog = date < today ? 1 : 0;

  const handleSubmit = () => {
    if (submittingRef.current) return;
    if (!selectedCompound) return;
    const doseNum = parseFloat(dose);
    if (isNaN(doseNum) || doseNum <= 0) return;

    submittingRef.current = true;
    onSubmit({
      compound_id: selectedCompound,
      dose_mcg: doseNum,
      site,
      notes,
      is_late_log: isLateLog,
    });
  };

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Log Injection — {formattedDate}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Compound</Text>
            <View style={styles.compoundRow}>
              {compounds.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => selectCompound(c.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.compoundPill,
                    selectedCompound === c.id && styles.compoundPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.compoundText,
                      selectedCompound === c.id && styles.compoundTextSelected,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
          </ScrollView>

          <Button
            title={isLateLog ? 'Log Late Entry' : 'Log Injection'}
            onPress={handleSubmit}
            disabled={!selectedCompound || !dose || parseFloat(dose) <= 0}
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
    backgroundColor: 'rgba(0,0,0,0.25)',
  } as ViewStyle,
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
    maxHeight: '80%',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  title: {
    ...Typography.h2,
    fontSize: 18,
  } as TextStyle,
  scrollArea: {
    flexGrow: 0,
    marginBottom: Spacing.lg,
  } as ViewStyle,
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
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
  compoundRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  } as ViewStyle,
  compoundPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  } as ViewStyle,
  compoundPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  } as ViewStyle,
  compoundText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  } as TextStyle,
  compoundTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
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
