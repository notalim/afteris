import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { InputField } from '@/components/calculator/InputField';
import { ResultCard } from '@/components/calculator/ResultCard';
import { peptides } from '@/constants/peptides';

type Section = 'reconstitution' | 'cycle' | 'halflife';

export default function CalculatorScreen() {
  const [activeSection, setActiveSection] = useState<Section>('reconstitution');

  // Reconstitution state
  const [vialMg, setVialMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [doseMcg, setDoseMcg] = useState('');

  // Cycle length state
  const [cycleStart, setCycleStart] = useState('');
  const [cycleFreq, setCycleFreq] = useState('');
  const [cycleDoses, setCycleDoses] = useState('');

  // Half-life search
  const [search, setSearch] = useState('');

  // Reconstitution calculations
  const reconResults = useMemo(() => {
    const vial = parseFloat(vialMg);
    const water = parseFloat(bacWaterMl);
    const dose = parseFloat(doseMcg);
    if (!vial || !water || vial <= 0 || water <= 0) return null;

    const concentration = (vial * 1000) / water; // mcg per mL
    const results: { label: string; value: string }[] = [
      { label: 'Concentration', value: `${concentration.toFixed(1)} mcg/mL` },
    ];

    if (dose && dose > 0) {
      const mlToDraw = dose / concentration;
      const units = mlToDraw * 100;
      const dosesPerVial = (vial * 1000) / dose;
      results.push(
        { label: 'mL to draw', value: `${mlToDraw.toFixed(3)} mL` },
        { label: 'Units (U-100)', value: `${units.toFixed(1)} IU` },
        { label: 'Doses per vial', value: `${Math.floor(dosesPerVial)}` },
      );
    }

    return results;
  }, [vialMg, bacWaterMl, doseMcg]);

  // Cycle length calculations
  const cycleResults = useMemo(() => {
    const freqDays = parseFloat(cycleFreq);
    const numDoses = parseInt(cycleDoses, 10);
    if (!freqDays || !numDoses || freqDays <= 0 || numDoses <= 0) return null;
    if (!cycleStart) return null;

    const startParts = cycleStart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!startParts) return null;

    const start = new Date(cycleStart + 'T12:00:00');
    if (isNaN(start.getTime())) return null;

    const totalDays = (numDoses - 1) * freqDays;
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + totalDays);

    const endStr = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return [
      { label: 'End date', value: endStr },
      { label: 'Total days', value: `${totalDays}` },
      { label: 'Total doses', value: `${numDoses}` },
    ];
  }, [cycleStart, cycleFreq, cycleDoses]);

  // Filtered peptides
  const filteredPeptides = useMemo(() => {
    if (!search.trim()) return peptides;
    const q = search.toLowerCase();
    return peptides.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
    );
  }, [search]);

  const formatHalfLife = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 48) return `${hours} hr`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Calculator</Text>

        {/* Section tabs */}
        <View style={styles.tabRow}>
          {([
            ['reconstitution', 'Reconstitution'],
            ['cycle', 'Cycle Length'],
            ['halflife', 'Half-Life'],
          ] as [Section, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveSection(key)}
              activeOpacity={0.7}
              style={[styles.tab, activeSection === key && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeSection === key && styles.tabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reconstitution Calculator */}
        {activeSection === 'reconstitution' && (
          <FadeIn><View style={styles.section}>
            <Text style={styles.sectionTitle}>Reconstitution Calculator</Text>
            <Text style={styles.sectionDesc}>
              Calculate how much to draw for your dose.
            </Text>

            <View style={styles.inputGroup}>
              <InputField
                label="Vial Size"
                value={vialMg}
                onChangeText={setVialMg}
                placeholder="e.g. 5"
                unit="mg"
              />
              <InputField
                label="Bacteriostatic Water"
                value={bacWaterMl}
                onChangeText={setBacWaterMl}
                placeholder="e.g. 2"
                unit="mL"
              />
              <InputField
                label="Desired Dose"
                value={doseMcg}
                onChangeText={setDoseMcg}
                placeholder="e.g. 250"
                unit="mcg"
              />
            </View>

            {reconResults && (
              <ResultCard title="Results" results={reconResults} />
            )}
          </View></FadeIn>
        )}

        {/* Cycle Length Estimator */}
        {activeSection === 'cycle' && (
          <FadeIn><View style={styles.section}>
            <Text style={styles.sectionTitle}>Cycle Length Estimator</Text>
            <Text style={styles.sectionDesc}>
              Estimate when your cycle will end.
            </Text>

            <View style={styles.inputGroup}>
              <InputField
                label="Start Date"
                value={cycleStart}
                onChangeText={setCycleStart}
                placeholder="YYYY-MM-DD"
                keyboardType="default"
              />
              <InputField
                label="Frequency"
                value={cycleFreq}
                onChangeText={setCycleFreq}
                placeholder="e.g. 7"
                unit="days"
              />
              <InputField
                label="Number of Doses"
                value={cycleDoses}
                onChangeText={setCycleDoses}
                placeholder="e.g. 12"
              />
            </View>

            {cycleResults && (
              <ResultCard title="Cycle Summary" results={cycleResults} />
            )}
          </View></FadeIn>
        )}

        {/* Half-Life Reference */}
        {activeSection === 'halflife' && (
          <FadeIn><View style={styles.section}>
            <Text style={styles.sectionTitle}>Half-Life Reference</Text>
            <Text style={styles.sectionDesc}>
              Lookup half-lives and typical dosing for common peptides.
            </Text>

            <View style={styles.searchRow}>
              <Feather
                name="search"
                size={18}
                color={Colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search peptides..."
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {filteredPeptides.map((p) => (
              <Card key={p.name} style={styles.peptideCard}>
                <View style={styles.peptideHeader}>
                  <Text style={styles.peptideName}>{p.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{p.category}</Text>
                  </View>
                </View>
                <View style={styles.peptideDetails}>
                  <Text style={styles.peptideDetail}>
                    Half-life: {formatHalfLife(p.half_life_hours)}
                  </Text>
                  <Text style={styles.peptideDetail}>
                    Typical dose: {p.typical_dose_mcg >= 1000
                      ? `${p.typical_dose_mcg / 1000}mg`
                      : `${p.typical_dose_mcg}mcg`}
                  </Text>
                  <Text style={styles.peptideDetail}>
                    Frequency: {p.frequency_options.join(', ')}
                  </Text>
                </View>
              </Card>
            ))}

            {filteredPeptides.length === 0 && (
              <Text style={styles.emptyText}>No peptides match your search.</Text>
            )}
          </View></FadeIn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
  } as ViewStyle,
  title: {
    ...Typography.h1,
    marginBottom: Spacing.lg,
  } as TextStyle,
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  } as ViewStyle,
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  } as ViewStyle,
  tabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  } as ViewStyle,
  tabText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  } as TextStyle,
  tabTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.bodySemiBold,
  } as TextStyle,
  section: {
    gap: Spacing.lg,
  } as ViewStyle,
  sectionTitle: {
    ...Typography.h2,
  } as TextStyle,
  sectionDesc: {
    ...Typography.bodySmall,
  } as TextStyle,
  inputGroup: {
    gap: Spacing.md,
  } as ViewStyle,
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  searchIcon: {
    marginRight: Spacing.sm,
  } as TextStyle,
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  peptideCard: {
    gap: Spacing.sm,
  } as ViewStyle,
  peptideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  peptideName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  } as TextStyle,
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  } as ViewStyle,
  categoryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.primary,
  } as TextStyle,
  peptideDetails: {
    gap: Spacing.xs,
  } as ViewStyle,
  peptideDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  } as TextStyle,
});
