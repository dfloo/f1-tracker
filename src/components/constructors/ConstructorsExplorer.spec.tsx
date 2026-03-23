import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearF1DataClientCache } from '@/lib/services/f1DataClient';

import ConstructorsExplorer from './ConstructorsExplorer';

const seasonPayload = {
  availableYears: [2024, 2023, 2022],
  data: {
    year: 2024,
    constructors: [
      {
        id: '9',
        name: 'Red Bull',
        latestPoints: 860,
        color: '#1E41FF',
      },
      {
        id: '6',
        name: 'Ferrari',
        latestPoints: 652,
        color: '#DC0000',
      },
      {
        id: '131',
        name: 'Mercedes',
        latestPoints: 468,
        color: '#27F4D2',
      },
      {
        id: '42',
        name: 'Zero Point Constructor',
        latestPoints: 0,
        color: '#8A8A8A',
      },
    ],
  },
};

describe('ConstructorsExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearF1DataClientCache();
  });

  it('loads the selected season and renders constructors in points order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => seasonPayload,
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ConstructorsExplorer selectedYear={2024} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/f1/constructors?year=2024',
        expect.objectContaining({ cache: 'no-store', method: 'GET' }),
      );
    });

    const list = await screen.findByRole('list', {
      name: /constructors for 2024/i,
    });
    const names = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(names).toEqual([
      'Red Bull',
      'Ferrari',
      'Mercedes',
      'Zero Point Constructor',
    ]);
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
            constructors: [
              {
                id: '1',
                name: 'McLaren',
                latestPoints: 310,
                color: '#FF8000',
              },
            ],
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(<ConstructorsExplorer selectedYear={2024} />);

    expect(
      await screen.findByRole('heading', { name: /red bull/i }),
    ).toBeInTheDocument();

    rerender(<ConstructorsExplorer selectedYear={2023} />);

    expect(
      await screen.findByRole('heading', { name: /mclaren/i }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/f1/constructors?year=2023',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('shows an error state when the request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unsupported constructors season.' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ConstructorsExplorer selectedYear={2024} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unsupported constructors season/i,
    );
  });
});
