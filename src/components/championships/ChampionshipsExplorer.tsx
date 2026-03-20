'use client';

import { useEffect, useMemo, useState } from 'react';

import CategoryTabs from '@/components/championships/CategoryTabs';
import PointsProgressChart from '@/components/championships/PointsProgressChart';
import YearSelect from '@/components/championships/YearSelect';
import {
  toConstructorsProgress,
  toDriversProgress,
} from '@/components/championships/championshipTransforms';
import type {
  ChampionshipCategory,
  ChampionshipYearResponse,
} from '@/types/championship';

const defaultYears = [2024];

function buildEndpoint(year: number) {
  const query = new URLSearchParams({
    year: String(year),
  });

  return `/api/championships?${query.toString()}`;
}

export default function ChampionshipsExplorer() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedCategory, setSelectedCategory] =
    useState<ChampionshipCategory>('drivers');
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);
  const [payload, setPayload] = useState<ChampionshipYearResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (!payload) {
      return null;
    }

    return selectedCategory === 'drivers'
      ? toDriversProgress(payload.data)
      : toConstructorsProgress(payload.data);
  }, [payload, selectedCategory]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadChampionshipProgress() {
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
          throw new Error(
            payload.message ?? 'Failed to load championship progress.',
          );
        }

        const nextPayload = (await response.json()) as ChampionshipYearResponse;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <YearSelect
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
          disabled={isLoading}
        />
        <CategoryTabs
          selectedCategory={selectedCategory}
          onChange={setSelectedCategory}
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-24 text-sm">
          Loading championship chart...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div
          role="alert"
          className="border-border bg-surface rounded-xl border px-4 py-5"
        >
          <p className="text-foreground text-sm font-semibold">
            Unable to load data
          </p>
          <p className="text-muted mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && progress ? (
        <PointsProgressChart progress={progress} />
      ) : null}
    </div>
  );
}
