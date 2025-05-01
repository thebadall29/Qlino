import React from 'react';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import GoolgePlayStore from "../../images/QlinoApp/googlePlayStore.png";
import GooglePlayStoreBadge from "../../images/QlinoApp/google_badge.png";
import AppStoreBadge from "../../images/QlinoApp/appstore_badge.png";

const QlinoApp = () => {
    return (
        <section className="qlino-app-section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <motion.div 
                            className="app-mockup"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img src={GoolgePlayStore} alt="Qlino App Chat" className="mockup-image" />
                        </motion.div>
                    </div>
                    <div className="col-lg-6">
                        <motion.div 
                            className="app-info"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2>Download the Qlino app</h2>
                            <ul className="app-features">
                                <li>Book appointments and lab tests</li>
                                <li>Order medicines</li>
                                <li>Consult doctors online</li>
                                <li>Set medicine reminders</li>
                                <li>Store health records</li>
                                <li>Read health tips</li>
                            </ul>
                            <div className="app-buttons">
                                <a href="#" className="play-store">
                                    <img src={GooglePlayStoreBadge} alt="Get it on Google Play" />
                                </a>
                                <a href="#" className="app-store">
                                    <img src={AppStoreBadge} alt="Download on App Store" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QlinoApp;