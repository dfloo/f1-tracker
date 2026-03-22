'use client';

import { useMemo, useState } from 'react';

import CategoryTabs from '@/components/championships/CategoryTabs';
import PointsProgressChart from '@/components/championships/PointsProgressChart';
import YearSelect from '@/components/championships/YearSelect';
import {
  toConstructorsProgress,
  toDriversProgress,
} from '@/components/championships/championshipTransforms';
import { useChampionshipSeason } from '@/hooks/useChampionshipSeason';
import type { ChampionshipCategory } from '@/types/championship';

export default function ChampionshipsExplorer() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    payload,
    isLoading,
    errorMessage,
  } = useChampionshipSeason();
  const [selectedCategory, setSelectedCategory] =
    useState<ChampionshipCategory>('drivers');

  const progress = useMemo(() => {
    if (!payload) {
      return null;
    }

    return selectedCategory === 'drivers'
      ? toDriversProgress(payload.data)
      : toConstructorsProgress(payload.data);
  }, [payload, selectedCategory]);

  return (
    <div className="flex h-full flex-col gap-6">
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
        <div className="border-border bg-surface text-muted flex flex-1 items-center justify-center rounded-xl border py-24 text-sm">
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
