import React from "react";
import "./Testimonial.css"; // Importing the CSS file
import { motion, useMotionValue, animate } from "framer-motion";

import Pamela from "../../images/partners/ECW.jpg";
import Rice from "../../images/partners/rice.jpg";
import FMP from "../../images/partners/Fmp.jpg";
import Sandeep from "../../images/testimonial/sandeep.jpg";
import harsh from "../../images/testimonial/harsh.jpg";
import Sayam from "../../images/testimonial/sayyam.jpg";
const testimonials = [
  
  {
    text: "Really pleased with the editing service from badal and vishal. They understood what I needed and delivered on time. The quality of the video was excellent, and I felt confident sharing it with my audience they help every thing from starting to ending it doestnt matter money",
    name: "Harsh Nahar",
    image: harsh,
  },
  
  {
    text: "Just wanted to say thanks to the CloudSpax team. You’ve made my YouTube process so much smoother—editing’s always clean, fast, and exactly how I want it. Been working together for a few months now, and I don’t see that changing anytime soon. Highly recommend you guys if anyone’s on the fence.",
    name: "The FM Podcast",
    image: FMP,
  },
  
  
  {
    text: "I want to say thank you to the CloudSpax team. Guys, you have helped me with my YouTube channel. Your video editing was great. It's been great working with you in the last four months so far and I think I'll be working with you for a longer period of time. If you guys are looking for an editor, I certainly urge you to try CloudSpaks. You will not regret it.",
    name: "Quest Canada",
    image: Rice,

  },
  {
    text: "I’m so happy with the video editing service from CloudSpax. They took my basic clips and turned them into something really special. The turnaround time was quick, and they were very professional throughout the process.",
    name: "Pamela Mukherjii",
    image: Pamela,
  },
  {
    text: "I had a great experience with badal and vishal. They were very responsive and made sure my project was done on time. The quality of work was excellent, and I felt well taken care of throughout the process.",
    name: "Sanyam(SM cricket)",
    image: Sayam,
  },

  {
    text: "Working with CloudSpax for video editing was a breeze. They really understood my vision and brought it to life. The quality of the edits was top-notch, and they made sure I was satisfied with every detail.",
    name: "Sandeep Dhouni",
    image: Sandeep,
  },
  
];

const Testimonials = () => {
  return (
    <div className="testimonials-section">
      <div className="header">
        <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="branding-badge heading_line"
      >
        TESTIMONIALS
      </motion.span>
        {/* <h2>
          Hear From <span className="highlight">Creators</span> Who've <br />
          Transformed Their <span className="highlight">Brands</span>
        </h2> */}
      </div>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <p className="testimonial-text">"{testimonial.text}"</p>
            <div className="profile">
              <img src={testimonial.image} alt={testimonial.name} className="profile-img" />
              <p className="profile-name">{testimonial.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;

