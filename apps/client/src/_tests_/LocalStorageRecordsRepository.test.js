import { LocalStorageRecordsRepository } from '../lib/recordsRepository';

describe('LocalStorageRecordsRepository', () => {
  const ACT_KEY = 'activities';
  const MET_KEY = 'metrics';

  let store;
  beforeEach(() => {
    store = {};
    // mock Local Storage
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((k) =>
      Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null
    );
    jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k, v) => {
      store[k] = String(v);
    });
    jest.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => {
      store = {};
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function put(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
  }

  test('getAll merges, tags kinds, and sorts by createdAt desc', async () => {
    const acts = [
      { id: 'a1', type: 'Running', dateISO: '2025-05-10', createdAt: 2 },
      { id: 'a2', type: 'Cycling', dateISO: '2025-05-09', createdAt: 1 },
    ];
    const mets = [
      { id: 'm1', type: 'Water', value: 2, unit: 'L', dateISO: '2025-05-11', createdAt: 3 },
    ];
    put(ACT_KEY, acts);
    put(MET_KEY, mets);

    const repo = new LocalStorageRecordsRepository();
    const all = await repo.getAll();

    // keys were read
    expect(window.localStorage.getItem).toHaveBeenCalledWith(ACT_KEY);
    expect(window.localStorage.getItem).toHaveBeenCalledWith(MET_KEY);

    // sort by createdAt desc: m1 (3), a1 (2), a2 (1)
    expect(all.map(r => r.id)).toEqual(['m1', 'a1', 'a2']);

    // kinds applied
    const m1 = all.find(r => r.id === 'm1');
    const a1 = all.find(r => r.id === 'a1');
    expect(m1.kind).toBe('metric');
    expect(a1.kind).toBe('activity');
  });

  test('getAll handles invalid JSON gracefully', async () => {
    // activities invalid JSON, metrics valid
    store[ACT_KEY] = '{not-json';
    put(MET_KEY, [{ id: 'm2', type: 'Sleep', value: 7, unit: 'hours', createdAt: 1 }]);

    const repo = new LocalStorageRecordsRepository();
    const all = await repo.getAll();

    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id: 'm2', kind: 'metric' });
  });

  test('getById returns the matching item or null', async () => {
    const acts = [{ id: 'a9', type: 'Walking', createdAt: 1 }];
    const mets = [{ id: 'm9', type: 'Calories', value: 500, unit: 'kcal', createdAt: 2 }];
    put(ACT_KEY, acts);
    put(MET_KEY, mets);

    const repo = new LocalStorageRecordsRepository();

    await expect(repo.getById('m9')).resolves.toMatchObject({ id: 'm9', kind: 'metric' });
    await expect(repo.getById('a9')).resolves.toMatchObject({ id: 'a9', kind: 'activity' });
    await expect(repo.getById('zzz')).resolves.toBeNull();
  });

  test('subscribe: invokes callback on storage + custom events and cleans up on unsubscribe', async () => {
    const repo = new LocalStorageRecordsRepository();
    const cb = jest.fn();

    const unsub = repo.subscribe(cb);

    // fire events
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('activities:updated'));
    window.dispatchEvent(new Event('metrics:updated'));

    expect(cb).toHaveBeenCalledTimes(3);

    // after unsubscribe, further events should not call cb
    cb.mockClear();
    unsub();

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('activities:updated'));
    window.dispatchEvent(new Event('metrics:updated'));
    expect(cb).not.toHaveBeenCalled();
  });
});
