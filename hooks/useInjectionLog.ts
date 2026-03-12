import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import {
  logInjection,
  getLogsForDate,
  getLogsForCompound,
  getLogsBetweenDates,
  getStreak,
} from '@/db/queries';
import type { InjectionLog } from '@/types';

export function useInjectionLog() {
  const [logs, setLogs] = useState<InjectionLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const log = useCallback(async (entry: Omit<InjectionLog, 'id'>) => {
    await logInjection(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const fetchForDate = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const data = await getLogsForDate(date);
      setLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchForCompound = useCallback(async (compoundId: number) => {
    setLoading(true);
    try {
      const data = await getLogsForCompound(compoundId);
      setLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBetweenDates = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const data = await getLogsBetweenDates(start, end);
      setLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStreak = useCallback(async () => {
    const s = await getStreak();
    setStreak(s);
    return s;
  }, []);

  return {
    logs,
    streak,
    loading,
    log,
    logNewInjection: log,
    fetchForDate,
    getLogsForDay: fetchForDate,
    fetchForCompound,
    fetchBetweenDates,
    refreshStreak,
    getDayStreak: refreshStreak,
  };
}
