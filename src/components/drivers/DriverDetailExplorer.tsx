'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDriverDetail } from '@/hooks/useDriverDetail';
import type {
  DriverLapTimePoint,
  DriverSelectedRaceContext,
} from '@/types/driverDetail';

interface DriverDetailExplorerProps {
  driverId: string;
  year: number;
  initialRaceId?: string;
}

type LapChartRow = {
  lap: string;
  driverLapTimeSeconds: number;
  minAllDriversSeconds: number | null;
  maxAllDriversSeconds: number | null;
  avgAllDriversSeconds: number | null;
};

interface PerformanceGaugeProps {
  label: string;
  score: number | null;
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value);
}

function parseLapTimeToSeconds(point: DriverLapTimePoint) {
  if (!Number.isFinite(point.time)) {
    return null;
  }

  return point.time / 1000;
}

function parseMetricToSeconds(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  // Allow backend metrics in either milliseconds or seconds.
  if (value > 1000) {
    return value / 1000;
  }

  return value;
}

function toLapChartData(lapTimes: DriverLapTimePoint[]): LapChartRow[] {
  return lapTimes
    .map((point) => {
      const driverLapTimeSeconds = parseLapTimeToSeconds(point);

      if (driverLapTimeSeconds === null) {
        return null;
      }

      return {
        lap: `L${point.lap}`,
        driverLapTimeSeconds,
        minAllDriversSeconds: parseMetricToSeconds(point.minTime),
        maxAllDriversSeconds: parseMetricToSeconds(point.maxTime),
        avgAllDriversSeconds: parseMetricToSeconds(point.avgTime),
      };
    })
    .filter((entry): entry is LapChartRow => entry !== null);
}

function formatLapTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  const paddedSeconds = seconds.toFixed(3).padStart(6, '0');
  return `${minutes}:${paddedSeconds}`;
}

function formatLapTimeAxis(value: number) {
  const totalSeconds = Math.max(0, Math.round(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function parseScore(value: unknown) {
  const numericValue = asNumber(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (numericValue < 0) {
    return 0;
  }

  if (numericValue > 100) {
    return 100;
  }

  return numericValue;
}

function hasComparisonSeries(
  chartData: LapChartRow[],
  dataKey:
    | 'minAllDriversSeconds'
    | 'maxAllDriversSeconds'
    | 'avgAllDriversSeconds',
) {
  return chartData.some((point) => point[dataKey] !== null);
}

function getRaceScore(selectedRace: DriverSelectedRaceContext | null) {
  return parseScore(selectedRace?.raceScore);
}

function getSeasonScore(selectedRace: DriverSelectedRaceContext | null) {
  return parseScore(selectedRace?.seasonScore);
}

function getEndingPosition(selectedRace: DriverSelectedRaceContext | null) {
  const value = selectedRace?.endingPosition ?? null;

  if (value === null || value === undefined || value === '') {
    return 'DNF';
  }

  return String(value);
}

function PerformanceGauge({ label, score }: PerformanceGaugeProps) {
  const resolvedScore = score ?? 0;
  const valueLabel = score === null ? 'N/A' : `${Math.round(score)}`;

  return (
    <div className="border-border bg-background rounded-xl border p-4">
      <p className="text-muted text-xs tracking-wide uppercase">{label}</p>
      <div className="mt-3 flex items-center justify-center">
        <svg viewBox="0 0 120 70" className="h-32 w-full max-w-56">
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke="var(--border)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke="var(--f1-red)"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${resolvedScore} 100`}
          />
          <text
            x="60"
            y="56"
            textAnchor="middle"
            fill="var(--foreground)"
            className="text-xl font-semibold"
          >
            {valueLabel}
          </text>
        </svg>
      </div>
      <p className="text-muted mt-1 text-center text-xs">Score out of 100</p>
    </div>
  );
}

export default function DriverDetailExplorer({
  driverId,
  year,
  initialRaceId,
}: DriverDetailExplorerProps) {
  const [selectedRaceId, setSelectedRaceId] = useState<string | undefined>(
    initialRaceId,
  );
  const { payload, isLoading, errorMessage } = useDriverDetail({
    driverId,
    year,
    raceId: selectedRaceId,
  });

  useEffect(() => {
    setSelectedRaceId(initialRaceId);
  }, [initialRaceId]);

  const selectedRace = payload?.data.selectedRace ?? null;
  const races = payload?.data.races ?? [];
  const currentPoints =
    selectedRace?.cumulativePoints ?? payload?.data.driver.currentPoints ?? 0;

  const lapChartData = useMemo(
    () => toLapChartData(selectedRace?.lapTimes ?? []),
    [selectedRace?.lapTimes],
  );

  const raceScore = getRaceScore(selectedRace);
  const seasonScore = getSeasonScore(selectedRace);
  const endingPosition = getEndingPosition(selectedRace);

  const hasMinSeries = hasComparisonSeries(
    lapChartData,
    'minAllDriversSeconds',
  );
  const hasMaxSeries = hasComparisonSeries(
    lapChartData,
    'maxAllDriversSeconds',
  );
  const hasAvgSeries = hasComparisonSeries(
    lapChartData,
    'avgAllDriversSeconds',
  );

  function handleRoundChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextRaceId = event.target.value;
    setSelectedRaceId(nextRaceId || undefined);
  }

  return (
    <div className="w-full min-w-0 pb-6">
      {isLoading ? (
        <div className="border-border bg-surface text-muted flex items-center justify-center rounded-xl border py-24 text-sm">
          Loading driver details...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div
          role="alert"
          className="border-border bg-surface rounded-xl border px-4 py-5"
        >
          <p className="text-foreground text-sm font-semibold">
            Unable to load driver details
          </p>
          <p className="text-muted mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && payload ? (
        <div className="flex min-w-0 flex-col gap-6">
          <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
            <div>
              <p className="text-muted text-sm">Driver</p>
              <h1 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
                {payload.data.driver.name}
              </h1>
              <p className="text-muted mt-1 text-sm">
                Season {payload.data.year}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-border bg-background rounded-lg border px-3 py-3">
                <p className="text-muted text-xs tracking-wide uppercase">
                  Number
                </p>
                <p className="text-foreground mt-1 text-base font-semibold">
                  {payload.data.driver.number ?? 'N/A'}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border px-3 py-3">
                <p className="text-muted text-xs tracking-wide uppercase">
                  Constructor
                </p>
                <p className="text-foreground mt-1 text-base font-semibold">
                  {payload.data.driver.constructorName ?? 'Unknown'}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border px-3 py-3">
                <p className="text-muted text-xs tracking-wide uppercase">
                  Current points
                </p>
                <p className="text-foreground mt-1 text-base font-semibold">
                  {currentPoints}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border px-3 py-3">
                <p className="text-muted text-xs tracking-wide uppercase">
                  Selected round
                </p>
                <label htmlFor="driver-round" className="sr-only">
                  Selected round
                </label>
                <select
                  id="driver-round"
                  name="driver-round"
                  value={selectedRace?.id ?? ''}
                  onChange={handleRoundChange}
                  className="text-foreground focus:ring-f1-red mt-1 w-full rounded-md px-0 py-0.5 text-base font-semibold focus:ring-2 focus:outline-none"
                >
                  {races.map((race) => (
                    <option key={race.id} value={race.id}>
                      {race.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="border-border bg-surface rounded-xl border p-5 lg:col-span-1">
              <h2 className="text-foreground text-lg font-semibold">
                Race Performance
              </h2>

              <dl className="mt-4 flex flex-col gap-2">
                <div className="border-border bg-background flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    Race points
                  </dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {selectedRace?.racePoints ?? 0}
                  </dd>
                </div>
                <div className="border-border bg-background flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    Cumulative points
                  </dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {selectedRace?.cumulativePoints ?? currentPoints}
                  </dd>
                </div>
                <div className="border-border bg-background flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    Starting position
                  </dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {selectedRace?.startingPosition ?? 'N/A'}
                  </dd>
                </div>
                <div className="border-border bg-background flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    Ending position
                  </dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {endingPosition}
                  </dd>
                </div>
                <div className="border-border bg-background rounded-lg border px-3 py-2.5">
                  <dd className="flex w-full items-center gap-2">
                    <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                      <span className="text-muted text-xs font-normal tracking-wide uppercase">
                        Q1
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {selectedRace?.qualifying?.q1 ?? 'N/A'}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                      <span className="text-muted text-xs font-normal tracking-wide uppercase">
                        Q2
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {selectedRace?.qualifying?.q2 ?? 'N/A'}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                      <span className="text-muted text-xs font-normal tracking-wide uppercase">
                        Q3
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {selectedRace?.qualifying?.q3 ?? 'N/A'}
                      </span>
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-border bg-surface rounded-xl border p-5 lg:col-span-2">
              <h2 className="text-foreground text-lg font-semibold">
                Performance Gauges
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <PerformanceGauge label="Race Performance" score={raceScore} />
                <PerformanceGauge
                  label="Season Performance"
                  score={seasonScore}
                />
              </div>
            </div>
          </section>

          <section className="border-border bg-surface rounded-xl border p-5">
            <h2 className="text-foreground text-lg font-semibold">
              Lap Times by Lap
            </h2>
            <p className="text-muted mt-1 text-sm">
              Driver lap times with all-driver min/max/avg overlays.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <span className="text-foreground inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--f1-red)]"
                />
                Driver
              </span>
              {hasMinSeries ? (
                <span className="text-foreground inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                  />
                  All drivers min
                </span>
              ) : null}
              {hasMaxSeries ? (
                <span className="text-foreground inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500"
                  />
                  All drivers max
                </span>
              ) : null}
              {hasAvgSeries ? (
                <span className="text-foreground inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500"
                  />
                  All drivers avg
                </span>
              ) : null}
            </div>

            {lapChartData.length > 0 ? (
              <div className="mt-4 h-80 w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={lapChartData}
                    margin={{ left: 8, right: 16, top: 12, bottom: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="lap"
                      stroke="var(--muted)"
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      stroke="var(--muted)"
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      width={52}
                      domain={[
                        (dataMin: number) => dataMin - 10,
                        (dataMax: number) => dataMax + 10,
                      ]}
                      tickFormatter={formatLapTimeAxis}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const numericValue = asNumber(value);

                        if (!Number.isFinite(numericValue)) {
                          return 'N/A';
                        }

                        const labelBySeries = {
                          driverLapTimeSeconds: 'Driver',
                          minAllDriversSeconds: 'All drivers min',
                          maxAllDriversSeconds: 'All drivers max',
                          avgAllDriversSeconds: 'All drivers avg',
                        } as const;

                        return [
                          formatLapTime(numericValue),
                          labelBySeries[name as keyof typeof labelBySeries] ??
                            String(name),
                        ];
                      }}
                      labelFormatter={(label) =>
                        `Lap ${String(label).replace('L', '')}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="driverLapTimeSeconds"
                      stroke="var(--f1-red)"
                      strokeWidth={2.8}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                    {hasMinSeries ? (
                      <Line
                        type="monotone"
                        dataKey="minAllDriversSeconds"
                        stroke="rgb(16 185 129)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    ) : null}
                    {hasMaxSeries ? (
                      <Line
                        type="monotone"
                        dataKey="maxAllDriversSeconds"
                        stroke="rgb(245 158 11)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    ) : null}
                    {hasAvgSeries ? (
                      <Line
                        type="monotone"
                        dataKey="avgAllDriversSeconds"
                        stroke="rgb(14 165 233)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="border-border bg-background text-muted mt-4 rounded-lg border px-4 py-8 text-sm">
                Lap-time data is not available for this race.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
