interface RaceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RaceDetailsPage({
  params,
}: RaceDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="border-border mb-8 border-b pb-6">
        <h1 className="text-foreground text-3xl font-bold">Race Details</h1>
        <p className="text-muted mt-2">
          Details for race {id} are coming soon.
        </p>
      </div>
      <div className="border-border bg-surface text-muted rounded-xl border px-4 py-5 text-sm">
        Sprint race and qualifying details will be included here in a future
        update.
      </div>
    </div>
  );
}
