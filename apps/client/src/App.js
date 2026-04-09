// src/App.js
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import AddActivityButton from "./components/AddActivityButton";
import AddActivityModal from "./components/AddActivityModal";
import HealthMetricsModal from "./components/HealthMetricsModal";
import DashboardOverview from "./components/DashboardOverview";
import AiSuggestions from "./components/AiSuggestions";
import Trends from "./components/Trends";
import RecordDetailPage from "./pages/RecordDetailPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

// 🔐 Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/register" replace />;
  }

  return children;
}

// Page component for "/"
function Home() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  return (
    <>
      <section
        className="px-4 mt-10 sm:px-6 lg:px-10 py-3 w-full"
        aria-labelledby="home-welcome-heading"
      >
        <h1
          id="home-welcome-heading"
          className="text-[28px] font-bold mb-4 text-primary"
        >
          Welcome, Michael
        </h1>

        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <AddActivityButton
              label="+ Add Activity"
              open={isAddOpen}
              onClick={() => setIsAddOpen(true)}
            />
            <AddActivityButton
              label="+ Add Metrics"
              open={isMetricsOpen}
              onClick={() => setIsMetricsOpen(true)}
            />
          </div>

          <AiSuggestions />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-10 py-3 w-full"
        aria-labelledby="dashboard-overview-heading"
      >
        <h2 id="dashboard-overview-heading" className="sr-only">
          Dashboard overview
        </h2>
        <DashboardOverview />
      </section>

      <section
        className="px-4 p-4 sm:px-4 lg:px-10 py-3 w-full overflow-auto"
        aria-labelledby="trends-heading"
      >
        <h2 id="trends-heading" className="sr-only">
          Trends
        </h2>
        <Trends />
      </section>

      <AddActivityModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
      <HealthMetricsModal
        open={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
      />
    </>
  );
}

// Root app shell
export default function App() {
  const location = useLocation();

  // Hide Navbar on authentication pages
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="App bg-[#F5F7FA] min-h-screen overflow-x-hidden">
      {!hideNavbar && (
        <header>
          <Navbar />
        </header>
      )}

      <main id="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/record/:id"
            element={
              <ProtectedRoute>
                <RecordDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="sr-only">Site footer</footer>
    </div>
  );
}
