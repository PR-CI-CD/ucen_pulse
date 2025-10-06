import React, { useEffect, useRef, useState } from 'react';

/**
 * HealthMetricsModal.jsx
 * Track Steps, Water, Sleep, or Calories. Saves to localStorage 'metrics'.
 * Entry shape: { id, type, value, unit, notes, dateISO, createdAt }
 */

const LS_KEY = 'metrics';
const METRIC_TYPES = ['Steps', 'Water', 'Sleep', 'Calories'];
const NOTES_MAX_LEN = 500;

const LIMITS = {
  Steps:   { min: 1,     max: 100000, step: 1,    integer: true,  unit: 'steps'  },
  Water:   { min: 0.1,   max: 10,     step: 0.1,  integer: false, unit: 'L'      },
  Sleep:   { min: 0.25,  max: 24,     step: 0.25, integer: false, unit: 'hours'  },
  Calories:{ min: 1,     max: 10000,  step: 1,    integer: true,  unit: 'kcal'   },
};

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

// --- validation helpers ---
function isValidISODateString(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !Number.isNaN(d.getTime()) && str === d.toISOString().slice(0, 10);
}

function isInFuture(iso) {
  const today = new Date();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return new Date(iso).getTime() > endOfToday.getTime();
}

function parseNumber(value, integer) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return integer ? Math.trunc(n) : n;
}

export default function HealthMetricsModal({ open, onClose }) {
  const overlayRef = useRef(null);
  const dialogRef   = useRef(null);

  const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType]       = useState('');
  const [value, setValue]     = useState('');
  const [notes, setNotes]     = useState('');
  const [errors, setErrors]   = useState({});

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

  const currentLimits = type && LIMITS[type] ? LIMITS[type] : null;

  const validate = () => {
    const nextErrors = {};

    // Date
    if (!date) {
      nextErrors.date = 'Please select a date.';
    } else if (!isValidISODateString(date)) {
      nextErrors.date = 'Enter a valid date (YYYY-MM-DD).';
    } else if (isInFuture(date)) {
      nextErrors.date = 'Date cannot be in the future.';
    }

    // Type
    const trimmedType = String(type).trim();
    if (!trimmedType) {
      nextErrors.type = 'Please choose a metric type.';
    } else if (!METRIC_TYPES.includes(trimmedType)) {
      nextErrors.type = 'Choose a valid metric type from the list.';
    }

    // Value (type-aware)
    if (!trimmedType || !LIMITS[trimmedType]) {
      // If type invalid, we can’t validate numerical range reliably
      if (!value) {
        nextErrors.value = 'Enter a numeric value.';
      } else if (parseNumber(value, false) === null) {
        nextErrors.value = 'Enter a numeric value.';
      }
    } else {
      const { min, max, integer } = LIMITS[trimmedType];
      const parsed = parseNumber(value, integer);
      if (parsed === null) {
        nextErrors.value = 'Enter a numeric value.';
      } else if (parsed < min || parsed > max) {
        nextErrors.value = `Value must be between ${min} and ${max}.`;
      } else if (integer && !Number.isInteger(Number(value))) {
        // catch non-integer inputs like "10.5" for integer metrics
        nextErrors.value = 'Enter a whole number.';
      }
    }

    // Notes
    const trimmedNotes = notes.trim();
    if (trimmedNotes.length > NOTES_MAX_LEN) {
      nextErrors.notes = `Notes must be ${NOTES_MAX_LEN} characters or fewer.`;
    }

    setErrors(nextErrors);

    // Focus first invalid
    const firstErrorFieldId = ['metric-date', 'metric-type', 'metric-value', 'metric-notes']
      .find((id) => {
        const key = id.replace('metric-', '');
        return nextErrors[key];
      });
    if (firstErrorFieldId) {
      requestAnimationFrame(() => {
        const el = dialogRef.current?.querySelector(`#${firstErrorFieldId}`);
        el?.focus();
      });
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const { unit, integer } = LIMITS[type] || { unit: '', integer: false };
    const parsedValue = parseNumber(value, integer);

    const entry = {
      id: uid(),
      dateISO: date,
      type,
      value: parsedValue,
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
            <h2 id="add-metric-title" className="text-[18px] text-primary font-semibold">
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
                {errors.type  && <li>{errors.type}</li>}
                {errors.value && <li>{errors.value}</li>}
                {errors.date  && <li>{errors.date}</li>}
                {errors.notes && <li>{errors.notes}</li>}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="metric-date" className="mb-1 block text-[13px] font-medium text-textmuted">
                Date
              </label>
              <input
                id="metric-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'metric-date-error' : undefined}
                max={new Date().toISOString().slice(0, 10)}
              />
              {errors.date && (
                <p id="metric-date-error" className="mt-1 text-sm text-red-700">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="metric-type" className="mb-1 block text-[13px] font-medium text-textmuted">
                Metric Type
              </label>
              <select
                id="metric-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? 'metric-type-error' : undefined}
              >
                <option value="">Select metric…</option>
                {METRIC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && (
                <p id="metric-type-error" className="mt-1 text-sm text-red-700">
                  {errors.type}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="metric-value" className="mb-1 block text-[13px] font-medium text-textmuted">
                Value {type && currentLimits ? `(${currentLimits.unit})` : ''}
              </label>
              <input
                id="metric-value"
                type="number"
                inputMode="numeric"
                min={currentLimits?.min ?? 0}
                max={currentLimits?.max ?? undefined}
                step={currentLimits?.step ?? 'any'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.value}
                aria-describedby={errors.value ? 'metric-value-error' : undefined}
                onBlur={(e) => {
                  if (!currentLimits) return;
                  const parsed = parseNumber(e.target.value, currentLimits.integer);
                  setValue(parsed === null ? '' : String(parsed));
                }}
              />
              {errors.value && (
                <p id="metric-value-error" className="mt-1 text-sm text-red-700">
                  {errors.value}
                </p>
              )}
              {type && currentLimits && (
                <p className="mt-1 text-xs text-neutral-600">
                  Range: {currentLimits.min}–{currentLimits.max} {currentLimits.unit}
                  {currentLimits.integer ? ' (whole numbers only)' : ''}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="metric-notes" className="mb-1 block text-[13px] font-medium text-textmuted">
                Notes (optional)
              </label>
              <textarea
                id="metric-notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Any context to remember…"
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? 'metric-notes-error' : undefined}
                maxLength={NOTES_MAX_LEN}
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>{NOTES_MAX_LEN - notes.length} characters left</span>
              </div>
              {errors.notes && (
                <p id="metric-notes-error" className="mt-1 text-sm text-red-700">
                  {errors.notes}
                </p>
              )}
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
              className="rounded-md bg-button px-4 py-2 text-[15px] font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Save Metric
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
