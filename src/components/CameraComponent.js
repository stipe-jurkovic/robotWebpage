import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const CameraComponent = ({ topicConfig }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [paused, setPaused] = useState(false);
  const listenerRef = useRef(null);
  const publisherRef = useRef(null);

  useEffect(() => {
    if (!topicConfig || !topicConfig.ros) {
      console.error("topicConfig or topicConfig.ros is undefined.");
      return;
    }

    const messageType = topicConfig.messageType || "sensor_msgs/msg/Image";

    const listener = new ROSLIB.Topic({
      ros: topicConfig.ros,
      name: topicConfig.name,
      messageType: messageType,
    });

    listenerRef.current = listener;

    listener.subscribe((message) => {
      if (paused) return;

      const { format, data } = message;

      if (typeof data !== "string") {
        console.error("Expected base64-encoded JPEG in 'data' field.");
        return;
      }

      const mimeType = format.toLowerCase().includes("png")
        ? "image/png"
        : "image/jpeg";

      setImageSrc(`data:${mimeType};base64,${data}`);
    });

    publisherRef.current = new ROSLIB.Topic({
      ros: topicConfig.ros,
      name: "TriggerBurnTopic",
      messageType: "std_msgs/msg/String",
    });


    return () => {
      listener.unsubscribe();
    };
  }, [topicConfig, paused]);

  const togglePaused = () => {
    setPaused((prev) => !prev);
  };

  // Funkcija za slanje poruke na topic
  const sendMessage = () => {
    if (!publisherRef.current) {
      console.error("Publisher not initialized.");
      return;
    }
    const msg = new ROSLIB.Message({
      data: "Burn",
    });
    publisherRef.current.publish(msg);
    console.log("Message published:", msg);
  };

  return (
    <div className="container-xl mt-4 theme-dark" style={{ maxWidth: "600px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span>ROS 2 {topicConfig.name} Camera Feed</span>
          <button
            className="btn btn-sm btn-outline-light ms-auto"
            onClick={togglePaused}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px", padding: 0 }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="ROS Camera Feed"
              style={{ maxWidth: "100%", borderRadius: "0 0 8px 8px" }}
            />
          ) : (
            <div style={{ color: "#fff" }}>Waiting for image...</div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-center mt-2">
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
          >
            Run Burning
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;