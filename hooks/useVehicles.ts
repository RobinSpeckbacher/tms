'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '@/types';
import { mockVehicles } from '@/data/mockData';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVehicles(): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with real service call:
      // const data = await getVehicles();
      await new Promise((resolve) => setTimeout(resolve, 400));
      setVehicles(mockVehicles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, isLoading, error, refetch: fetchVehicles };
}
