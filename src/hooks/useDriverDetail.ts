'use client';

import { useEffect, useState } from 'react';

import { fetchDriverDetail } from '@/lib/services/f1DataClient';
import type { DriverDetailResponse } from '@/types/driverDetail';

interface UseDriverDetailParams {
  driverId: string;
  year: number;
  raceId?: string;
}

export function useDriverDetail({
  driverId,
  year,
  raceId,
}: UseDriverDetailParams) {
  const [payload, setPayload] = useState<DriverDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDriverDetail() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await fetchDriverDetail({
          driverId,
          year,
          raceId,
          signal: abortController.signal,
        });

        setPayload(result);
      } catch (error) {
        if (!abortController.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to load driver details.',
          );
          setPayload(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDriverDetail();

    return () => {
      abortController.abort();
    };
  }, [driverId, raceId, year]);

  return {
    payload,
    isLoading,
    errorMessage,
  };
}
