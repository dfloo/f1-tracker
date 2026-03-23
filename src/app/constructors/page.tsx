import ConstructorsExplorer from '@/components/constructors/ConstructorsExplorer';
import { resolveYearQuery } from '@/lib/year';

interface ConstructorsPageProps {
  searchParams: Promise<{
    year?: string | string[];
  }>;
}

export default async function ConstructorsPage({
  searchParams,
}: ConstructorsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolveYearQuery(resolvedSearchParams.year);

  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6">
        <ConstructorsExplorer selectedYear={selectedYear} />
      </div>
    </div>
  );
}
