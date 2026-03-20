import ChampionshipsExplorer from '@/components/championships/ChampionshipsExplorer';

export default function ChampionshipsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="border-border mb-8 border-b pb-6">
        <h1 className="text-foreground text-3xl font-bold">Championships</h1>
        <p className="text-muted mt-2">
          Drivers&apos; and Constructors&apos; standings, race calendar, and
          historical season results.
        </p>
      </div>
      <ChampionshipsExplorer />
    </div>
  );
}
