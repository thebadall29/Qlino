import React, { useEffect } from 'react';
import { motion, useMotionValue, animate } from "framer-motion";
import ReactPlayer from 'react-player';
import './vsl.css';

const Immigration_vsl_traffic = () => {

    useEffect(() => {
        // Wistia Player Script
        const script1 = document.createElement('script');
        script1.src = "https://fast.wistia.com/player.js";
        script1.async = true;
        document.body.appendChild(script1);
    
        // Wistia Embed Script
        const script2 = document.createElement('script');
        script2.src = "https://fast.wistia.com/embed/qd8vz0bf1y.js";
        script2.type = "module";
        script2.async = true;
        document.body.appendChild(script2);
    
        // Clean up
        return () => {
          document.body.removeChild(script1);
          document.body.removeChild(script2);
        };
      }, []);
    
    return (
        <div className="vsl-container">
            {/* Background Shapes */}
            <div className="background-shape shape1"></div>
            <div className="background-shape shape2"></div>
            <div className="background-shape shape3"></div>

            {/* Header */}
            <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="hero-title"
      >
        <span className="highlight" style={{fontSize:"5rem"}}>From Zero Views to Insane Traffic</span>
      </motion.h1>


            {/* Main Headline */}
            <div className="vsl-headline">
                <h2>
                    <span className="highlight-white mainHeading">Posting Consistently But Still</span>
                    <span className="highlight-boxed mainHeading"> No Traffic?</span><br/>
                    <span className="highlight-white mainHeading">Why Immigration Consultant Struggle on YouTube</span><br/>
                    <span className="highlight-white mainHeading">(And How to Fix It)</span>
                </h2>
            </div>


            {/* Video Section */}
            <div className="vsl-video-wrapper">
                
                {/* <ReactPlayer
                    url="https://drive.google.com/file/d/1tfBesQ-k4R_khoMgFWDN7zmJMCgl0eyd/view?usp=sharing" // Replace with your video URL
                    controls
                    width="100%"
                /> */}

      <style>{`
        wistia-player[media-id='qd8vz0bf1y']:not(:defined) { 
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/qd8vz0bf1y/swatch'); 
          display: block; 
          filter: blur(5px); 
          padding-top:56.25%; 
        }
      `}</style>

      <wistia-player media-id="qd8vz0bf1y" aspect="1.7777777777777777"></wistia-player>
                
            </div>

            {/* CTA Section */}
            <div className="vsl-cta">
               
            <a href="https://calendly.com/cloudspaxx/30min" target="_blank" rel="noopener noreferrer">
          <button className="Book_link_vsl">YES! I Want To Book a Meeting</button>
        </a>
            </div>

         
        </div>
    );
};
export default Immigration_vsl_traffic;
