import { useState } from "react";
import './App.css';
import Navbar from './components/Navbar';
import AddActivityButton from './components/AddActivityButton';
import AddActivityModal from "./components/AddActivityModal";
import HealthMetricsModal from "./components/HealthMetricsModal";
import Trends from "./components/Trends";

function App() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  return (
    <div className="App">
      {/*** NAVIGATION BAR ****/}
      <Navbar />

      {/**** ACTION SECTION ****/}

      <section className="px-4 mt-10 sm:px-6 lg:px-10 py-3 w-full">
        <h1 className="text-2xl font-bold mb-4">Welcome, Michael</h1>

        {/* Activity button */}
        <AddActivityButton
          label="+ Add Activity"
          open={isAddOpen}
          onClick={() => setIsAddOpen(true)}
        />

        {/* Health metrics button */}
        <div className="mt-3">
          <AddActivityButton
            label="+ Add Metrics"
            open={isMetricsOpen}
            onClick={() => setIsMetricsOpen(true)}
          />
        </div>
      </section>

      {/**** TRENDS SECTION ****/}

      <section className="px-4 p-4 bg-blue-100mt-4 sm:px-6 lg:px-10 py-3 w-full">
        <div className="">
          <Trends />
        </div>
      </section>

      {/* Modals */}
      <AddActivityModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <HealthMetricsModal open={isMetricsOpen} onClose={() => setIsMetricsOpen(false)} />
    </div>
  );
}

export default App;

