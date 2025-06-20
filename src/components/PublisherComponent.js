import React, { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";

const PublisherComponent = ({ topicConfig }) => {
    const [messages, setMessages] = useState([]);
    const topicRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [step, setStep] = useState(1);
    const [feedrate, setFeedrate] = useState(4000);



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

    const publish = (value = inputValue) => {
        if (value.trim() === "") return;
        if (topicRef.current) {
            const msg = new ROSLIB.Message({ data: value });
            topicRef.current.publish(msg);
            console.log("Published message:", value);
        }
        setInputValue("");
    };

    const sendJog = (axis, direction) => {
        const distance = direction === "+" ? step : -step;
        const gcode = `$J=G91 G21 ${axis}${distance} F${feedrate}`;
        publish(gcode);
    };

    const home = () => {
        const gcode = `$H`;
        publish(gcode);
    };
    const burn = (t) => {
        const gcode = [
            "G1 F1",            // Set feedrate
            "M3 S200",          // Laser ON
            `G4 P${t}`,         // Wait t seconds
            "M5 S0"             // Laser OFF
        ].join('\n');

        publish(gcode);
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
                <div className="card-body d-flex flex-column align-items-center">
                    {/* Step size buttons */}
                    <div className="mb-3 text-center">
                        <span className="me-2 text-white">Step size:</span>
                        {[1, 10, 100].map((s) => (
                            <button
                                key={s}
                                className={`btn btn-sm me-2 ${step === s ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => setStep(s)}
                            >
                                {s} mm
                            </button>
                        ))}
                    </div>

                    {/* Jog controls */}
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-outline-primary" onClick={() => sendJog("X", "-")}>X-</button>
                        <button className="btn btn-outline-primary" onClick={() => sendJog("X", "+")}>X+</button>
                        <button className="btn btn-outline-success" onClick={() => sendJog("Y", "-")}>Y-</button>
                        <button className="btn btn-outline-success" onClick={() => sendJog("Y", "+")}>Y+</button>
                    </div>
                    <div className="mb-3 text-center py-2">
                        <span className="me-2 text-white">Jog speed:</span>
                        {[1000, 2000, 4000].map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm me-2 ${feedrate === f ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setFeedrate(f)}
                            >
                                {f} mm/min
                            </button>
                        ))}
                    </div><div className="mb-3 text-center py-2">
                        <span className="me-2 text-white">Home: </span>
                        <button
                            className={`btn btn-sm me-2 btn-outline-success`}
                            onClick={() => home()}
                        >
                            Home
                        </button>
                    </div>
                    <div className="mb-3 text-center py-2">
                        <span className="me-2 text-white">Burn:</span>
                        {[1000, 2000, 4000].map((t) => (
                            <button
                                key={t}
                                className="btn btn-sm me-2 btn-outline-success"
                                onClick={() => burn(t / 1000)}
                            >
                                {t} ms
                            </button>
                        ))}

                        {/* Custom burn duration input */}
                        <input
                            type="number"
                            className="form-control d-inline-block ms-3"
                            style={{ width: "100px" }}
                            placeholder="ms"
                            id="customBurnInput"
                            defaultValue={100}
                        />
                        <button
                            className="btn btn-sm btn-outline-success ms-2"
                            onClick={() => {
                                const input = document.getElementById("customBurnInput");
                                const value = parseFloat(input.value);
                                if (!isNaN(value)) burn(value / 1000);
                            }}
                        >
                            Burn
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default PublisherComponent;
