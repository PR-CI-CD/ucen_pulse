const ACT_LS_KEY = "activities";
const MET_LS_KEY = "metrics";

// Safely parse JSON from localStorage.
// If parsing fails or value is null, return the provided fallback.
function safeParse(raw, fallback = []) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Load an array from localStorage and tag each record with a `kind` field.
function loadWithKind(key, kind) {
  return safeParse(localStorage.getItem(key), []).map(item => ({
    ...item,
    kind,
  }));
}

export class LocalStorageRecordsRepository {
  // Fetch all activity + metric records, merge them,
  // and return sorted by createdAt (newest first).
  async getAll() {
    const activities = loadWithKind(ACT_LS_KEY, "activity");
    const metrics = loadWithKind(MET_LS_KEY, "metric");

    return [...activities, ...metrics].sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  // Look up a single record by ID.
  async getById(id) {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  }

  // Allow subscribers to react when data changes.
  // This listens for both browser storage updates and custom app events.
  subscribe(cb) {
    const handler = () => cb();

    const events = ["storage", "activities:updated", "metrics:updated"];

    // Register event listeners.
    events.forEach(event =>
      window.addEventListener(event, handler)
    );

    // Return an unsubscribe function.
    return () => {
      events.forEach(event =>
        window.removeEventListener(event, handler)
      );
    };
  }
}


// Later, when a backend API is implemented, we could do something like:
// export class ServerRecordsRepository { async getAll(){...} async getById(){...} subscribe(){...} }
