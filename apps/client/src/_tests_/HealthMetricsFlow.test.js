import React, { useState } from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AddActivityButton from '../components/AddActivityButton';
import HealthMetricsModal from '../components/HealthMetricsModal';

/** Host wiring to mirror App usage */
function TestHost() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h1>Welcome, Michael</h1>
      <AddActivityButton label="+ Add Metrics" open={open} onClick={() => setOpen(true)} />
      <HealthMetricsModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

beforeEach(() => {
  let store = {};
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((k) =>
    Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null
  );
  jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k, v) => { store[k] = v; });
  jest.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => { store = {}; });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Health metrics logging flow', () => {
  test('button opens metrics modal', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    await user.click(screen.getByRole('button', { name: /\+ add metrics/i }));
    expect(screen.getByRole('dialog', { name: /add health metric/i })).toBeInTheDocument();
  });

  test('empty submit shows errors; valid submit saves to localStorage and closes', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    await user.click(screen.getByRole('button', { name: /\+ add metrics/i }));
    const dialog = screen.getByRole('dialog', { name: /add health metric/i });

    const saveBtn = within(dialog).getByRole('button', { name: /save metric/i });
    await user.click(saveBtn);

    // Error summary present
    expect(within(dialog).getByText(/please fix the following/i)).toBeInTheDocument();
    // Duplicate messages across summary + inline -> getAllByText
    expect(within(dialog).getAllByText(/please choose a metric type/i).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/enter a numeric value.*greater than 0/i).length).toBeGreaterThan(0);

    // Fill valid form
    await user.selectOptions(within(dialog).getByLabelText(/metric type/i), 'Water');
    const value = within(dialog).getByLabelText(/value/i);
    await user.clear(value);
    await user.type(value, '2');
    await user.type(within(dialog).getByLabelText(/notes/i), 'Hydrated well');

    await user.click(saveBtn);

    // Persisted
    expect(window.localStorage.setItem).toHaveBeenCalled();
    const [key, val] = window.localStorage.setItem.mock.calls[0];
    expect(key).toBe('metrics');
    const parsed = JSON.parse(val);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toMatchObject({
      type: 'Water',
      value: 2,
      unit: 'L',
      notes: 'Hydrated well',
    });
    expect(parsed[0].id).toBeTruthy();
    expect(parsed[0].createdAt).toBeTruthy();

    // Closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /add health metric/i })).not.toBeInTheDocument();
    });
  });

  test('Escape closes metrics modal', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    await user.click(screen.getByRole('button', { name: /\+ add metrics/i }));
    expect(screen.getByRole('dialog', { name: /add health metric/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /add health metric/i })).not.toBeInTheDocument();
    });
  });
});
