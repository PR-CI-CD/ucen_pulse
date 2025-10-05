// src/App.js
import { useState } from "react";
import { Routes, Route } from "react-router-dom"; // ⬅️ add this
import "./App.css";
import Navbar from "./components/Navbar";
import AddActivityButton from "./components/AddActivityButton";
import AddActivityModal from "./components/AddActivityModal";
import HealthMetricsModal from "./components/HealthMetricsModal";
import DashboardOverview from "./components/DashboardOverview";
import Trends from "./components/Trends";
import RecordDetailPage from "./pages/RecordDetailPage"; // ⬅️ create this file

function Home() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  return (
    <>
      <section className="px-4 mt-10 sm:px-6 lg:px-10 py-3 w-full">
        <h1 className="text-[28px] font-bold mb-4 text-primary">Welcome, Michael</h1>
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <AddActivityButton label="+ Add Activity" open={isAddOpen} onClick={() => setIsAddOpen(true)} />
            <AddActivityButton label="+ Add Metrics" open={isMetricsOpen} onClick={() => setIsMetricsOpen(true)} />
          </div>
          <div>OTHER CONTENT</div>
        </div>
      </section>

      <section className="px-4  sm:px-6 lg:px-10 py-3 w-full">
        <DashboardOverview />
      </section>

      <section className="px-4 p-4 mt-4 sm:px-4 lg:px-10 py-3 w-full overflow-auto">
        <Trends />
      </section>

      <section>hello</section>

      <AddActivityModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <HealthMetricsModal open={isMetricsOpen} onClose={() => setIsMetricsOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <div className="App bg-[#F5F7FA] min-h-screen overflow-x-hidden">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record/:id" element={<RecordDetailPage />} />
      </Routes>
    </div>
  );
}

