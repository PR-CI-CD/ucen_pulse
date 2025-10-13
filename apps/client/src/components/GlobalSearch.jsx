import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorageRecordsRepository } from "../lib/recordsRepository";
import { useRecordsSearch } from "../hooks/useRecordsSearch";

const repo = new LocalStorageRecordsRepository();

export default function GlobalSearch({ value, controlId }) {
  const navigate = useNavigate();
  const { setQuery, results, loading } = useRecordsSearch(repo);
  const [open, setOpen] = useState(true);
  const [focused, setFocused] = useState(0);
  const listRef = useRef(null);

  // Keep hook in sync with outer input value
  useEffect(() => {
    setQuery(value || "");
  }, [value, setQuery]);

  const top10 = useMemo(() => results.slice(0, 10), [results]);

  // Stable IDs/helpers
  const listboxId = useMemo(
    () => (controlId ? `${controlId}-results` : `search-results`),
    [controlId]
  );

  const optionId = useCallback((i) => `${listboxId}-opt-${i}`, [listboxId]);

  const select = useCallback(
    (item) => {
      setOpen(false);
      navigate(`/record/${item.id}`);
    },
    [navigate]
  );

  // Attach keyboard handler to the INPUT (owner) so arrows work
  useEffect(() => {
    if (!controlId) return;
    const input = document.getElementById(controlId);
    if (!input) return;

    // Ensure a11y linkage from input to listbox
    input.setAttribute("aria-controls", listboxId);
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("role", "combobox");

    const onKeyDown = (e) => {
      // Open on ArrowDown or Enter when closed
      if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
        setOpen(true);
        return;
      }
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocused((i) => Math.min(i + 1, Math.max(0, top10.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocused((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = top10[focused];
        if (item) select(item);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    input.addEventListener("keydown", onKeyDown);
    return () => input.removeEventListener("keydown", onKeyDown);
  }, [controlId, listboxId, open, top10, focused, select]);

  // Keep activedescendant in sync so screen readers know the "virtual focus"
  useEffect(() => {
    if (!controlId) return;
    const input = document.getElementById(controlId);
    if (!input) return;

    if (open && top10.length > 0) {
      input.setAttribute("aria-expanded", "true");
      input.setAttribute("aria-activedescendant", optionId(focused));
    } else {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }
  }, [controlId, open, focused, top10, optionId]);

  // Hide panel if no query
  if (!(value || "").trim()) return null;

  return (
    <div
      id={listboxId}
      className={`absolute z-50 mt-2 w-full max-h-96 overflow-auto rounded-md border bg-white shadow ${open ? "" : "hidden"}`}
      // Keep input focused while clicking options
      onMouseDown={(e) => e.preventDefault()}
      ref={listRef}
      role="listbox"
      aria-label="Search results"
      aria-busy={loading ? "true" : "false"}
    >
      {loading && (
        <div role="status" aria-live="polite" className="px-3 py-2 text-sm text-gray-500">
          Searching…
        </div>
      )}

      {!loading && top10.length === 0 && (
        <div role="status" aria-live="polite" className="px-3 py-2 text-sm text-gray-500">
          No matches
        </div>
      )}

      {!loading &&
        top10.map((r, i) => (
          <button
            key={r.id}
            id={optionId(i)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 ${i === focused ? "bg-gray-100" : ""}`}
            onMouseEnter={() => setFocused(i)}
            onClick={() => select(r)}
            role="option"
            aria-selected={i === focused}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {r.kind === "activity"
                  ? r.type
                  : `${r.type} ${r.value}${r.unit ? ` ${r.unit}` : ""}`}
              </div>
              <div className="text-xs text-gray-500">{r.dateISO}</div>
            </div>
            {r.notes ? (
              <div className="text-xs text-gray-600 line-clamp-1">{r.notes}</div>
            ) : null}
            <div className="text-[11px] text-gray-400">
              {r.kind === "activity" ? "Activity" : "Metric"}
            </div>
          </button>
        ))}
    </div>
  );
}

