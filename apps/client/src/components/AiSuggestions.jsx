"use client";
import { useState } from "react";
import { FaMagic } from "react-icons/fa";
import { IoRefreshCircleOutline } from "react-icons/io5";

// ********

// Placeholder code to be implemented fully in the server side appilcation.

// ********

export default function AiSuggestions() {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    
    // Stop spinning after the animation completes (1s)
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <section className="w-full bg-[#16DBCC] shadow-md p-3 rounded-md flex justify-between">
      <div className="flex items-center gap-3 text-white">
        <div className="text-2xl">
          <FaMagic />
        </div>
        <div>Maintain a 100 kcal daily deficit to lose an extra 2 pounds monthly</div>
      </div>
      <button onClick={handleClick} className="text-3xl text-white">
        <IoRefreshCircleOutline
          className={`transition-transform duration-1000 ${spinning ? "rotate-[360deg] scale-50" : ""}`}
        />
      </button>
    </section>
  );
}