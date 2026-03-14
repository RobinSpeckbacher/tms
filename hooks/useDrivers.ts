'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Driver } from '@/types';
import { mockDrivers } from '@/data/mockData';

interface UseDriversReturn {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDrivers(): UseDriversReturn {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with real service call:
      // const data = await getDrivers();
      await new Promise((resolve) => setTimeout(resolve, 400));
      setDrivers(mockDrivers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, isLoading, error, refetch: fetchDrivers };
}
