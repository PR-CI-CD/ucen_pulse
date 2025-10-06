import React, { useEffect, useRef, useState } from "react";

/**
 * Accessible modal with a form to add an activity.
 * Saves entries to localStorage under key "activities".
 */

const LS_KEY = "activities";
const ACTIVITY_TYPES = ["Running", "Cycling", "Gym", "Swimming", "Yoga", "Walking", "Other"];
const DURATION_MIN = 1;        // minutes
const DURATION_MAX = 1440;     // 24h = 1440 mins
const NOTES_MAX_LEN = 500;

function loadActivities() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivities(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- validation helpers ---
function isValidISODateString(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  // new Date('invalid') => 'Invalid Date', NaN getTime()
  return !Number.isNaN(d.getTime()) && str === d.toISOString().slice(0, 10);
}

function isInFuture(iso) {
  const today = new Date();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return new Date(iso).getTime() > endOfToday.getTime();
}

function parseInteger(value) {
  // Accepts "10", "10.0", trims whitespace, rejects NaN
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  // Enforce integer minutes
  return Math.trunc(n);
}

export default function AddActivityModal({ open, onClose }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  // form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // Close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus & prevent scroll when open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into modal
    setTimeout(() => {
      if (!dialogRef.current) return;
      const first = dialogRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first && first.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const onOverlayMouseDown = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const validate = () => {
    const nextErrors = {};

    // Date
    if (!date) {
      nextErrors.date = "Please select a date.";
    } else if (!isValidISODateString(date)) {
      nextErrors.date = "Enter a valid date (YYYY-MM-DD).";
    } else if (isInFuture(date)) {
      nextErrors.date = "Date cannot be in the future.";
    }

    // Type
    const trimmedType = String(type).trim();
    if (!trimmedType) {
      nextErrors.type = "Please choose an activity type.";
    } else if (!ACTIVITY_TYPES.includes(trimmedType)) {
      nextErrors.type = "Choose a valid activity type from the list.";
    }

    // Duration
    const minutes = parseInteger(duration);
    if (minutes === null) {
      nextErrors.duration = "Enter a number of minutes.";
    } else if (minutes < DURATION_MIN || minutes > DURATION_MAX) {
      nextErrors.duration = `Duration must be between ${DURATION_MIN} and ${DURATION_MAX} minutes.`;
    }

    // Notes
    const trimmedNotes = notes.trim();
    if (trimmedType === "Other" && trimmedNotes.length < 3) {
      nextErrors.notes = "Please add a brief description for 'Other' (at least 3 characters).";
    } else if (trimmedNotes.length > NOTES_MAX_LEN) {
      nextErrors.notes = `Notes must be ${NOTES_MAX_LEN} characters or fewer.`;
    }

    setErrors(nextErrors);

    // Focus the first error field (a11y)
    const firstErrorFieldId = ["date", "type", "duration", "notes"].find((k) => nextErrors[k]);
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

    const cleanedType = String(type).trim();
    const cleanedNotes = notes.trim();
    const cleanedDuration = parseInteger(duration);

    const entry = {
      id: uid(),
      dateISO: date,              // yyyy-mm-dd
      type: cleanedType,
      duration: cleanedDuration,  // integer minutes
      notes: cleanedNotes,
      createdAt: Date.now(),      // timestamp
    };

    const list = loadActivities();
    const next = [entry, ...list];
    saveActivities(next);

    // Notify other parts of the app something changed
    window.dispatchEvent(new Event("activities:updated"));

    // reset & close
    setType("");
    setDuration("");
    setNotes("");
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
        aria-labelledby="add-activity-title"
        className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <header className="flex items-center justify-between gap-3">
            <h2 id="add-activity-title" className="text-[18px] text-primary font-semibold">
              Add Activity
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1 text-[15px] hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Close"
            >
              Close
            </button>
          </header>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Please fix the following:</p>
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="date" className="mb-1 block text-[13px] font-medium text-textmuted">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
                max={new Date().toISOString().slice(0, 10)}
              />
              {errors.date && (
                <p id="date-error" className="mt-1 text-sm text-red-700">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="mb-1 block text-[13px] font-medium text-textmuted">
                Activity Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "type-error" : undefined}
              >
                <option value="">Select type…</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && (
                <p id="type-error" className="mt-1 text-sm text-red-700">
                  {errors.type}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="duration"
                className="mb-1 block text-[13px] font-medium text-textmuted"
              >
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                inputMode="numeric"
                min={DURATION_MIN}
                max={DURATION_MAX}
                step="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                aria-invalid={!!errors.duration}
                aria-describedby={errors.duration ? "duration-error" : undefined}
                onBlur={(e) => setDuration(String(parseInteger(e.target.value) ?? ""))}
              />
              {errors.duration && (
                <p id="duration-error" className="mt-1 text-sm text-red-700">
                  {errors.duration}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-[13px] font-medium text-textmuted">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="How did it feel? Pace, sets, etc."
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? "notes-error" : undefined}
                maxLength={NOTES_MAX_LEN}
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>{NOTES_MAX_LEN - notes.length} characters left</span>
              </div>
              {errors.notes && (
                <p id="notes-error" className="mt-1 text-sm text-red-700">
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
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
