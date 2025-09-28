import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useMetricsData from '../hooks/useMetricsData';

const LS_KEY = 'metrics';

// Helper: mount a component that shows count/types
function MetricsProbe() {
  const { data, isLoading, error } = useMetricsData();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="error">{String(!!error)}</div>
      <div data-testid="count">{data.length}</div>
      <div data-testid="types">{data.map(m => m.type).join(',')}</div>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('useMetricsData', () => {
  test('reads initial metrics from localStorage', () => {
    const seed = [
      { id: 'm1', type: 'Steps', value: 5000, unit: 'steps', dateISO: '2025-09-20', createdAt: Date.now() },
      { id: 'm2', type: 'Water', value: 2, unit: 'L', dateISO: '2025-09-21', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(seed));

    render(<MetricsProbe />);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('false');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Steps,Water');
  });

  test('updates when storage event fires (other tab)', () => {
    const first = [{ id: 'm1', type: 'Sleep', value: 7, unit: 'hours', dateISO: '2025-09-22', createdAt: Date.now() }];
    const second = [
      ...first,
      { id: 'm2', type: 'Calories', value: 650, unit: 'kcal', dateISO: '2025-09-23', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(first));

    render(<MetricsProbe />);
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    localStorage.setItem(LS_KEY, JSON.stringify(second));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY }));
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Sleep,Calories');
  });

  test('updates when custom "metrics:updated" event fires (same tab)', () => {
    const first = [{ id: 'm1', type: 'Steps', value: 3000, unit: 'steps', dateISO: '2025-09-24', createdAt: Date.now() }];
    const second = [
      ...first,
      { id: 'm2', type: 'Water', value: 1.5, unit: 'L', dateISO: '2025-09-25', createdAt: Date.now() },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(first));

    render(<MetricsProbe />);
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    localStorage.setItem(LS_KEY, JSON.stringify(second));
    act(() => {
      window.dispatchEvent(new Event('metrics:updated'));
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('types')).toHaveTextContent('Steps,Water');
  });
});
