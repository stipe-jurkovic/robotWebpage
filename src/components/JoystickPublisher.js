import React, { useEffect, useState, useRef, useCallback } from "react";
import ROSLIB from "roslib";
import Joystick from 'rc-joystick';


const JoystickPublisher = ({ topicConfig }) => {
    const topicRef = useRef(null);
    const intervalIdRef = useRef(null);
    const intervalIdRefSoftware = useRef(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [gamepads, setGamepads] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x by default
    const [joystickEnabled, setJoystickEnabled] = useState(false);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const joystickControlRef = useRef({ linear: 0, angular: 0 });
    const [softwareJoystickActive, setSoftwareJoystickActive] = useState(false);
    const speedMultiplierRef = useRef(speedMultiplier);
    const baseSpeed = 20;
    const radius = 75; // keep in sync with Joystick baseRadius

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

    const sendRosMessage = useCallback((leftStickX, rightStickY) => {
        const deadzone = (val, t = 0.1) => Math.abs(val) < t ? 0 : val;

        const scaledLinear = deadzone(-rightStickY) * baseSpeed * speedMultiplierRef.current;
        const scaledAngular = deadzone(leftStickX) * baseSpeed * speedMultiplierRef.current;

        const msg = new ROSLIB.Message({
            linear: { x: scaledLinear, y: 0.0, z: 0.0 },
            angular: { x: 0.0, y: 0.0, z: scaledAngular }
        });

        topicRef.current.publish(msg);
        console.log("Published:", msg);
    }, [baseSpeed])

    // Start publishing from selected gamepad
    const startPublishingHardware = useCallback(() => {
        if (intervalIdRef.current || selectedIndex === null) return;

        if (gamepads) {
            console.log("Available axes:", gamepads[selectedIndex].axes);
        }

        intervalIdRef.current = setInterval(() => {
            const gp = navigator.getGamepads()[selectedIndex];
            if (gp && topicRef.current) {
                const leftStickX = gp.axes[0];  // angular.z
                const rightStickY = isMobile ? gp.axes[3] : gp.axes[5]; // linear.x

                sendRosMessage(leftStickX, rightStickY)
            }
        }, 100);
    }, [selectedIndex, gamepads, isMobile, sendRosMessage]);

    const stopPublishingHardware = useCallback(() => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
            console.log("Stopped publishing Hardware");
        }
    }, []);

    const startPublishingSoftware = useCallback(() => {
        intervalIdRefSoftware.current = setInterval(() => {
            sendRosMessage(joystickControlRef.current.angular, joystickControlRef.current.linear)
        }, 100);
    }, [sendRosMessage]);

    const stopPublishingSoftware = useCallback(() => {
        if (intervalIdRefSoftware.current) {
            clearInterval(intervalIdRefSoftware.current);
            intervalIdRefSoftware.current = null;
            console.log("Stopped publishing Software");
        }
    }, []);

    const togglePublishingHardware = () => {
        if (intervalIdRef.current) {
            stopPublishingHardware();
            setIsPublishing(false);
        } else {
            startPublishingHardware();
            setIsPublishing(true);
        }
    };

    const togglePublishingSoftware = () => {
        if (intervalIdRefSoftware.current) {
            stopPublishingSoftware();
            setJoystickEnabled(false);
        } else {
            startPublishingSoftware();
            setJoystickEnabled(true);
        }
    };

    const polarToXY = ({ angle = 0, distance = 0 }) => {
        const rad = angle * Math.PI / 180;
        // distance may be 0..1 or pixels; normalize if needed
        const r = distance > 1 ? distance / radius : distance;
        return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
    };

    const handleJoyChange = (stick) => {
        const { x, y } = polarToXY(stick);
        joystickControlRef.current.linear = -y; 
        joystickControlRef.current.angular = x
    };
    const handleActiveChange = (active) => {
        if (active) {
            setSoftwareJoystickActive(true)
            document.body.style.overflow = 'hidden';
        } else {
            setSoftwareJoystickActive(false)
            document.body.style.overflow = 'auto';
        }
    };
    const handleSpeedChange = (val) => {
        setSpeedMultiplier(val);
        speedMultiplierRef.current = val;
    };

    return (
        <div className="container-l mt-4 pb-6 theme-dark">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <button
                        className="btn btn-sm btn-outline-light"
                        onClick={togglePublishingHardware}
                        disabled={selectedIndex === null || joystickEnabled}
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
                            onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                            <option value={4}>4x</option>
                            <option value={5}>5x</option>
                        </select>
                    </div>
                </div>

                <div className="card-footer d-flex flex-column align-items-center">
                    <button
                        className="btn btn-primary mb-3"
                        onClick={togglePublishingSoftware}
                        disabled={isPublishing}
                    >
                        {joystickEnabled ? "Disable" : "Enable"} Software Joystick
                    </button>

                    <div className="d-flex justify-content-around pb-6 w-100">
                        <div className="d-flex flex-column gap-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    className={`btn btn-sm ${speedMultiplier === val ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => handleSpeedChange(val)}
                                    disabled= {softwareJoystickActive}
                                >
                                    {val}x
                                </button>
                            ))}
                        </div>

                        <Joystick
                            disabled={!joystickEnabled}
                            onChange={handleJoyChange}
                            onActiveChange={handleActiveChange}
                            style={{ width: 100, height: 100, backgroundColor: '#ddd' }}
                            baseRadius={radius}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoystickPublisher;
