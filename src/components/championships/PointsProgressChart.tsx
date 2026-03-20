import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChampionshipProgress } from '@/types/championship';

interface PointsProgressChartProps {
  progress: ChampionshipProgress;
}

type ChartRow = {
  round: string;
} & Record<string, number | string>;

function toChartData(progress: ChampionshipProgress): ChartRow[] {
  return progress.races.map((race, index) => {
    const row: ChartRow = {
      round: `R${race.round}`,
    };

    for (const competitor of progress.series) {
      row[competitor.id] = competitor.points[index] ?? 0;
    }

    return row;
  });
}

export default function PointsProgressChart({
  progress,
}: PointsProgressChartProps) {
  const chartData = toChartData(progress);

  return (
    <section
      id={`panel-${progress.category}`}
      role="tabpanel"
      aria-labelledby={`tab-${progress.category}`}
      className="border-border bg-surface rounded-xl border p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-foreground text-lg font-semibold">
          Points Progression
        </h2>
        <p className="text-muted text-sm">Cumulative points by race weekend</p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ left: 8, right: 16, top: 12, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="round"
              stroke="var(--muted)"
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              stroke="var(--muted)"
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              width={42}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderRadius: 8,
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            {progress.series.map((competitor) => (
              <Line
                key={competitor.id}
                type="monotone"
                dataKey={competitor.id}
                name={competitor.name}
                stroke={competitor.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
