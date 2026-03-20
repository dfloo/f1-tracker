import type { ChampionshipCategory } from '@/types/championship';

interface CategoryTabsProps {
  selectedCategory: ChampionshipCategory;
  onChange: (nextCategory: ChampionshipCategory) => void;
  disabled?: boolean;
}

const tabItems: Array<{ id: ChampionshipCategory; label: string }> = [
  { id: 'drivers', label: 'Drivers' },
  { id: 'constructors', label: 'Constructors' },
];

export default function CategoryTabs({
  selectedCategory,
  onChange,
  disabled = false,
}: CategoryTabsProps) {
  return (
    <div className="bg-surface-hover inline-flex rounded-lg p-1">
      {tabItems.map((item) => {
        const isActive = selectedCategory === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onChange(item.id)}
            className={[
              'rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
              isActive
                ? 'bg-surface text-foreground'
                : 'text-muted hover:text-foreground',
            ].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
