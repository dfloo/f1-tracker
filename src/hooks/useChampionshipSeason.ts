'use client';

import { useEffect, useState } from 'react';

import { fetchChampionshipByYear } from '@/lib/services/f1DataClient';
import type { ChampionshipYearResponse } from '@/types/championship';

const defaultYears = [2024];

export function useChampionshipSeason(defaultYear = 2024) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);
  const [payload, setPayload] = useState<ChampionshipYearResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadChampionshipProgress() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPayload = await fetchChampionshipByYear({
          year: selectedYear,
          signal: abortController.signal,
        });

        setPayload(nextPayload);
        setAvailableYears(nextPayload.availableYears);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const fallbackMessage = 'Failed to load championship progress.';
        setErrorMessage(
          error instanceof Error ? error.message : fallbackMessage,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadChampionshipProgress();

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