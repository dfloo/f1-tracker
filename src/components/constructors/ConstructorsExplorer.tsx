'use client';

import YearSelect from '@/components/championships/YearSelect';
import { useConstructorsSeason } from '@/hooks/useConstructorsSeason';

import ConstructorCard from './ConstructorCard';

export default function ConstructorsExplorer() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    payload,
    isLoading,
    errorMessage,
  } = useConstructorsSeason();

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
            {payload.data.constructors.length} constructors in{' '}
            {payload.data.year}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {isLoading ? (
          <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-24 text-sm">
            Loading constructors...
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div
            role="alert"
            className="border-border bg-surface rounded-xl border px-4 py-5"
          >
            <p className="text-foreground text-sm font-semibold">
              Unable to load constructors
            </p>
            <p className="text-muted mt-1 text-sm">{errorMessage}</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && payload ? (
          <div
            role="list"
            aria-label={`Constructors for ${payload.data.year}`}
            className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {payload.data.constructors.map((constructor) => (
              <ConstructorCard key={constructor.id} constructor={constructor} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
