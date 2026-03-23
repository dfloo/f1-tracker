import EventsExplorer from '@/components/events/EventsExplorer';

export default function EventsPage() {
  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6">
        <EventsExplorer />
      </div>
    </div>
  );
}
