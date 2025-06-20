import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const Publisher = ({ topicConfig }) => {
    const topicRef = useRef(null);
    const [inputValue, setInputValue] = useState("");

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

    const publish = () => {
        if (topicRef.current) {
            if (inputValue.trim() === "") return;
            const value = JSON.parse(inputValue);
            const msg = new ROSLIB.Message(value);
            topicRef.current.publish(msg);
            console.log("Published message:", JSON.stringify(inputValue));
        }
        setInputValue("");
    };

    return (
        <div className="container-l mt-4 theme-dark">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
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

export default Publisher;
