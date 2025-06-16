import React, { useEffect, useState } from "react";

const generateFakeMessage = () => {
  const phrases = [
    "Publishing sensor data...",
    "Robot is moving...",
    "Warning: Low battery",
    "Target reached",
    "Updating map...",
    "Connection stable",
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const RosMessageWindow = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = {
        text: generateFakeMessage(),
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [newMessage, ...prev.slice(0, 49)]);
    }, 2000); // every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-xl mt-4 theme-dark">
      <div className="card">
        <div className="card-header">ROS 2 Message Window (Simulated)</div>
        <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
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