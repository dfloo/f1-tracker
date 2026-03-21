import Link from 'next/link';

import { UserRound } from 'lucide-react';

import type { DriverSeasonCard as DriverSeasonCardType } from '@/types/championship';

interface DriverCardProps {
  driver: DriverSeasonCardType;
}

export default function DriverCard({ driver }: DriverCardProps) {
  return (
    <Link
      href={`/drivers/${driver.id}`}
      className="group border-border bg-surface hover:bg-surface-hover flex h-full flex-col gap-4 rounded-xl border p-5 transition-colors hover:border-[var(--f1-red)]"
    >
      <div className="border-border bg-background flex aspect-square items-center justify-center rounded-lg border">
        <UserRound
          aria-hidden="true"
          className="text-muted h-16 w-16 transition-colors group-hover:text-[var(--f1-red)]"
        />
      </div>
      <h2 className="text-foreground text-base leading-snug font-semibold transition-colors group-hover:text-[var(--f1-red)]">
        {driver.name}
      </h2>
    </Link>
  );
}
