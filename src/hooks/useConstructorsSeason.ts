'use client';

import { useEffect, useState } from 'react';

import { fetchConstructorsByYear } from '@/lib/services/f1DataClient';
import type { ConstructorsSeasonResponse } from '@/types/championship';

const defaultYears = [2024];

export function useConstructorsSeason(defaultYear = 2024) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);
  const [payload, setPayload] = useState<ConstructorsSeasonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadConstructors() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPayload = await fetchConstructorsByYear({
          year: selectedYear,
          signal: abortController.signal,
        });

        setPayload(nextPayload);
        setAvailableYears(nextPayload.availableYears);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const fallbackMessage = 'Failed to load constructors.';
        setErrorMessage(
          error instanceof Error ? error.message : fallbackMessage,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadConstructors();

    return () => {
      abortController.abort();
    };
  }, [selectedYear]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    payload,
    isLoading,
    errorMessage,
  };
}