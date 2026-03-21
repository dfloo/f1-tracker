'use client';

import { useEffect, useState } from 'react';

import YearSelect from '@/components/championships/YearSelect';
import type { DriversSeasonResponse } from '@/types/championship';

import DriverCard from './DriverCard';

const defaultYears = [2024];

function buildEndpoint(year: number) {
  const query = new URLSearchParams({
    year: String(year),
  });

  return `/api/drivers?${query.toString()}`;
}

export default function DriversExplorer() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);
  const [payload, setPayload] = useState<DriversSeasonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDrivers() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(buildEndpoint(selectedYear), {
          method: 'GET',
          signal: abortController.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? 'Failed to load drivers.');
        }

        const nextPayload = (await response.json()) as DriversSeasonResponse;

        setPayload(nextPayload);
        setAvailableYears(nextPayload.availableYears);
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

  return (
    <div className="w-full min-w-0 pb-6">
      <div className="bg-background sticky top-0 z-10 flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <YearSelect
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
          disabled={isLoading}
        />
        {payload ? (
          <p className="text-muted text-sm">
            {payload.data.drivers.length} drivers in {payload.data.year}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {isLoading ? (
          <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-24 text-sm">
            Loading drivers...
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div
            role="alert"
            className="border-border bg-surface rounded-xl border px-4 py-5"
          >
            <p className="text-foreground text-sm font-semibold">
              Unable to load drivers
            </p>
            <p className="text-muted mt-1 text-sm">{errorMessage}</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && payload ? (
          <div
            role="list"
            aria-label={`Drivers for ${payload.data.year}`}
            className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {payload.data.drivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
