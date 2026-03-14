'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transport } from '@/types';
import { mockTransports } from '@/data/mockData';

interface UseTransportsReturn {
  transports: Transport[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransports(): UseTransportsReturn {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with real service call:
      // const data = await getTransports();
      await new Promise((resolve) => setTimeout(resolve, 400));
      setTransports(mockTransports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  return { transports, isLoading, error, refetch: fetchTransports };
}
