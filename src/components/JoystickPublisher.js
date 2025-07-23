import React, { useEffect, useState, useRef, useCallback } from "react";
import ROSLIB from "roslib";

const JoystickPublisher = ({ topicConfig }) => {
    const topicRef = useRef(null);
    const intervalIdRef = useRef(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [gamepads, setGamepads] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x by default
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseSpeed = 20;

    // Setup ROS topic
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

    // Gamepad polling
    const pollGamepads = useCallback(() => {
        const connected = Array.from(navigator.getGamepads()).filter(gp => gp);
        setGamepads(connected);
    }, []);

    useEffect(() => {
        window.addEventListener("gamepadconnected", pollGamepads);
        window.addEventListener("gamepaddisconnected", pollGamepads);
        const pollInterval = setInterval(pollGamepads, 1000);

        return () => {
            window.removeEventListener("gamepadconnected", pollGamepads);
            window.removeEventListener("gamepaddisconnected", pollGamepads);
            clearInterval(pollInterval);
        };
    }, [pollGamepads]);

    // Start publishing from selected gamepad
    const startPublishing = useCallback(() => {
        if (intervalIdRef.current || selectedIndex === null) return;

        if (gamepads) {
            console.log("Available axes:", gamepads[selectedIndex].axes);
        }

        intervalIdRef.current = setInterval(() => {
            const gp = navigator.getGamepads()[selectedIndex];
            if (gp && topicRef.current) {
                const leftStickX = gp.axes[0];  // angular.z
                const rightStickY = isMobile ? gp.axes[3] : gp.axes[5]; // linear.x

                const deadzone = (val, t = 0.1) => Math.abs(val) < t ? 0 : val;

                const scaledLinear = deadzone(-rightStickY) * baseSpeed * speedMultiplier;
                const scaledAngular = deadzone(leftStickX) * baseSpeed * speedMultiplier;
                
                const msg = new ROSLIB.Message({
                    linear: { x: scaledLinear, y: 0.0, z: 0.0 },
                    angular: { x: 0.0, y: 0.0, z: scaledAngular }
                });

                topicRef.current.publish(msg);
                console.log("Published:", msg);
            }
        }, 100);
    }, [selectedIndex, speedMultiplier]);

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
                    <button
                        className="btn btn-sm btn-outline-light"
                        onClick={togglePublishing}
                        disabled={selectedIndex === null}
                    >
                        {isPublishing ? "Stop" : "Start"} Joystick
                    </button>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label text-light">Select Gamepad:</label>
                        <select
                            className="form-select"
                            value={selectedIndex ?? ""}
                            onChange={(e) => setSelectedIndex(Number(e.target.value))}
                        >
                            <option value="" disabled>Select a gamepad</option>
                            {gamepads.map((gp, index) => (
                                <option key={gp.index} value={gp.index}>
                                    {gp.id || `Gamepad ${index}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-light">Speed Multiplier:</label>
                        <select
                            className="form-select"
                            value={speedMultiplier}
                            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                        >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                            <option value={4}>4x</option>
                            <option value={5}>5x</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoystickPublisher;
