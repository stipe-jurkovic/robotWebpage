import React, { useEffect, useRef, useState } from "react";
import "@tabler/core/dist/css/tabler.min.css";
import RosMessageWindow from "./components/RosMessageWindow";
import PublisherComponent from "./components/PublisherComponent";
import JoystickPublisher from "./components/JoystickPublisher";
import ROSLIB from "roslib";
import CameraComponent from "./components/CameraComponent";

function App() {
  const ros = useRef(null);
  const reconnectInterval = useRef(null);
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);


  useEffect(() => {
    // Funkcija za spajanje na ROSBridge
    const connectRos = () => {
      if (ros.current) {
        ros.current.close(); // sigurno zatvori postojeću konekciju ako postoji
      }

      ros.current = new ROSLIB.Ros({
        url: `ws://${window.location.hostname}:9090`,
      });

      ros.current.on("connection", () => {
        console.log("Connected to ROSBridge");
        setConnected(true);
        setRetryCount(0);
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      });

      ros.current.on("error", (error) => {
        console.error("ROSBridge error:", error);
        setConnected(false);
      });

      ros.current.on("close", () => {
        console.log("ROSBridge connection closed");
        setConnected(false);

        if (!reconnectInterval.current) {
          // Postavi interval da pokušava reconnectati svake 2 sekunde
          reconnectInterval.current = setInterval(() => {
            setRetryCount((count) => count + 1);
            console.log("Attempting to reconnect to ROSBridge...");
            connectRos();
          }, 2000);
        }
      });
    };
    connectRos();

    return () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
      if (ros.current && ros.current.isConnected) {
        ros.current.close();
      }
    };
  }, []);

  if (!connected) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
          color: "#ddd",
          backgroundColor: "#222",
          flexDirection: "column",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          className="spinner"
          style={{
            border: "4px solid rgba(255, 255, 255, 0.2)",
            borderTop: "4px solid #4caf50",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        />
        Connecting to ROSBridge...
        {retryCount > 0 && (
          <div style={{ fontSize: "1rem", color: "#aaa" }}>
            Retrying connection... (attempt {retryCount})
          </div>
        )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page theme-dark pb-4" data-bs-theme="dark">
      <header className="navbar navbar-expand-md navbar-dark bg-dark d-print-none">
        <div className="container-xl">
          <span className="navbar-brand">ROS 2 Dashboard</span>
        </div>
      </header>

      <div className="page-wrapper">
        <div className="d-flex flex-column">
          <CameraComponent
            topicConfig={{
              ros: ros.current,
              name: "image/compressed",
              messageType: "sensor_msgs/msg/CompressedImage",
            }}
          />
          <PublisherComponent
            topicConfig={{
              ros: ros.current,
              name: "stepper_control",
              messageType: "std_msgs/String",
            }}
          />
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
          <JoystickPublisher
            topicConfig={{
              ros: ros.current,
              name: "wheels",
              messageType: "geometry_msgs/msg/Twist",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
