import React, { useEffect, useState, useRef, useCallback } from "react";
import ROSLIB from "roslib";

const JoystickPublisher = ({ topicConfig }) => {
    const topicRef = useRef(null);
    const intervalIdRef = useRef(null);
    const [isPublishing, setIsPublishing] = useState(false);

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
            topic.unadvertise();
        };
    }, [topicConfig]);

    const startPublishing = useCallback(() => {
        if (intervalIdRef.current) return; // already running

        intervalIdRef.current = setInterval(() => {
            const gp = navigator.getGamepads()[0];
            if (gp && topicRef.current) {
                const leftStickX = gp.axes[0];  // angular.z
                const rightStickY = gp.axes[5]; // linear.x

                const deadzone = (val, t = 0.1) => Math.abs(val) < t ? 0 : val;

                const msg = new ROSLIB.Message({
                    linear: { x: deadzone(-rightStickY) }, // Invert Y axis
                    angular: { z: deadzone(leftStickX) }
                });

                topicRef.current.publish(msg);
                console.log("Published:", msg);
            } else {
                console.log("No gamepad or topic");
            }
        }, 100); // every 0.1s
    }, []);

    const stopPublishing = useCallback(() => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
            console.log("Stopped publishing");
        }
    }, []);

    const togglePublishing = () => {
        if (intervalIdRef.current) {
            stopPublishing();
            setIsPublishing(false);
        } else {
            startPublishing();
            setIsPublishing(true);
        }
    };

    return (
        <div className="container-l mt-4 theme-dark">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <button className="btn btn-sm btn-outline-light" onClick={togglePublishing}>
                        {isPublishing ? "Stop" : "Start"} Joystick
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoystickPublisher;
