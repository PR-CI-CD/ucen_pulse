import { useState } from "react";
import './App.css';
import Navbar from './components/Navbar';
import AddActivityButton from './components/AddActivityButton';
import AddActivityModal from "./components/AddActivityModal";

function App() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="App">

      <Navbar />

      <section className="px-4 mt-10 sm:px-6 lg:px-10 py-3 w-full">
        <h1 className="text-2xl font-bold mb-2">Welcome, Michael</h1>
        <AddActivityButton
          open={isAddOpen}
          onOpen={() => setIsAddOpen(true)}
        />
      </section>

      <AddActivityModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />


    </div>
  );
}

export default App;
