import { useState, useEffect, useCallback } from 'react';
import { getCompounds, addCompound, updateCompound, deleteCompound } from '@/db/queries';
import type { Compound } from '@/types';

export function useProtocol() {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompounds(true);
      setCompounds(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (compound: Omit<Compound, 'id' | 'created_at'>) => {
      await addCompound(compound);
      await refresh();
    },
    [refresh]
  );

  const update = useCallback(
    async (id: number, updates: Partial<Compound>) => {
      await updateCompound(id, updates);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteCompound(id);
      await refresh();
    },
    [refresh]
  );

  return { compounds, loading, refresh, add, addNewCompound: add, update, remove };
}
