import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearF1DataClientCache } from '@/lib/services/f1DataClient';

import DriverDetailExplorer from './DriverDetailExplorer';

const latestRacePayload = {
  availableYears: [2024, 2023],
  data: {
    year: 2024,
    driver: {
      id: '1',
      name: 'Max Verstappen',
      number: '1',
      constructorName: 'Red Bull Racing',
      currentPoints: 43,
    },
    races: [
      {
        id: 'bahrain',
        round: 1,
        name: 'Bahrain Grand Prix',
      },
      {
        id: 'jeddah',
        round: 2,
        name: 'Saudi Arabian Grand Prix',
      },
    ],
    selectedRace: {
      id: 'jeddah',
      round: 2,
      name: 'Saudi Arabian Grand Prix',
      startingPosition: 1,
      racePoints: 25,
      cumulativePoints: 43,
      qualifying: {
        q1: '1:28.171',
        q2: '1:27.472',
        q3: '1:27.123',
      },
      endingPosition: 1,
      raceScore: 92,
      seasonScore: 88,
      lapTimes: [
        {
          lap: 1,
          time: 98120,
          minTime: 96500,
          maxTime: 99800,
          avgTime: 98200,
        },
        {
          lap: 2,
          time: 96333,
          minTime: 94800,
          maxTime: 98200,
          avgTime: 96700,
        },
      ],
    },
    seasonPoints: [],
  },
};

const previousRacePayload = {
  ...latestRacePayload,
  data: {
    ...latestRacePayload.data,
    selectedRace: {
      id: 'bahrain',
      round: 1,
      name: 'Bahrain Grand Prix',
      startingPosition: 2,
      racePoints: 18,
      cumulativePoints: 18,
      qualifying: {
        q1: '1:29.101',
        q2: '1:28.332',
        q3: '1:27.911',
      },
      endingPosition: 2,
      raceScore: 84,
      seasonScore: 80,
      lapTimes: [],
    },
  },
};

describe('DriverDetailExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearF1DataClientCache();
  });

  it('renders header dropdown, gauges, and race performance values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => latestRacePayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriverDetailExplorer driverId="1" year={2024} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/f1/drivers/1?year=2024',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    expect(
      await screen.findByRole('heading', { name: /max verstappen/i }),
    ).toBeInTheDocument();

    const roundSelect = screen.getByLabelText(/round/i);
    expect(roundSelect).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /^saudi arabian grand prix$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /^race performance$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/season performance/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/ending position/i)).toBeInTheDocument();
    expect(screen.getByText(/^q1$/i)).toBeInTheDocument();
    expect(screen.getByText(/^q2$/i)).toBeInTheDocument();
    expect(screen.getByText(/^q3$/i)).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  it('loads selected race data when dropdown selection changes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => latestRacePayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => previousRacePayload,
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriverDetailExplorer driverId="1" year={2024} />);

    const roundSelect = await screen.findByLabelText(/round/i);

    fireEvent.change(roundSelect, {
      target: { value: 'bahrain' },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/f1/drivers/1?year=2024&raceId=bahrain',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    expect(await screen.findByText('84')).toBeInTheDocument();
    expect(
      screen.getByText(/lap-time data is not available for this race/i),
    ).toBeInTheDocument();
  });

  it('hides all-driver comparison labels when comparison data is missing', async () => {
    const payloadWithoutComparison = {
      ...latestRacePayload,
      data: {
        ...latestRacePayload.data,
        selectedRace: {
          ...latestRacePayload.data.selectedRace,
          lapTimes: [
            { lap: 1, time: 98120 },
            { lap: 2, time: 96333 },
          ],
        },
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payloadWithoutComparison,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriverDetailExplorer driverId="1" year={2024} />);

    await screen.findByRole('heading', { name: /max verstappen/i });

    expect(screen.getByText(/^Lap Times by Lap$/i)).toBeInTheDocument();
    expect(screen.queryByText(/all drivers min/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/all drivers max/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/all drivers avg/i)).not.toBeInTheDocument();
  });

  it('shows an error state when the request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unsupported driver detail request.' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriverDetailExplorer driverId="1" year={2024} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unsupported driver detail request/i,
    );
  });
});
