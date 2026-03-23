import ChampionshipsExplorer from '@/components/championships/ChampionshipsExplorer';
import { resolveYearQuery } from '@/lib/year';

interface ChampionshipsPageProps {
  searchParams: Promise<{
    year?: string | string[];
  }>;
}

export default async function ChampionshipsPage({
  searchParams,
}: ChampionshipsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolveYearQuery(resolvedSearchParams.year);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="mx-auto h-full w-full max-w-7xl overflow-hidden px-6 py-6">
        <ChampionshipsExplorer selectedYear={selectedYear} />
      </div>
    </div>
  );
}
