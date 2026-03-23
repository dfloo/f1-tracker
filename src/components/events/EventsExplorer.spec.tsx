import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearF1DataClientCache } from '@/lib/services/f1DataClient';

import EventsExplorer from './EventsExplorer';

const seasonPayload = {
  availableYears: [2024, 2023],
  data: {
    year: 2024,
    events: [
      {
        id: null,
        round: 2,
        name: 'Saudi Arabian Grand Prix',
      },
      {
        id: 'aus-2024',
        round: 3,
        name: 'Australian Grand Prix',
      },
      {
        id: 'bhr-2024',
        round: 1,
        name: 'Bahrain Grand Prix',
      },
    ],
  },
};

describe('EventsExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearF1DataClientCache();
  });

  it('loads the selected season and renders one card per grand prix event in round order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => seasonPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<EventsExplorer selectedYear={2024} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/f1/events?year=2024',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    const list = await screen.findByRole('list', {
      name: /grand prix events for 2024/i,
    });

    const names = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(names).toEqual([
      'Bahrain Grand Prix',
      'Saudi Arabian Grand Prix',
      'Australian Grand Prix',
    ]);
    expect(names).toHaveLength(3);
  });

  it('renders links only for events with an id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => seasonPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<EventsExplorer selectedYear={2024} />);

    const linkedEvent = await screen.findByRole('link', {
      name: /australian grand prix/i,
    });

    expect(linkedEvent).toHaveAttribute('href', '/events/aus-2024?year=2024');

    const unlinkedHeading = screen.getByRole('heading', {
      name: /saudi arabian grand prix/i,
    });

    expect(unlinkedHeading.closest('a')).toBeNull();
  });

  it('refetches when the season changes', async () => {
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
            events: [
              {
                id: 'mon-2023',
                round: 1,
                name: 'Monaco Grand Prix',
              },
            ],
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(<EventsExplorer selectedYear={2024} />);

    expect(
      await screen.findByRole('heading', { name: /bahrain grand prix/i }),
    ).toBeInTheDocument();

    rerender(<EventsExplorer selectedYear={2023} />);

    expect(
      await screen.findByRole('heading', { name: /monaco grand prix/i }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/f1/events?year=2023',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('shows an error state when the request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unsupported event season.' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<EventsExplorer selectedYear={2024} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unsupported event season/i,
    );
  });
});
