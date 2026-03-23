'use client';

import { Minus, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  ChampionshipProgress,
  ChampionshipSeries,
} from '@/types/championship';

const TOP_N_COMPETITORS = 5;

interface PointsProgressChartProps {
  progress: ChampionshipProgress;
}

type ChartRow = {
  round: string;
} & Record<string, number | string>;

interface CustomLegendProps {
  series: ChampionshipSeries[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function CustomLegend({
  series,
  isExpanded,
  onToggleExpand,
}: CustomLegendProps) {
  const visibleSeries = isExpanded
    ? series
    : series.slice(0, TOP_N_COMPETITORS);
  const hasMore = series.length > TOP_N_COMPETITORS;
  const controlLabel = isExpanded ? 'Collapse legend' : 'Expand legend';

  return (
    <section
      data-testid="points-legend"
      aria-label="Chart legend"
      className="border-border lg:border-border flex flex-col border-t pt-4 lg:mt-0 lg:h-full lg:min-h-0 lg:border-t-0 lg:border-l lg:pl-4"
    >
      <h3 className="text-foreground mb-3 text-sm font-semibold">Legend</h3>
      {visibleSeries.length > 0 ? (
        <ul
          className="max-h-64 space-y-2 overflow-y-auto pr-2 sm:max-h-80 lg:max-h-[calc(100dvh-18rem)]"
          role="list"
        >
          {visibleSeries.map((competitor) => (
            <li key={competitor.id} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: competitor.color }}
                aria-hidden="true"
              />
              <span className="text-foreground text-sm">{competitor.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">No competitors available.</p>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={controlLabel}
            title={controlLabel}
            aria-expanded={isExpanded}
            className="text-muted hover:text-foreground hover:bg-surface-hover rounded p-2 transition-colors"
          >
            {isExpanded ? (
              <Minus size={18} aria-hidden="true" />
            ) : (
              <MoreVertical size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}

function toChartData(progress: ChampionshipProgress): ChartRow[] {
  return progress.events.map((event, index) => {
    const row: ChartRow = {
      round: `R${event.round}`,
    };

    for (const competitor of progress.series) {
      row[competitor.id] = competitor.points[index] ?? 0;
    }

    return row;
  });
}

function getSortedSeries(series: ChampionshipSeries[]): ChampionshipSeries[] {
  // Sort by final event points (last element) in descending order
  return [...series].sort((a, b) => {
    const aFinalPoints = a.points[a.points.length - 1] ?? 0;
    const bFinalPoints = b.points[b.points.length - 1] ?? 0;
    return bFinalPoints - aFinalPoints;
  });
}

export default function PointsProgressChart({
  progress,
}: PointsProgressChartProps) {
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  const sortedSeries = getSortedSeries(progress.series);

  const chartData = toChartData({
    ...progress,
    series: sortedSeries,
  });

  return (
    <section
      id={`panel-${progress.category}`}
      role="tabpanel"
      aria-labelledby={`tab-${progress.category}`}
      className="border-border bg-surface flex min-h-0 flex-1 flex-col rounded-xl border p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-foreground text-lg font-semibold">
          Points Progression
        </h2>
        <p className="text-muted text-sm">Cumulative points by race weekend</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_14.5rem]">
        <div className="min-w-0">
          <div className="h-full min-h-80 w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ left: 8, right: 16, top: 12, bottom: 16 }}
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
                {sortedSeries.map((competitor) => (
                  <Line
                    key={competitor.id}
                    type="monotone"
                    dataKey={competitor.id}
                    name={competitor.name}
                    stroke={competitor.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <CustomLegend
          series={sortedSeries}
          isExpanded={isLegendExpanded}
          onToggleExpand={() => setIsLegendExpanded(!isLegendExpanded)}
        />
      </div>
    </section>
  );
}
