import React, { useEffect, useState } from "react";

const AnnotatedImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const imageSrcAddr = "http://192.168.18.107:8000/images/latestAnnotatedImage.jpg";

  useEffect(() => {
    const updateImage = () => {
      const newSrc = `${imageSrcAddr}?ts=${Date.now()}`;
      const img = new Image();
      img.src = newSrc;
      img.onload = () => {
        // Only update state once the new image is fully loaded
        setImageSrc(newSrc);
      };
    };

    updateImage(); // load once immediately
    const interval = setInterval(updateImage, 2500); // refresh every 2.5s

    return () => clearInterval(interval);
  }, [imageSrcAddr]);

  return (
    <div className="container-xl mt-4 theme-dark" style={{ maxWidth: "600px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span>Annotated image</span>
        </div>
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px", padding: 0 }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Annotated pic"
              style={{ maxWidth: "100%", borderRadius: "0 0 8px 8px" }}
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
