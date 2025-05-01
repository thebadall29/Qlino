import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
const ShortFormVideoEditing = ({ limit }) => {
  const shortFormVideos = [
    "z8chu5ylz0",
    "ih28j2ystj",
    "24nlhvct02",
    "6wh3zgtcq9",
    "sxme0iyjlu",
    "ai9ufem2ij",
  ];

  // Dynamically load Wistia embed scripts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Limit the number of videos based on the prop
  const displayedVideos = shortFormVideos.slice(0, limit);

  

  return (
    <section className="short-form-editing" style={{background: "linear-gradient(to bottom , #373639, #1f1f1f)"}}>

      {/* Background Shapes */}
      <div className="background-shape shape1"></div>
      <div className="background-shape shape2"></div>
      <div className="background-shape shape3"></div>

      <div className="container" style={{padding:"2rem"}}>
      <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    
                    className="branding-badge heading_line "
                    style={{ margin: "0 auto 3rem auto" }}
                  >
                    Short Video Editing
                  </motion.span>
        <p>
          High-impact, short-form videos for platforms like TikTok, Instagram, and YouTube Shorts. Enhance your brand with concise, engaging content.
        </p>
        <div className="wistia-grid">
          {displayedVideos.map((videoId) => (
            <div
              key={videoId}
              className="wistia_responsive_padding"
              style={{ padding: "177.78% 0 0 0", position: "relative" }}
            >
              <div
                className="wistia_responsive_wrapper"
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
      </div>
    </section>
  );
};

export default ShortFormVideoEditing;
