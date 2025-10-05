
const ACT_LS_KEY = "activities";
const MET_LS_KEY = "metrics";

function safeParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

// Common shape we return:
// { kind: "activity"|"metric", id, dateISO, ... , createdAt }

export class LocalStorageRecordsRepository {
  async getAll() {
    const acts = safeParse(localStorage.getItem(ACT_LS_KEY), []).map(a => ({
      ...a,
      kind: "activity",
    }));
    const mets = safeParse(localStorage.getItem(MET_LS_KEY), []).map(m => ({
      ...m,
      kind: "metric",
    }));
    return [...acts, ...mets].sort((a, b) => b.createdAt - a.createdAt);
  }

  async getById(id) {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  }

  // Optional live updates (listens to your custom events)
  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener("storage", handler);
    window.addEventListener("activities:updated", handler);
    window.addEventListener("metrics:updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("activities:updated", handler);
      window.removeEventListener("metrics:updated", handler);
    };
  }
}

// Later, if we had a backend API, we could do something like:
// export class ServerRecordsRepository { async getAll(){...} async getById(){...} subscribe(){...} }
