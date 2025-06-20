import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const CameraComponent = ({ topicConfig }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [paused, setPaused] = useState(false);
  const listenerRef = useRef(null);

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

      const { width, height, data, encoding } = message;

      if (encoding !== "bgr8") {
        console.warn(`Unsupported encoding: ${encoding}`);
        return;
      }

      const byteData = Uint8Array.from(data); // Convert to Uint8Array
      const rgba = new Uint8ClampedArray(width * height * 4);

      for (let i = 0, j = 0; i < byteData.length; i += 3, j += 4) {
        rgba[j] = byteData[i + 2];     // R
        rgba[j + 1] = byteData[i + 1]; // G
        rgba[j + 2] = byteData[i];     // B
        rgba[j + 3] = 255;             // A
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const imageData = new ImageData(rgba, width, height);
      ctx.putImageData(imageData, 0, 0);
      setImageSrc(canvas.toDataURL("image/png"));
    });

    return () => {
      listener.unsubscribe();
    };
  }, [topicConfig, paused]);

  const togglePaused = () => {
    setPaused((prev) => !prev);
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
          style={{ minHeight: "400px", background: "#222" }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="ROS Camera Feed"
              style={{ maxWidth: "100%", maxHeight: "380px", borderRadius: "8px" }}
            />
          ) : (
            <div style={{ color: "#fff" }}>Waiting for image...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;
