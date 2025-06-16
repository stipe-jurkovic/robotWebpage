import React from "react";
import "@tabler/core/dist/css/tabler.min.css";
import RosMessageWindow from "./components/RosMessageWindow";

function App() {
  return (
    <div className="page theme-dark" data-bs-theme="dark">
      <header className="navbar navbar-expand-md navbar-dark bg-dark d-print-none">
        <div className="container-xl">
          <a href="#" className="navbar-brand">
            ROS 2 Dashboard
          </a>
        </div>
      </header>

      <div className="page-wrapper">
        <RosMessageWindow />
        <RosMessageWindow />
      </div>
    </div>
  );
}

export default App;
