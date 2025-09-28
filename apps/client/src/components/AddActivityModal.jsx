import React, { useEffect, useRef, useState } from "react";

/**
 * Accessible modal with a form to add an activity.
 * Saves entries to localStorage under key "activities".
 */

const LS_KEY = "activities";

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
    const e = {};
    if (!date) e.date = "Please select a date.";
    if (!type) e.type = "Please choose an activity type.";
    const d = Number(duration);
    if (!duration || Number.isNaN(d) || d <= 0)
      e.duration = "Enter duration in minutes (greater than 0).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const entry = {
      id: uid(),
      dateISO: date,          // yyyy-mm-dd
      type,
      duration: Number(duration),
      notes: notes.trim(),
      createdAt: Date.now(),  // timestamp
    };

    const list = loadActivities();
    const next = [entry, ...list];
    saveActivities(next);

    // Optional: notify other parts of the app something changed
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
            <h2 id="add-activity-title" className="text-lg font-semibold">
              Add Activity
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
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-700">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium">
                Activity Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select type…</option>
                <option>Running</option>
                <option>Cycling</option>
                <option>Gym</option>
                <option>Swimming</option>
                <option>Yoga</option>
                <option>Walking</option>
                <option>Other</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-700">{errors.type}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="duration"
                className="mb-1 block text-sm font-medium"
              >
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-700">{errors.duration}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="How did it feel? Pace, sets, etc."
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
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
