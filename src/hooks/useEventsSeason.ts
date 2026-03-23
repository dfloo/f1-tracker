'use client';

import { useEffect, useState } from 'react';

import { fetchEventsByYear } from '@/lib/services/f1DataClient';
import type { EventsSeasonResponse } from '@/types/championship';

export function useEventsSeason(selectedYear: number) {
  const [payload, setPayload] = useState<EventsSeasonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPayload = await fetchEventsByYear({
          year: selectedYear,
          signal: abortController.signal,
        });

        setPayload(nextPayload);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const fallbackMessage = 'Failed to load events.';
        setErrorMessage(
          error instanceof Error ? error.message : fallbackMessage,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

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