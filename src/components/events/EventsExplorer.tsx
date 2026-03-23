'use client';

import { useEventsSeason } from '@/hooks/useEventsSeason';

import EventCard from './EventCard';

interface EventsExplorerProps {
  selectedYear: number;
}

export default function EventsExplorer({ selectedYear }: EventsExplorerProps) {
  const { payload, isLoading, errorMessage } = useEventsSeason(selectedYear);

  const events = payload
    ? [...payload.data.events].sort((a, b) => a.round - b.round)
    : [];

  return (
    <div className="w-full min-w-0 pb-6">
      {payload ? (
        <div className="bg-background sticky top-0 z-10 py-6">
          <p className="text-muted text-sm">
            {payload.data.events.length} events in {payload.data.year}
          </p>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-6">
        {isLoading ? (
          <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-24 text-sm">
            Loading events...
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div
            role="alert"
            className="border-border bg-surface rounded-xl border px-4 py-5"
          >
            <p className="text-foreground text-sm font-semibold">
              Unable to load events
            </p>
            <p className="text-muted mt-1 text-sm">{errorMessage}</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && payload && events.length > 0 ? (
          <div
            role="list"
            aria-label={`Grand Prix events for ${payload.data.year}`}
            className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {events.map((event) => (
              <EventCard
                key={`${event.round}-${event.name}`}
                event={event}
                selectedYear={selectedYear}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && payload && events.length === 0 ? (
          <div className="border-border bg-surface text-muted rounded-xl border px-4 py-5 text-sm">
            No events available for {payload.data.year}.
          </div>
        ) : null}
      </div>
    </div>
  );
}
