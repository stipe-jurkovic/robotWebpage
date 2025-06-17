import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const PublisherComponent = ({ topicConfig }) => {
    const [messages, setMessages] = useState([]);
    const topicRef = useRef(null);

    useEffect(() => {
        if (!topicConfig || !topicConfig.ros) {
            console.error("topicConfig or topicConfig.ros is undefined.");
            return;
        }

        const topic = new ROSLIB.Topic({
            ros: topicConfig.ros,
            name: topicConfig.name,
            messageType: topicConfig.messageType,
        });

        topic.advertise();

        topicRef.current = topic;
        return () => {
        };
    }, [topicConfig]);

    const [inputValue, setInputValue] = useState("");

    const publish = () => {
        if (inputValue.trim() === "") return;
        // Publish the message to ROS topic
        if (topicRef.current) {
            const msg = new ROSLIB.Message({ data: inputValue });
            console.log(topicRef.current.publish(msg));
            console.log("Published message:", inputValue);
        }
        setInputValue("");
    };

    return (
        <div className="container-xl mt-4 theme-dark">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <input
                        type="text"
                        className="form-control me-2"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") publish();
                        }}
                    />
                    <button className="btn btn-sm btn-outline-light" onClick={publish}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublisherComponent;
