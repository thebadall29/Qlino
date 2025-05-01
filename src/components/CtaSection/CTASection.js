import React from "react";
import "./CTASection.css";
import { motion, useMotionValue, animate } from "framer-motion";
import client1 from "../../images/partners/ECW.jpg"
import client2 from "../../images/partners/rice.jpg"
import client3 from "../../images/partners/Fmp.jpg"
import client4 from "../../images/testimonial/sandeep.jpg"
import client5 from "../../images/testimonial/harsh.jpg"
const CTASection = () => {
  return (
    <section className="cta-wrapper">
      <div className="cta-card">
        <h2 className="cta-title">Take Action Today</h2>
        <p className="cta-subtext">
          Feel free to discuss your content strategy.
        </p>
        <div className="cta-button-wrapper">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="cta-book-button"
            onClick={() => window.open("https://calendly.com/cloudspaxx/30min", "_blank")}
            style={{ width: "350px",marginTop:"0rem" }}
          >
            Book a discovery Call (it's free)
          </motion.button>
        </div>
        <div className="cta-clients">
          {[client1, client2, client3, client4, client5].map((src, idx) => (
            <img key={idx} src={src} alt={`Client ${idx + 1}`} className="client-avatar" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
