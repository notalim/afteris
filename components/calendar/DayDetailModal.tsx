import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { InjectionLog } from '@/types';

interface DayDetailModalProps {
  visible: boolean;
  date: string;
  logs: InjectionLog[];
  compoundNames: Record<number, string>;
  isPast: boolean;
  onClose: () => void;
  onLogLate: () => void;
}

export function DayDetailModal({
  visible,
  date,
  logs,
  compoundNames,
  isPast,
  onClose,
  onLogLate,
}: DayDetailModalProps) {
  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{formattedDate}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {isPast ? 'No injections logged for this day.' : 'No scheduled injections.'}
                </Text>
              </View>
            ) : (
              logs.map((log) => (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logCompound}>
                      {compoundNames[log.compound_id] ?? `Compound #${log.compound_id}`}
                    </Text>
                    <Badge label="Logged" color="success" />
                  </View>
                  <Text style={styles.logDetail}>{log.dose_mcg} mcg</Text>
                  {log.site ? (
                    <Text style={styles.logDetail}>Site: {log.site}</Text>
                  ) : null}
                  {log.notes ? (
                    <Text style={styles.logDetail}>{log.notes}</Text>
                  ) : null}
                </Card>
              ))
            )}
          </ScrollView>

          {isPast && (
            <Button
              title="Log Late?"
              onPress={onLogLate}
              variant="secondary"
              style={styles.lateButton}
            />
          )}
        </View>
      </View>
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
    maxHeight: '70%',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  title: {
    ...Typography.h2,
  } as TextStyle,
  scrollContent: {
    flexGrow: 0,
  } as ViewStyle,
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  } as ViewStyle,
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  } as TextStyle,
  logCard: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  } as ViewStyle,
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  logCompound: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  } as TextStyle,
  logDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  lateButton: {
    marginTop: Spacing.lg,
  } as ViewStyle,
});
