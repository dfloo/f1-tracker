import Link from 'next/link';

import { Shield } from 'lucide-react';

import type { ConstructorSeasonCard as ConstructorSeasonCardType } from '@/types/championship';

interface ConstructorCardProps {
  constructor: ConstructorSeasonCardType;
  selectedYear: number;
}

export default function ConstructorCard({
  constructor,
  selectedYear,
}: ConstructorCardProps) {
  return (
    <Link
      href={`/constructors/${constructor.id}?year=${selectedYear}`}
      className="group border-border bg-surface hover:bg-surface-hover flex h-full flex-col gap-4 rounded-xl border p-5 transition-colors hover:border-[var(--f1-red)]"
    >
      <div className="border-border bg-background flex aspect-square items-center justify-center rounded-lg border">
        <Shield
          aria-hidden="true"
          className="text-muted h-16 w-16 transition-colors"
          style={{ color: constructor.color }}
        />
      </div>
      <h2 className="text-foreground text-base leading-snug font-semibold transition-colors group-hover:text-[var(--f1-red)]">
        {constructor.name}
      </h2>
    </Link>
  );
}
