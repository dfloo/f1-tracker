interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({
  params,
}: TeamDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="mb-8 border-b border-border pb-6">
        <p className="mb-1 text-sm text-muted">Team</p>
        <h1 className="text-3xl font-bold capitalize text-foreground">{id}</h1>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-border bg-surface py-32 text-muted">
        Team detail coming soon
      </div>
    </div>
  );
}
