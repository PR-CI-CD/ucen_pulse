import { useEffect, useState } from "react";

const LS_ACTIVITIES = "activities";

function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_ACTIVITIES) || "[]"); }
  catch { return []; }
}

export default function useActivitiesData() {
  const [data, setData] = useState(() => readLS());

  useEffect(() => {
    const onStorage = (e) => { if (e.key === LS_ACTIVITIES) setData(readLS()); };
    const onCustom = () => setData(readLS()); // from your form: window.dispatchEvent(new Event("activities:updated"))
    window.addEventListener("storage", onStorage);
    window.addEventListener("activities:updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("activities:updated", onCustom);
    };
  }, []);

  // keep a stable return shape so we can swap to server later
  return { data, isLoading: false, error: null };
}
