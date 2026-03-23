'use client';

import { useDriversSeason } from '@/hooks/useDriversSeason';

import DriverCard from './DriverCard';

interface DriversExplorerProps {
  selectedYear: number;
}

export default function DriversExplorer({
  selectedYear,
}: DriversExplorerProps) {
  const { payload, isLoading, errorMessage } = useDriversSeason(selectedYear);

  return (
    <div className="w-full min-w-0 pb-6">
      {payload ? (
        <div className="bg-background sticky top-0 z-10 py-6">
          <p className="text-muted text-sm">
            {payload.data.drivers.length} drivers in {payload.data.year}
          </p>
        </div>
      ) : null}

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
              <DriverCard
                key={driver.id}
                driver={driver}
                selectedYear={selectedYear}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
