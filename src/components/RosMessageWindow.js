import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const RosMessageWindow = ({ topicConfig }) => {
  const [messages, setMessages] = useState([]);
  const [paused, setPaused] = useState(false);
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!topicConfig || !topicConfig.ros) {
      console.error("topicConfig or topicConfig.ros is undefined.");
      return;
    }

    const listener = new ROSLIB.Topic({
      ros: topicConfig.ros,
      name: topicConfig.name,
      messageType: topicConfig.messageType,
    });

    listenerRef.current = listener;

    listener.subscribe((message) => {
      if (paused) return;
      const time = new Date().toLocaleTimeString();
      const text = message.data || "No data";
      setMessages((prev) => [{ time, text }, ...prev.slice(0, 49)]);
    });

    return () => {
      listener.unsubscribe();
    };
  }, [topicConfig, paused]);

  const togglePaused = () => {
    setPaused((prev) => !prev);
  };

  return (
    <div className="container-xl mt-4 theme-dark">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>ROS 2 {topicConfig.name} Topic Messages</span>
          <button className="btn btn-sm btn-outline-light" onClick={togglePaused}>
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
        <div
          className="card-body"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {messages.length === 0 ? (
            <div>Waiting for messages...</div>
          ) : (
            <ul className="list-group">
              {messages.map((msg, idx) => (
                <li key={idx} className="list-group-item">
                  <span className="badge me-2">{msg.time}</span>
                  {msg.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosMessageWindow;
