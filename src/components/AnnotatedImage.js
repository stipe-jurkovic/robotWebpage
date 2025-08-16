import React, { useEffect, useState, useRef } from "react";

const AnnotatedImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const imageRef = useRef(null);

  const imageSrcAddr = "http://192.168.18.107:8000/images/latestAnnotatedImage.jpg";

  useEffect(() => {
    const updateImage = () => {
      const newSrc = `${imageSrcAddr}?ts=${Date.now()}`;
      const img = new Image();
      img.src = newSrc;
      img.onload = () => setImageSrc(newSrc);
    };

    updateImage();
    const interval = setInterval(updateImage, 2500);
    return () => clearInterval(interval);
  }, [imageSrcAddr]);

  const handleClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoomed(!zoomed);
  };

  return (
    <div className="container-xl mt-4 theme-dark" style={{ maxWidth: "600px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span>Annotated image</span>
        </div>
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{
            minHeight: "400px",
            padding: 0,
            overflow: "hidden", // clip zoom inside this container
            position: "relative",
          }}
        >
          {imageSrc ? (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Annotated pic"
              onClick={handleClick}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "0 0 8px 8px",
                cursor: "zoom-in",
                transform: zoomed ? "scale(4)" : "scale(1)",
                transformOrigin: origin,
                transition: "transform 0.3s ease",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <div style={{ color: "#fff" }}>Waiting for image...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnotatedImage;
