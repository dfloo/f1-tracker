import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DriversExplorer from './DriversExplorer';

const seasonPayload = {
  availableYears: [2024, 2023, 2022],
  data: {
    year: 2024,
    drivers: [
      {
        id: '1',
        name: 'Max Verstappen',
        latestPoints: 437,
      },
      {
        id: '16',
        name: 'Charles Leclerc',
        latestPoints: 356,
      },
      {
        id: '63',
        name: 'George Russell',
        latestPoints: 245,
      },
      {
        id: '99',
        name: 'Zero Point Driver',
        latestPoints: 0,
      },
    ],
  },
};

describe('DriversExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the selected season and renders drivers in points order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => seasonPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriversExplorer />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drivers?year=2024',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    const list = await screen.findByRole('list', {
      name: /drivers for 2024/i,
    });
    const names = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(names).toEqual([
      'Max Verstappen',
      'Charles Leclerc',
      'George Russell',
      'Zero Point Driver',
    ]);
  });

  it('refetches when the season changes', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => seasonPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...seasonPayload,
          data: {
            year: 2023,
            drivers: [
              {
                id: '14',
                name: 'Fernando Alonso',
                latestPoints: 206,
              },
            ],
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriversExplorer />);

    expect(
      await screen.findByRole('heading', { name: /max verstappen/i }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/season/i), '2023');

    expect(
      await screen.findByRole('heading', { name: /fernando alonso/i }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/drivers?year=2023',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('shows an error state when the request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unsupported driver season.' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<DriversExplorer />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unsupported driver season/i,
    );
  });
});
