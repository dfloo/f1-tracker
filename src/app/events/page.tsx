import EventsExplorer from '@/components/events/EventsExplorer';
import { resolveYearQuery } from '@/lib/year';

interface EventsPageProps {
  searchParams: Promise<{
    year?: string | string[];
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolveYearQuery(resolvedSearchParams.year);

  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6">
        <EventsExplorer selectedYear={selectedYear} />
      </div>
    </div>
  );
}
