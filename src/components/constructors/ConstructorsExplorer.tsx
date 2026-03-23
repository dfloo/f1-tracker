'use client';

import { useConstructorsSeason } from '@/hooks/useConstructorsSeason';

import ConstructorCard from './ConstructorCard';

interface ConstructorsExplorerProps {
  selectedYear: number;
}

export default function ConstructorsExplorer({
  selectedYear,
}: ConstructorsExplorerProps) {
  const { payload, isLoading, errorMessage } =
    useConstructorsSeason(selectedYear);

  return (
    <div className="w-full min-w-0 pb-6">
      {payload ? (
        <div className="bg-background sticky top-0 z-10 py-6">
          <p className="text-muted text-sm">
            {payload.data.constructors.length} constructors in{' '}
            {payload.data.year}
          </p>
        </div>
      ) : null}

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
              <ConstructorCard
                key={constructor.id}
                constructor={constructor}
                selectedYear={selectedYear}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
