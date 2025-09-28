import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useActivitiesData from '../hooks/useActivitiesData';

const LS_KEY = 'activitie';

// Helper: mount a component that shows count of items from the hook
function ActivitiesProbe() {
  const { data, isLoading, error } = useActivitiesData();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="error">{String(!!error)}</div>
      <div data-testid="count">{data.length}</div>
      <div data-testid="types">{data.map(a => a.type).join(',')}</div>
    </div>
  );
}

beforeEach(() => {
  // fresh LS for each test
  localStorage.clear();
});

describe('useActivitiesData', () => {
  test('reads initial activities from localStorage', () => {
    const seed = [
      { id: '1', type: 'Running', duration: 30, dateISO: '2025-09-20', createdAt: Date.now() },
      { id: '2', type: 'Cycling', duration: 45, dateISO: '2025-09-21', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(seed));

    render(<ActivitiesProbe />);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('false');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Running,Cycling');
  });

  test('updates when storage event fires (simulating other tab)', () => {
    const first = [{ id: '1', type: 'Running', duration: 30, dateISO: '2025-09-20', createdAt: Date.now() }];
    const second = [
      ...first,
      { id: '2', type: 'Gym', duration: 20, dateISO: '2025-09-22', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(first));

    render(<ActivitiesProbe />);
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // simulate another tab writing to LS and dispatching a storage event
    localStorage.setItem(LS_KEY, JSON.stringify(second));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY }));
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Running,Gym');
  });

  test('updates when custom "activities:updated" event fires (same tab)', () => {
    const first = [{ id: '1', type: 'Walking', duration: 10, dateISO: '2025-09-23', createdAt: Date.now() }];
    const second = [
      ...first,
      { id: '2', type: 'Yoga', duration: 25, dateISO: '2025-09-24', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(first));

    render(<ActivitiesProbe />);
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // same-tab write + custom event (what your form does)
    localStorage.setItem(LS_KEY, JSON.stringify(second));
    act(() => {
      window.dispatchEvent(new Event('activities:updated'));
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Walking,Yoga');
  });
});
