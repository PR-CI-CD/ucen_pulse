import React, { useMemo, useState } from "react";
import useActivitiesData from "../hooks/useActivitiesData";
import useMetricsData from "../hooks/useMetricsData";

// --- helpers ---
const toDate = (d) => (d instanceof Date ? d : new Date(d ?? 0));
const fmtDate = (d) =>
  d.toLocaleDateString(undefined, {

    day: "2-digit",
    month: "short",
    year: "numeric"

  });

function getEntryDate(entry) {
  return toDate(entry.dateISO || entry.date || entry.createdAt);
}

function mostCommon(items) {
  const counts = new Map();
  for (const item of items) {
    if (!item.type) continue;
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  }
  let top = null;
  counts.forEach((count, type) => {
    if (!top || count > top.count) top = { type, count };
  });
  return top;
}

function sortByMostRecent(entryA, entryB) {
  return getEntryDate(entryB).getTime() - getEntryDate(entryA).getTime();
}

function groupByType(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.type || "Unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function computeActivityProgress(activities, limit = 3) {
  const progressList = [];
  const grouped = groupByType(activities);
  grouped.forEach((list, type) => {
    const sortedByDate = [...list].sort(sortByMostRecent);
    if (sortedByDate.length < 2) return;
    const previousSession = sortedByDate[1];
    const latestSession = sortedByDate[0];
    const previousDate = getEntryDate(previousSession);
    const latestDate = getEntryDate(latestSession);
    const durationChange =
      Number(latestSession.duration ?? 0) - Number(previousSession.duration ?? 0);
    progressList.push({ type, delta: durationChange, from: previousDate, to: latestDate });
  });
  progressList.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  return progressList.slice(0, limit);
}

function computeMetricProgress(metrics, limit = 3) {
  const progressList = [];
  const grouped = groupByType(metrics);
  grouped.forEach((list, type) => {
    const sortedByDate = [...list].sort(sortByMostRecent);
    if (sortedByDate.length < 2) return;
    const previousEntry = sortedByDate[1];
    const latestEntry = sortedByDate[0];
    const previousDate = getEntryDate(previousEntry);
    const latestDate = getEntryDate(latestEntry);
    const valueChange = Number(latestEntry.value ?? 0) - Number(previousEntry.value ?? 0);
    const unit = latestEntry.unit || previousEntry.unit || "";
    progressList.push({ type, delta: valueChange, unit, from: previousDate, to: latestDate });
  });
  progressList.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  return progressList.slice(0, limit);
}

export default function DashboardOverview() {
  const { data: activities } = useActivitiesData();
  const { data: metrics } = useMetricsData();

  const mostCommonActivity = useMemo(() => mostCommon(activities), [activities]);
  const mostCommonMetric = useMemo(() => mostCommon(metrics), [metrics]);

  const recentActivities = useMemo(() => [...activities].sort(sortByMostRecent), [activities]);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(recentActivities.length / PAGE_SIZE));
  const activitiesOnPage = recentActivities.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const activityProgress = useMemo(() => computeActivityProgress(activities, 3), [activities]);
  const metricProgress = useMemo(() => computeMetricProgress(metrics, 3), [metrics]);

  return (
    <section
      className="
        flex flex-wrap gap-6
        [&>div]:basis-full
        md:[&>div]:basis-[calc(50%-0.75rem)]
        xl:[&>div]:basis-[calc(33.333%-1rem)]
        md:[&>div:nth-child(3)]:basis-full
        xl:[&>div:nth-child(3)]:basis-[calc(33.333%-1rem)]
      "
    >
      {/* CARD 1: Key Metrics */}
      <div
        className="rounded-xl shadow-md bg-white p-4 dark:bg-neutral-900"
        role="region"
        aria-labelledby="key-metrics-h"
      >
        <header className="mb-3">
          <h2 id="key-metrics-h" className="text-base font-semibold text-primary">
            Key Metrics
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your most frequent activity & metric types.
          </p>
        </header>

        {/* Definition list: label/value pairs */}
        <dl className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border p-3 dark:border-neutral-800">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Most Common Activity
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {mostCommonActivity ? mostCommonActivity.type : "—"}
            </dd>
            <p className="text-sm text-neutral-500">
              {mostCommonActivity
                ? `${mostCommonActivity.count} session${mostCommonActivity.count === 1 ? "" : "s"}`
                : "No data yet"}
            </p>
          </div>

          <div className="rounded-lg border p-3 dark:border-neutral-800">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Most Logged Metric
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {mostCommonMetric ? mostCommonMetric.type : "—"}
            </dd>
            <p className="text-sm text-neutral-500">
              {mostCommonMetric
                ? `${mostCommonMetric.count} entr${mostCommonMetric.count === 1 ? "y" : "ies"}`
                : "No data yet"}
            </p>
          </div>
        </dl>
      </div>

      {/* CARD 2: Recent Activity */}
      <div
        className="rounded-xl shadow-md bg-white p-4 dark:bg-neutral-900"
        role="region"
        aria-labelledby="recent-activity-h"
      >
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="recent-activity-h" className="text-base font-semibold text-primary">
              Recent Activity
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Newest first</p>
          </div>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Recent activity pagination"
          >
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm tabular-nums" aria-live="polite">
              {page + 1}/{totalPages}
            </span>
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
        </header>

        <ol className="relative ml-3 border-l pl-5 dark:border-neutral-800">
          {activitiesOnPage.length === 0 && (
            <li className="text-sm text-neutral-500" role="status" aria-live="polite">
              No activity yet.
            </li>
          )}
          {activitiesOnPage.map((activity) => {
            const activityDate = getEntryDate(activity);
            const isoDay = activityDate.toISOString().slice(0, 10); // YYYY-MM-DD
            return (
              <li key={activity.id} className="mb-4">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-primary dark:border-neutral-900" />
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{activity.type || "Unknown"}</div>
                  <div className="text-xs text-neutral-500">
                    <time dateTime={isoDay}>{fmtDate(activityDate)}</time>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  Duration:{" "}
                  <span className="tabular-nums">{Number(activity.duration ?? 0)}</span> mins
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* CARD 3: Progress */}
      <div
        className="rounded-xl shadow-md bg-white p-4 dark:bg-neutral-900"
        role="region"
        aria-labelledby="progress-h"
      >
        <header className="mb-3">
          <h2 id="progress-h" className="text-base font-semibold text-primary">
            Progress
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Change since the last entry of the same type.
          </p>
        </header>

        <div className="space-y-4">
          {/* Activities progress */}
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Activities</div>
            {activityProgress.length === 0 ? (
              <div className="text-sm text-neutral-500" role="status" aria-live="polite">
                Need at least two sessions per activity type.
              </div>
            ) : (
              <ul className="space-y-2">
                {activityProgress.map((progress) => {
                  const isUp = progress.delta >= 0;
                  const deltaAbs = Math.round(Math.abs(progress.delta));
                  const deltaLabel = isUp
                    ? `Increase of ${deltaAbs} minutes`
                    : `Decrease of ${deltaAbs} minutes`;
                  const fromIso = progress.from?.toISOString().slice(0, 10);
                  const toIso = progress.to?.toISOString().slice(0, 10);
                  return (
                    <li
                      key={progress.type}
                      className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm dark:border-neutral-800"
                    >
                      <div>
                        <div className="font-medium">{progress.type}</div>
                        {progress.from && progress.to && (
                          <div className="text-xs text-neutral-500">
                            <time dateTime={fromIso}>{fmtDate(progress.from)}</time> →{" "}
                            <time dateTime={toIso}>{fmtDate(progress.to)}</time>
                          </div>
                        )}
                      </div>
                      <div
                        className={`shrink-0 font-semibold tabular-nums ${isUp ? "text-emerald-600" : "text-rose-600"
                          }`}
                        aria-label={deltaLabel}
                      >
                        {isUp ? "+" : "−"}
                        {deltaAbs} mins
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Metrics progress */}
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Metrics</div>
            {metricProgress.length === 0 ? (
              <div className="text-sm text-neutral-500" role="status" aria-live="polite">
                Need at least two entries per metric type.
              </div>
            ) : (
              <ul className="space-y-2">
                {metricProgress.map((progress) => {
                  const isUp = progress.delta >= 0;
                  const deltaAbs = Math.round(Math.abs(progress.delta));
                  const unit = progress.unit ? ` ${progress.unit}` : "";
                  const deltaLabel = isUp
                    ? `Increase of ${deltaAbs}${unit}`
                    : `Decrease of ${deltaAbs}${unit}`;
                  const fromIso = progress.from?.toISOString().slice(0, 10);
                  const toIso = progress.to?.toISOString().slice(0, 10);
                  return (
                    <li
                      key={progress.type}
                      className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm dark:border-neutral-800"
                    >
                      <div>
                        <div className="font-medium">{progress.type}</div>
                        {progress.from && progress.to && (
                          <div className="text-xs text-neutral-500">
                            <time dateTime={fromIso}>{fmtDate(progress.from)}</time> →{" "}
                            <time dateTime={toIso}>{fmtDate(progress.to)}</time>
                          </div>
                        )}
                      </div>
                      <div
                        className={`shrink-0 font-semibold tabular-nums ${isUp ? "text-emerald-600" : "text-rose-600"
                          }`}
                        aria-label={deltaLabel}
                      >
                        {isUp ? "+" : "−"}
                        {deltaAbs}
                        {unit}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
