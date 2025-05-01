import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

const LongFormVideoEditing = ({ limit }) => {
  const longFormVideos = [
    "aci54zhm58",
    "h0o587hxss",
    "f3qz9lmw5c",
    "huftscjv2a",
    "mrlmauhihb",
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
  const displayedVideos = longFormVideos.slice(0, limit);

  return (
    <section className="long-form-editing" style={{background: "linear-gradient(to bottom ,#1f1f1f, #373639 )",paddingBottom:"2rem"}}>

      {/* Background Shapes */}
      <div className="background-shape shape1"></div>
      <div className="background-shape shape2"></div>
      <div className="background-shape shape3"></div>
      <div className="container">
        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            
                            className="branding-badge heading_line "
                            style={{ margin: "0 auto 3rem auto" }}
                          >
                            Long Video Editing
                          </motion.span>
        <p>
          In-depth, long-form videos perfect for tutorials, detailed storytelling, and long engagement.
        </p>
        <div className="long-form-grid">
          {displayedVideos.map((videoId) => (
            <div
              key={videoId}
              className="wistia_responsive_padding_long"
            >
              <div
                className="wistia_responsive_wrapper_long"
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

export default LongFormVideoEditing;
