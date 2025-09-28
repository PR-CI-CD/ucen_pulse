import { useEffect, useState } from "react";

const LS_METRICS = "metrics";

function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_METRICS) || "[]"); }
  catch { return []; }
}

export default function useMetricsData() {
  const [data, setData] = useState(() => readLS());

  useEffect(() => {
    const onStorage = (e) => { if (e.key === LS_METRICS) setData(readLS()); };
    const onCustom = () => setData(readLS()); // window.dispatchEvent(new Event("metrics:updated"))
    window.addEventListener("storage", onStorage);
    window.addEventListener("metrics:updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("metrics:updated", onCustom);
    };
  }, []);

  return { data, isLoading: false, error: null };
}
