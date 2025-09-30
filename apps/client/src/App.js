import { useState } from "react";
import './App.css';
import Navbar from './components/Navbar';
import AddActivityButton from './components/AddActivityButton';
import AddActivityModal from "./components/AddActivityModal";
import HealthMetricsModal from "./components/HealthMetricsModal";
import DashboardOverview from "./components/DashboardOverview";
import Trends from "./components/Trends";

function App() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  return (
    <div className="App bg-[#F5F7FA] min-h-screen overflow-x-hidden">
      {/*** NAVIGATION BAR ****/}
      <Navbar />

      {/**** ACTION SECTION ****/}

      <section className="px-4 mt-10 sm:px-6 lg:px-10 py-3 w-full">
        <h1 className="text-[28px] font-bold mb-4 text-primary">Welcome, Michael</h1>
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Activity button */}
            <AddActivityButton
              label="+ Add Activity"
              open={isAddOpen}
              onClick={() => setIsAddOpen(true)}
            />

            {/* Health metrics button */}
            <AddActivityButton
              label="+ Add Metrics"
              open={isMetricsOpen}
              onClick={() => setIsMetricsOpen(true)}

            />
          </div>

          <div>
            OTHER CONTENT
          </div>
        </div>
      </section>

      <section className="px-4  sm:px-6 lg:px-10 py-3 w-full">
        <DashboardOverview />
      </section>
      

      {/**** TRENDS SECTION ****/}
      <section className="px-4 p-4 mt-4 sm:px-4 lg:px-10 py-3 w-full overflow-auto">
        <div className="">
          <Trends />
        </div>
      </section>

      <sction>
        hello
      </sction>

      {/* Modals */}
      <AddActivityModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <HealthMetricsModal open={isMetricsOpen} onClose={() => setIsMetricsOpen(false)} />
    </div>
  );
}

export default App;

