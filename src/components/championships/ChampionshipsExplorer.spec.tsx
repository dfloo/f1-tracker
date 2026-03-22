import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearF1DataClientCache } from '@/lib/services/f1DataClient';

import ChampionshipsExplorer from './ChampionshipsExplorer';

vi.mock('./PointsProgressChart', () => ({
  default: ({
    progress,
  }: {
    progress: {
      year: number;
      category: string;
      series: Array<{ name: string }>;
    };
  }) => (
    <div>
      Chart for {progress.year} {progress.category}: {progress.series[0]?.name}
    </div>
  ),
}));

const yearPayload = {
  availableYears: [2024, 2023, 2022],
  data: {
    year: 2024,
    races: [
      { round: 1, name: 'Bahrain GP' },
      { round: 2, name: 'Saudi Arabian GP' },
    ],
    drivers: [
      {
        id: '1',
        name: 'Max Verstappen',
        color: '#3671C6',
        cumulativePoints: [25, 43],
        raceResults: [
          {
            constructorId: '9',
            constructorName: 'Red Bull',
            constructorColor: '#3671C6',
            racePoints: 25,
          },
          {
            constructorId: '9',
            constructorName: 'Red Bull',
            constructorColor: '#3671C6',
            racePoints: 18,
          },
        ],
      },
      {
        id: '2',
        name: 'Sergio Perez',
        color: '#3671C6',
        cumulativePoints: [18, 33],
        raceResults: [
          {
            constructorId: '9',
            constructorName: 'Red Bull',
            constructorColor: '#3671C6',
            racePoints: 18,
          },
          {
            constructorId: '9',
            constructorName: 'Red Bull',
            constructorColor: '#3671C6',
            racePoints: 15,
          },
        ],
      },
      {
        id: '3',
        name: 'Charles Leclerc',
        color: '#DC0000',
        cumulativePoints: [15, 30],
        raceResults: [
          {
            constructorId: '6',
            constructorName: 'Ferrari',
            constructorColor: '#DC0000',
            racePoints: 15,
          },
          {
            constructorId: '6',
            constructorName: 'Ferrari',
            constructorColor: '#DC0000',
            racePoints: 15,
          },
        ],
      },
    ],
  },
};

describe('ChampionshipsExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearF1DataClientCache();
  });

  it('loads 2024 drivers data by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => yearPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ChampionshipsExplorer />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/f1/championships?year=2024',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    expect(
      await screen.findByText(/chart for 2024 drivers: max verstappen/i),
    ).toBeInTheDocument();
  });

  it('does not refetch when switching to constructors tab', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => yearPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ChampionshipsExplorer />);

    expect(
      await screen.findByText(/chart for 2024 drivers: max verstappen/i),
    ).toBeInTheDocument();

    const constructorsToggle = screen.getByRole('button', {
      name: /constructors/i,
    });

    expect(constructorsToggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(constructorsToggle);

    expect(constructorsToggle).toHaveAttribute('aria-pressed', 'true');

    expect(
      await screen.findByText(/chart for 2024 constructors: red bull/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refetches when year changes', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => yearPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...yearPayload,
          data: {
            ...yearPayload.data,
            year: 2023,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<ChampionshipsExplorer />);

    expect(
      await screen.findByText(/chart for 2024 drivers: max verstappen/i),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/season/i), '2023');

    expect(
      await screen.findByText(/chart for 2023 drivers/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/f1/championships?year=2023',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('shows an error state when request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unsupported championship year.' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ChampionshipsExplorer />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unsupported championship year/i,
    );
  });
});
