import { renderHook, act } from '@testing-library/react';
import { useRecordsSearch } from '../hooks/useRecordsSearch';

// Helper: create fake repo
function createMockRepo(initial = []) {
  let data = [...initial];
  const subscribers = new Set();

  return {
    getAll: jest.fn(async () => data),
    subscribe: jest.fn((cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    }),
    // for tests to mutate data and notify
    _pushUpdate(newData) {
      data = [...newData];
      for (const cb of subscribers) cb();
    },
  };
}

jest.useFakeTimers();

describe('useRecordsSearch', () => {
  const mockData = [
    {
      id: '1',
      kind: 'activity',
      type: 'Running',
      notes: 'Morning jog',
      dateISO: '2025-05-10',
      duration: 45,
      createdAt: 1,
    },
    {
      id: '2',
      kind: 'metric',
      type: 'Water',
      notes: 'Hydrated',
      dateISO: '2025-05-11',
      value: 2,
      unit: 'L',
      createdAt: 2,
    },
    {
      id: '3',
      kind: 'metric',
      type: 'Sleep',
      notes: '7 hours',
      dateISO: '2025-05-09',
      value: 7,
      unit: 'hours',
      createdAt: 3,
    },
  ];

  test('loads all records and clears loading state', async () => {
    const repo = createMockRepo(mockData);
    const { result } = renderHook(() => useRecordsSearch(repo));

    // initially loading
    expect(result.current.loading).toBe(true);

    // wait for async getAll
    await act(async () => {});
    expect(repo.getAll).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.allCount).toBe(3);
    expect(result.current.results.length).toBe(3);
  });

  test('filters results by text query (debounced)', async () => {
    const repo = createMockRepo(mockData);
    const { result } = renderHook(() => useRecordsSearch(repo, 300));

    await act(async () => {}); // initial load

    act(() => {
      result.current.setQuery('run');
    });

    // Debounce hasn’t fired yet
    expect(result.current.results.length).toBe(3);

    // advance fake timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].type).toBe('Running');
  });

  test('filters results by kind and date filters', async () => {
    const repo = createMockRepo(mockData);
    const { result } = renderHook(() => useRecordsSearch(repo));

    await act(async () => {}); // initial load

    // Apply kind filter
    act(() => {
      result.current.setFilters({ kind: 'metric', date: undefined });
    });
    expect(result.current.results.every(r => r.kind === 'metric')).toBe(true);

    // Apply date filter (one specific metric)
    act(() => {
      result.current.setFilters({ kind: 'metric', date: '2025-05-11' });
    });
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].type).toBe('Water');
  });

  test('updates when repo.subscribe triggers', async () => {
    const repo = createMockRepo(mockData);
    const { result } = renderHook(() => useRecordsSearch(repo));

    await act(async () => {}); // initial load
    expect(result.current.allCount).toBe(3);

    // simulate repo change
    act(() => {
      repo._pushUpdate([...mockData, { id: '4', kind: 'activity', type: 'Cycling', dateISO: '2025-05-12' }]);
    });

    // after callback runs (async)
    await act(async () => {});
    expect(result.current.allCount).toBe(4);
    expect(result.current.results.find(r => r.type === 'Cycling')).toBeTruthy();
  });
});
