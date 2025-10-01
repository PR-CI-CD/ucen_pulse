import React, { useState } from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AddActivityButton from '../components/AddActivityButton';
import AddActivityModal from '../components/AddActivityModal';

/** Test host that mirrors your App wiring */
function TestHost() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h1>Welcome, Michael</h1>
      <AddActivityButton open={open} onOpen={() => setOpen(true)} />
      <AddActivityModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** Fresh mocked localStorage each test */
beforeEach(() => {
  let store = {};
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) =>
    Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
  );
  jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((key, val) => {
    store[key] = val;
  });
  jest.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => {
    store = {};
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Activity logging flow', () => {
  test('button opens the modal', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    const addBtn = screen.getByRole('button', { name: /\+ add activity/i });
    await user.click(addBtn);

    expect(screen.getByRole('dialog', { name: /add activity/i })).toBeInTheDocument();
  });

  test('empty submit shows errors; valid submit saves to localStorage and closes', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    // Open modal
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    const dialog = screen.getByRole('dialog', { name: /add activity/i });

    // Try to save without filling fields -> show errors
    const saveBtn = within(dialog).getByRole('button', { name: /save activity/i });
    await user.click(saveBtn);

    // Error summary visible
    expect(within(dialog).getByText(/please fix the following:/i)).toBeInTheDocument();

    // Updated validation messages:
    // - type: "Please choose an activity type."
    // - duration: "Enter a number of minutes." (for empty), or range message if present
    expect(within(dialog).getAllByText(/please choose an activity type/i).length).toBeGreaterThan(0);

    // Accept either of the possible duration errors using alternation
    const durationError = within(dialog).getAllByText(
      /enter a number of minutes|duration must be between/i
    );
    expect(durationError.length).toBeGreaterThan(0);

    // Fill valid fields
    await user.selectOptions(within(dialog).getByLabelText(/activity type/i), 'Running');

    const durationInput = within(dialog).getByLabelText(/duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '30');

    await user.type(within(dialog).getByLabelText(/notes/i), 'Evening 5k');

    // Submit
    await user.click(saveBtn);

    // Saved to localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled();
    const [key, val] = window.localStorage.setItem.mock.calls[0];
    expect(key).toBe('activities');

    const parsed = JSON.parse(val);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toMatchObject({
      type: 'Running',
      duration: 30,
      notes: 'Evening 5k',
    });
    expect(parsed[0].id).toBeTruthy();
    expect(parsed[0].createdAt).toBeTruthy();

    // Modal closes after submit
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /add activity/i })).not.toBeInTheDocument();
    });
  });

  test('Escape key closes the modal', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    const dialog = screen.getByRole('dialog', { name: /add activity/i });
    expect(dialog).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /add activity/i })).not.toBeInTheDocument();
    });
  });

  test('backdrop click closes the modal', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));

    // The overlay is the parent of the dialog element
    const dialog = screen.getByRole('dialog', { name: /add activity/i });
    const overlay = dialog.parentElement;

    // Click the overlay (outside the dialog) to close
    await user.click(overlay);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /add activity/i })).not.toBeInTheDocument();
    });
  });
});

