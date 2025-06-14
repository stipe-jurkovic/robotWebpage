import React from "react";
import "@tabler/core/dist/css/tabler.min.css";

function App() {
  return (
    <div className="page theme-dark">
      {/* Navbar */}
      <header className="navbar navbar-expand-md navbar-dark d-print-none bg-dark">
        <div className="container-xl">
          <a href="#" className="navbar-brand">
            Tabler React Dark
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="page-wrapper">
        <div className="container-xl mt-4">
          <div className="card bg-dark text-white">
            <div className="card-header">Dobrodošao!</div>
            <div className="card-body">
              Ovo je React aplikacija s Tabler dark temom.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;