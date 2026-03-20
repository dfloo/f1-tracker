import ChampionshipsExplorer from '@/components/championships/ChampionshipsExplorer';

export default function ChampionshipsPage() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="mx-auto h-full w-full max-w-7xl overflow-hidden px-6 py-6">
        <ChampionshipsExplorer />
      </div>
    </div>
  );
}
