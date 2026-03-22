interface ConstructorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConstructorDetailPage({
  params,
}: ConstructorDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="border-border mb-8 border-b pb-6">
        <p className="text-muted mb-1 text-sm">Constructor</p>
        <h1 className="text-foreground text-3xl font-bold capitalize">{id}</h1>
      </div>
      <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-32">
        Constructor detail coming soon
      </div>
    </div>
  );
}
