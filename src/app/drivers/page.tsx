import DriversExplorer from '@/components/drivers/DriversExplorer';
import { resolveYearQuery } from '@/lib/year';

interface DriversPageProps {
  searchParams: Promise<{
    year?: string | string[];
  }>;
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolveYearQuery(resolvedSearchParams.year);

  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6">
        <DriversExplorer selectedYear={selectedYear} />
      </div>
    </div>
  );
}
