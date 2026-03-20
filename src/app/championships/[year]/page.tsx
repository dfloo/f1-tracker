interface ChampionshipYearPageProps {
  params: Promise<{ year: string }>;
}

export default async function ChampionshipYearPage({
  params,
}: ChampionshipYearPageProps) {
  const { year } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="border-border mb-8 border-b pb-6">
        <p className="text-muted mb-1 text-sm">Season</p>
        <h1 className="text-foreground text-3xl font-bold">
          {year} Championship
        </h1>
      </div>
      <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-32">
        Season detail coming soon
      </div>
    </div>
  );
}
