import React from "react";
import "./ThumbnailSection.css";
import { motion } from "framer-motion";
import Thum1 from "../../images/images/thumbnail/thumb-1.jpg";
import Thum2 from "../../images/images/thumbnail/thumb-2.jpg";
import Thum3 from "../../images/images/thumbnail/thumb-3.jpg";
import Thum4 from "../../images/images/thumbnail/thumb-4.jpg";
import Thum5 from "../../images/images/thumbnail/thumb-5.jpg";
import Thum6 from "../../images/images/thumbnail/thumb-6.jpg";
import Thum7 from "../../images/images/thumbnail/thumb-7.jpg";
import Thum8 from "../../images/images/thumbnail/thumb-8.jpeg";
import Thum9 from "../../images/images/thumbnail/thumb-9.jpeg";
const ThumbnailSection = () => {
  const images = [
    Thum1, // Replace with your image URLs
    Thum2,
    Thum3,
    Thum4,
    Thum5,
    Thum6,
    Thum7,
    Thum8,
    Thum9
  ];

  return (
    <div className="slider-container" >
      <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="branding-badge heading_line"
              style={{ margin: "0 auto 1rem auto" }}
            >
              THUMBNAILS
            </motion.span>
      <div className="slider slider-top" style={{marginTop:"-1rem"}}>
        <div className="slide-wrapper">
          {images.map((src, index) => (
            <div className="slide-item" key={index}>
              <div className="thumbnail-border">
                <img src={src} alt={`Thumbnail ${index + 1}`} />
              </div>
            </div>
          ))}
          {images.map((src, index) => (
            <div className="slide-item" key={`dup-${index}`}>
              <div className="thumbnail-border">
                <img src={src} alt={`Thumbnail ${index + 1}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slider slider-bottom">
        <div className="slide-wrapper">
          {images.map((src, index) => (
            <div className="slide-item" key={index}>
              <div className="thumbnail-border">
                <img src={src} alt={`Thumbnail ${index + 1}`} />
              </div>
            </div>
          ))}
          {images.map((src, index) => (
            <div className="slide-item" key={`dup-${index}`}>
              <div className="thumbnail-border">
                <img src={src} alt={`Thumbnail ${index + 1}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailSection;
