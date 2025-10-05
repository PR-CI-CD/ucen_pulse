import { useEffect, useMemo, useRef, useState } from "react";

export function useRecordsSearch(repo, debounceMs = 120) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ kind: undefined, date: undefined });
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load + subscribe for changes
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const rows = await repo.getAll();
      if (alive) { setAll(rows); setLoading(false); }
    })();
    const unsub = repo.subscribe?.(async () => {
      const rows = await repo.getAll();
      setAll(rows);
    });
    return () => { alive = false; unsub && unsub(); };
  }, [repo]);

  // Debounce query
  const [debounced, setDebounced] = useState("");
  const tRef = useRef(null);
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setDebounced(query), debounceMs);
    return () => tRef.current && clearTimeout(tRef.current);
  }, [query, debounceMs]);

  const results = useMemo(() => {
    if (!all.length) return [];
    const q = (debounced || "").trim().toLowerCase();
    const tokens = q ? q.split(/\s+/) : [];

    return all.filter(r => {
      if (filters.kind && r.kind !== filters.kind) return false;
      if (filters.date && r.dateISO !== filters.date) return false;
      if (!tokens.length) return true;

      const hay = [
        r.kind,
        r.type,
        r.notes,
        r.dateISO,
        r.unit,
        r.value != null ? String(r.value) : "",
        r.duration != null ? String(r.duration) : "",
      ].join(" ").toLowerCase();

      return tokens.every(t => hay.includes(t));
    });
  }, [all, debounced, filters]);

  return { query, setQuery, filters, setFilters, results, loading, allCount: all.length };
}
