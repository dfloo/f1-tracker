'use client';

import { useEffect, useState } from 'react';

import { fetchConstructorsByYear } from '@/lib/services/f1DataClient';
import type { ConstructorsSeasonResponse } from '@/types/championship';

export function useConstructorsSeason(selectedYear: number) {
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
    payload,
    isLoading,
    errorMessage,
  };
}