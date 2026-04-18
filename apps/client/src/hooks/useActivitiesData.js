import { useEffect, useState } from "react";

export default function useActivitiesData() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchActivities() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("https://api.ucenpulse.com/api/activities", {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch activities");
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
    fetchActivities();

    const onCustom = () => fetchActivities();
    window.addEventListener("activities:updated", onCustom);

    return () => {
      window.removeEventListener("activities:updated", onCustom);
    };
  }, []);

  return { data, isLoading, error };
}