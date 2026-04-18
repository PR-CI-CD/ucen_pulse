import { useEffect, useState } from "react";

export default function useMetricsData() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchMetrics() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("https://api.ucenpulse.com/api/metrics", {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch metrics");
      }

      setData(result.data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();

    const onCustom = () => fetchMetrics();
    window.addEventListener("metrics:updated", onCustom);

    return () => {
      window.removeEventListener("metrics:updated", onCustom);
    };
  }, []);

  return { data, isLoading, error };
}
