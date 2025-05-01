import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./homegrid.css";
import { motion, useMotionValue, animate } from "framer-motion";

const VideoGrid = () => {
  const shortFormVideos = [
    "z8chu5ylz0",
    "6wh3zgtcq9",
    "24nlhvct02"
  ];

  const longFormVideos = [
    "aci54zhm58",
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="custom-video-grid">
      <div className="custom-grid-container">
      <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="branding-badge heading_line "
                    style={{ margin: "2rem auto 3rem auto" }}
                  >
                    VIDEO SAMPLES
                  </motion.span>
        <div className="custom-wistia-grid" >
          {shortFormVideos.map((videoId) => (
            <div
              key={videoId}
              className="custom-wistia-responsive-padding"
            >
              <div
                className="custom-wistia-responsive-wrapper"
                style={{
                  height: "100%",
                  left: "0",
                  position: "absolute",
                  top: "0",
                  width: "100%",
                }}
              >
                <div
                  className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
                  style={{ height: "100%", position: "relative", width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>

        {longFormVideos.map((videoId) => (
          <div
            key={videoId}
            className="custom-wistia-responsive-padding-long"
          >
            <div className="custom-wistia-responsive-wrapper-long">
              <div
                className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
                style={{ height: "100%", position: "relative", width: "100%" }}
              />
            </div>
          </div>
        ))}

        <div className="custom-more-button">
          <Link to="/portfolio" className="more-button-link">
            More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;
