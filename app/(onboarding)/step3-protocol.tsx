import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { peptides } from '@/constants/peptides';
import { addCompound } from '@/db/queries';
import type { PeptideInfo } from '@/types';

type ProtocolChoice = 'active' | 'fresh' | null;
type FrequencyOption = 'Daily' | 'EOD' | '3x/week' | 'Weekly';

interface AddedCompound {
  name: string;
  dose_mcg: number;
  frequency: string;
  half_life_hours: number;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = ['Daily', 'EOD', '3x/week', 'Weekly'];

export default function Step3Protocol() {
  const router = useRouter();
  const [choice, setChoice] = useState<ProtocolChoice>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedPeptide, setSelectedPeptide] = useState<PeptideInfo | null>(null);
  const [doseInput, setDoseInput] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>('Daily');
  const [addedCompounds, setAddedCompounds] = useState<AddedCompound[]>([]);

  const filteredPeptides = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return peptides.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const selectPeptide = (peptide: PeptideInfo) => {
    setSelectedPeptide(peptide);
    setSearchQuery(peptide.name);
    setDoseInput(String(peptide.typical_dose_mcg));
    setShowResults(false);
  };

  const addToProtocol = () => {
    if (!selectedPeptide || !doseInput) return;
    setAddedCompounds((prev) => [
      ...prev,
      {
        name: selectedPeptide.name,
        dose_mcg: Number(doseInput),
        frequency: selectedFrequency,
        half_life_hours: selectedPeptide.half_life_hours,
      },
    ]);
    setSelectedPeptide(null);
    setSearchQuery('');
    setDoseInput('');
    setSelectedFrequency('Daily');
  };

  const removeCompound = (index: number) => {
    setAddedCompounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    for (const compound of addedCompounds) {
      await addCompound({
        name: compound.name,
        dose_mcg: compound.dose_mcg,
        frequency: compound.frequency.toLowerCase(),
        start_date: new Date().toISOString().split('T')[0],
        active: 1,
        vial_size_mg: null,
        bac_water_ml: null,
        half_life_hours: compound.half_life_hours,
        notes: '',
      });
    }
    router.push('/(onboarding)/step4-notifications');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ProgressBar progress={3 / 7} style={styles.progress} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Are you already running a protocol?</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setChoice('active')}
        >
          <Card style={choice === 'active' ? styles.cardSelected : styles.cardDefault}>
            <Text style={styles.cardTitle}>Yes, I have an active protocol</Text>
            <Text style={styles.cardSubtitle}>Let's set it up</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setChoice('fresh')}
          style={styles.cardGap}
        >
          <Card style={choice === 'fresh' ? styles.cardSelected : styles.cardDefault}>
            <Text style={styles.cardTitle}>No, I'm starting fresh</Text>
            <Text style={styles.cardSubtitle}>We'll help you build one</Text>
          </Card>
        </TouchableOpacity>

        {choice === 'active' && (
          <View style={styles.protocolForm}>
            <Text style={styles.formLabel}>Search compound</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search peptides..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowResults(true);
                if (selectedPeptide && text !== selectedPeptide.name) {
                  setSelectedPeptide(null);
                }
              }}
              onFocus={() => setShowResults(true)}
            />

            {showResults && filteredPeptides.length > 0 && (
              <View style={styles.resultsContainer}>
                {filteredPeptides.slice(0, 5).map((peptide) => (
                  <TouchableOpacity
                    key={peptide.name}
                    style={styles.resultItem}
                    onPress={() => selectPeptide(peptide)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resultName}>{peptide.name}</Text>
                    <Text style={styles.resultCategory}>{peptide.category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedPeptide && (
              <>
                <Text style={styles.formLabel}>Dose (mcg)</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter dose in mcg"
                  placeholderTextColor={Colors.textSecondary}
                  value={doseInput}
                  onChangeText={setDoseInput}
                  keyboardType="numeric"
                />

                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setSelectedFrequency(freq)}
                      activeOpacity={0.7}
                      style={[
                        styles.freqPill,
                        selectedFrequency === freq && styles.freqPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.freqPillText,
                          selectedFrequency === freq && styles.freqPillTextSelected,
                        ]}
                      >
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Start Date</Text>
                <View style={styles.dateDisplay}>
                  <Feather name="calendar" size={16} color={Colors.textSecondary} />
                  <Text style={styles.dateText}>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <Button
                  title="Add Compound"
                  variant="secondary"
                  onPress={addToProtocol}
                  disabled={!doseInput}
                  style={styles.addButton}
                />
              </>
            )}

            {addedCompounds.length > 0 && (
              <View style={styles.addedList}>
                <Text style={styles.formLabel}>Added compounds</Text>
                {addedCompounds.map((compound, index) => (
                  <View key={`${compound.name}-${index}`} style={styles.addedItem}>
                    <View style={styles.addedInfo}>
                      <Text style={styles.addedName}>{compound.name}</Text>
                      <Text style={styles.addedDetails}>
                        {compound.dose_mcg}mcg · {compound.frequency}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeCompound(index)}>
                      <Feather name="x-circle" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={handleContinue}
          disabled={choice === null}
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
  cardDefault: {
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardGap: {
    marginTop: Spacing.md,
  },
  cardTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  protocolForm: {
    marginTop: Spacing.xxl,
  },
  formLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  resultsContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    marginTop: Spacing.xs,
    ...Shadow,
  },
  resultItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  resultCategory: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  freqPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  freqPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  freqPillText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  freqPillTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  dateText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  addButton: {
    marginTop: Spacing.lg,
  },
  addedList: {
    marginTop: Spacing.lg,
  },
  addedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  addedInfo: {
    flex: 1,
  },
  addedName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addedDetails: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});
