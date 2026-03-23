import Link from 'next/link';

import { Flag } from 'lucide-react';

import type { EventSeasonCard } from '@/types/championship';

interface EventCardProps {
  event: EventSeasonCard;
}

export default function EventCard({ event }: EventCardProps) {
  const className =
    'group border-border bg-surface flex h-full flex-col gap-4 rounded-xl border p-5 transition-colors';

  const body = (
    <>
      <div className="border-border bg-background flex aspect-square items-center justify-center rounded-lg border">
        <Flag
          aria-hidden="true"
          className="text-muted h-16 w-16 transition-colors group-hover:text-[var(--f1-red)]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted text-sm">Round {event.round}</p>
        <h2 className="text-foreground text-base leading-snug font-semibold transition-colors group-hover:text-[var(--f1-red)]">
          {event.name}
        </h2>
      </div>
    </>
  );

  if (event.id !== null) {
    return (
      <Link
        href={`/events/${event.id}`}
        className={`${className} hover:bg-surface-hover hover:border-[var(--f1-red)]`}
      >
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
