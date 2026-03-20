import type { ChangeEvent } from 'react';

interface YearSelectProps {
  years: number[];
  selectedYear: number;
  onChange: (nextYear: number) => void;
  disabled?: boolean;
}

export default function YearSelect({
  years,
  selectedYear,
  onChange,
  disabled = false,
}: YearSelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="championship-year"
        className="text-muted text-sm font-medium"
      >
        Season
      </label>
      <select
        id="championship-year"
        name="championship-year"
        value={selectedYear}
        onChange={handleChange}
        disabled={disabled}
        className="border-border bg-surface text-foreground focus:ring-f1-red rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-60"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
