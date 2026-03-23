'use client';

import { useEffect, useState } from 'react';

import { fetchDriversByYear } from '@/lib/services/f1DataClient';
import type { DriversSeasonResponse } from '@/types/championship';

export function useDriversSeason(selectedYear: number) {
  const [payload, setPayload] = useState<DriversSeasonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDrivers() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPayload = await fetchDriversByYear({
          year: selectedYear,
          signal: abortController.signal,
        });

        setPayload(nextPayload);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const fallbackMessage = 'Failed to load drivers.';
        setErrorMessage(
          error instanceof Error ? error.message : fallbackMessage,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDrivers();

    return () => {
      abortController.abort();
    };
  }, [selectedYear]);

  return {
    payload,
    isLoading,
    errorMessage,
  };
}