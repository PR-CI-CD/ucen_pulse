import React, { useEffect, useRef, useState } from 'react';

/**
 * HealthMetricsModal.jsx
 * Track Steps, Water, Sleep, or Calories. Saves to localStorage 'metrics'.
 * Entry shape: { id, type, value, unit, notes, dateISO, createdAt }
 */

const LS_KEY = 'metrics';

function loadMetrics() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMetrics(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const UNIT_BY_TYPE = {
  Steps: 'steps',
  Water: 'L',
  Sleep: 'hours',
  Calories: 'kcal',
};

export default function HealthMetricsModal({ open, onClose }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus & prevent scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (!dialogRef.current) return;
      const first = dialogRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first && first.focus();
    }, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const onOverlayMouseDown = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const validate = () => {
    const e = {};
    if (!date) e.date = 'Please select a date.';
    if (!type) e.type = 'Please choose a metric type.';
    const n = Number(value);
    if (!value || Number.isNaN(n) || n <= 0) e.value = 'Enter a numeric value (greater than 0).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const unit = UNIT_BY_TYPE[type] || '';
    const entry = {
      id: uid(),
      dateISO: date,
      type,
      value: Number(value),
      unit,
      notes: notes.trim(),
      createdAt: Date.now(),
    };

    const list = loadMetrics();
    const next = [entry, ...list];
    saveMetrics(next);
    window.dispatchEvent(new Event('metrics:updated'));

    // reset & close
    setType('');
    setValue('');
    setNotes('');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onOverlayMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-metric-title"
        className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <header className="flex items-center justify-between gap-3">
            <h2 id="add-metric-title" className="text-lg font-semibold">
              Add Health Metric
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Close"
            >
              Close
            </button>
          </header>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Please fix the following:</p>
              <ul className="list-disc pl-5">
                {errors.type && <li>Please choose a metric type.</li>}
                {errors.value && <li>Enter a numeric value (greater than 0).</li>}
                {errors.date && <li>Please select a date.</li>}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="metric-date" className="mb-1 block text-sm font-medium">
                Date
              </label>
              <input
                id="metric-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-700">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="metric-type" className="mb-1 block text-sm font-medium">
                Metric Type
              </label>
              <select
                id="metric-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select metric…</option>
                <option>Steps</option>
                <option>Water</option>
                <option>Sleep</option>
                <option>Calories</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-700">Please choose a metric type.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="metric-value" className="mb-1 block text-sm font-medium">
                Value
              </label>
              <input
                id="metric-value"
                type="number"
                inputMode="numeric"
                min="0"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-700">Enter a numeric value (greater than 0).</p>
              )}
              {/* Unit hint */}
              {type && (
                <p className="mt-1 text-xs text-neutral-600">
                  Unit: <span className="font-medium">{UNIT_BY_TYPE[type]}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="metric-notes" className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="metric-notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Any context to remember…"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Add Metric
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
