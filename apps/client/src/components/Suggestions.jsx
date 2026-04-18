"use client";
import { useEffect, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { IoRefreshCircleOutline } from "react-icons/io5";

export default function AiSuggestions() {
  const [spinning, setSpinning] = useState(false);
  const [suggestion, setSuggestion] = useState("Loading suggestion...");
  const [error, setError] = useState(null);

  async function fetchSuggestion() {
    try {
      setError(null);

      const response = await fetch("https://api.ucenpulse.com/api/suggestions/daily", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch suggestion");
      }

      setSuggestion(data.suggestion);
    } catch (err) {
      setError("Unable to load suggestion");
      setSuggestion("Stay consistent with your healthy habits today.");
    }
  }

  useEffect(() => {
    fetchSuggestion();
  }, []);

  const handleClick = async () => {
    setSpinning(true);
    await fetchSuggestion();
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <section className="w-full bg-[#16DBCC] shadow-md p-3 rounded-md flex justify-between">
      <div className="flex items-center gap-3 text-white">
        <div className="text-2xl">
          <FaMagic />
        </div>
        <div>{error ? error : suggestion}</div>
      </div>
      <button
        onClick={handleClick}
        type="button"
        aria-label="Refresh suggestion"
        className="text-3xl text-white"
      >
        <IoRefreshCircleOutline
          className={`transition-transform duration-1000 ${spinning ? "rotate-[360deg] scale-50" : ""}`}
        />
      </button>
    </section>
  );
}