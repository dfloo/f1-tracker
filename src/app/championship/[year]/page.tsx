interface ChampionshipYearPageProps {
  params: Promise<{ year: string }>;
}

export default async function ChampionshipYearPage({
  params,
}: ChampionshipYearPageProps) {
  const { year } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="mb-8 border-b border-border pb-6">
        <p className="mb-1 text-sm text-muted">Season</p>
        <h1 className="text-3xl font-bold text-foreground">{year} Championship</h1>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-border bg-surface py-32 text-muted">
        Season detail coming soon
      </div>
    </div>
  );
}
