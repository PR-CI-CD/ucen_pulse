import React, { useMemo, useState } from "react";
import useActivitiesData from "../hooks/useActivitiesData";
import useMetricsData from "../hooks/useMetricsData";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts";

// --- tiny helpers ---
const dayMs = 24 * 60 * 60 * 1000;
const toDate = (d) => (d instanceof Date ? d : new Date(d));

function getISOWeekKey(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp - yearStart) / dayMs) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key) => {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
};
const weekLabel = (key) => key.replace("-", " ");

function buildBuckets(mode, count) {
  const out = [];
  const now = new Date();
  if (mode === "monthly") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 0; i < count; i++) { out.unshift(monthKey(d)); d.setMonth(d.getMonth() - 1); }
  } else {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < count; i++) { out.unshift(getISOWeekKey(d)); d.setDate(d.getDate() - 7); }
  }
  return out;
}

function aggregateActivities(activities, { mode, filterType, periods }) {
  const buckets = buildBuckets(mode, periods);
  const map = Object.fromEntries(buckets.map(k => [k, { duration: 0, sessions: 0 }]));
  activities.forEach(a => {
    const date = toDate(a.dateISO || a.date || a.createdAt);
    const k = mode === "monthly" ? monthKey(date) : getISOWeekKey(date);
    if (!map[k]) return;
    if (filterType && a.type !== filterType) return;
    map[k].duration += Number(a.duration || 0);
    map[k].sessions += 1;
  });
  return buckets.map(k => ({
    period: mode === "monthly" ? monthLabel(k) : weekLabel(k),
    duration: map[k].duration,
    sessions: map[k].sessions
  }));
}

function aggregateMetrics(metrics, { mode, metricType, periods }) {
  const buckets = buildBuckets(mode, periods);
  const map = Object.fromEntries(buckets.map(k => [k, { total: 0, entries: 0 }]));
  metrics.forEach(m => {
    const date = toDate(m.dateISO || m.date || m.createdAt);
    const k = mode === "monthly" ? monthKey(date) : getISOWeekKey(date);
    if (!map[k]) return;
    if (metricType && m.type !== metricType) return;
    map[k].total += Number(m.value || 0);
    map[k].entries += 1;
  });
  return buckets.map(k => ({
    period: mode === "monthly" ? monthLabel(k) : weekLabel(k),
    total: map[k].total,
    entries: map[k].entries
  }));
}

export default function Trends() {
  const { data: activities } = useActivitiesData();
  const { data: metrics } = useMetricsData();

  // filters
  const [activityMode, setActivityMode] = useState("weekly"); // weekly | monthly
  const [activityType, setActivityType] = useState("");       // '' = all
  const [metricMode, setMetricMode]     = useState("weekly");
  const [metricType, setMetricType]     = useState("");

  // options built from current data
  const activityTypes = useMemo(() => ["", ...Array.from(new Set(activities.map(a => a.type).filter(Boolean)))], [activities]);
  const metricTypes   = useMemo(() => ["", ...Array.from(new Set(metrics.map(m => m.type).filter(Boolean)))], [metrics]);

  const activityData = useMemo(
    () => aggregateActivities(activities, {
      mode: activityMode,
      filterType: activityType || "",
      periods: activityMode === "monthly" ? 6 : 8
    }),
    [activities, activityMode, activityType]
  );

  const metricData = useMemo(
    () => aggregateMetrics(metrics, {
      mode: metricMode,
      metricType: metricType || "",
      periods: metricMode === "monthly" ? 6 : 8
    }),
    [metrics, metricMode, metricType]
  );

  return (
    <div className="flex justify-between gap-6">
      {/* Activities */}
       <section className=" w-full rounded-xl  shadow-md bg-white p-4 dark:bg-neutral-900">
        <header className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-primary">Activity Trends</h2>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm" htmlFor="a-mode">View:</label>
            <select id="a-mode" className="rounded-md border px-2 py-1 text-sm"
              value={activityMode} onChange={(e) => setActivityMode(e.target.value)}>
              <option value="weekly">Weekly (last 8)</option>
              <option value="monthly">Monthly (last 6)</option>
            </select>

            <label className="text-sm" htmlFor="a-type">Type:</label>
            <select id="a-type" className="rounded-md border px-2 py-1 text-sm"
              value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              {activityTypes.map(t => <option key={t || "all"} value={t}>{t || "All"}</option>)}
            </select>
          </div>
        </header>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" stroke="#1814F3"  dataKey="duration" name="Total Minutes" fill="#1814F3"  dot={{ r: 4, stroke: "#1814F3", fill: "#16DBCC" }} />
              <Line type="monotone" dataKey="sessions" name="Sessions" strokeDasharray="5 5" fill="#16DBCC"  dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Metrics */}
      <section className="rounded-xl shadow-md bg-white p-4 dark:bg-neutral-900">
        <header className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-primary">Health Metrics Trends</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="m-mode">View:</label>
            <select id="m-mode" className="rounded-md border px-2 py-1 text-sm"
              value={metricMode} onChange={(e) => setMetricMode(e.target.value)}>
              <option value="weekly">Weekly (last 8)</option>
              <option value="monthly">Monthly (last 6)</option>
            </select>

            <label className="text-sm" htmlFor="m-type">Metric:</label>
            <select id="m-type" className="rounded-md border px-2 py-1 text-sm"
              value={metricType} onChange={(e) => setMetricType(e.target.value)}>
              {metricTypes.map(t => <option key={t || "all"} value={t}>{t || "All"}</option>)}
            </select>
          </div>
        </header>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricData}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3"  />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total Value" fill="#1814F3" />
              <Bar dataKey="entries" name="Entries" fill="#16DBCC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
