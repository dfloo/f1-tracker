import DriverDetailExplorer from '@/components/drivers/DriverDetailExplorer';
import { resolveYearQuery } from '@/lib/year';

interface DriverDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    year?: string | string[];
    raceId?: string | string[];
  }>;
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: DriverDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolveYearQuery(resolvedSearchParams.year);
  const initialRaceId = Array.isArray(resolvedSearchParams.raceId)
    ? (resolvedSearchParams.raceId[0] ?? undefined)
    : resolvedSearchParams.raceId;

  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
        <DriverDetailExplorer
          driverId={id}
          year={selectedYear}
          initialRaceId={initialRaceId}
        />
      </div>
    </div>
  );
}
