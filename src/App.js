import React, { useEffect, useState, useRef } from "react";
import "@tabler/core/dist/css/tabler.min.css";
import RosMessageWindow from "./components/RosMessageWindow";
import PublisherComponent from "./components/PublisherComponent";
import ROSLIB from "roslib";
function App() {

  const ros = useRef(new ROSLIB.Ros({ url: "ws://192.168.18.87:9090" }));

  useEffect(() => {
    ros.current.on("connection", () => {
      console.log("Connected to ROSBridge");
    });
    ros.current.on("error", (error) => {
      console.error("ROSBridge error:", error);
    });
    ros.current.on("close", () => {
      console.log("ROSBridge connection closed");
    });
    return () => {

      if (ros.current && ros.current.isConnected) {
        ros.current.close();
      }
    };
  }, []);

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
          <PublisherComponent
            topicConfig={{
              ros: ros.current,
              name: "stepper_control",
              messageType: "std_msgs/String",
            }}
          />
        <div className="d-flex flex-row">
          <RosMessageWindow
            topicConfig={{
              ros: ros.current,
              name: "stepper_control",
              messageType: "std_msgs/String",
            }}
          />
          <RosMessageWindow
            topicConfig={{
              ros: ros.current,
              name: "stepper_control_response",
              messageType: "std_msgs/String",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
