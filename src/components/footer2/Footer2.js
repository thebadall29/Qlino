import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__logo">
                    <h2>Qlino</h2>
                    <p>Your trusted healthcare partner</p>
                </div>
                
                <div className="footer__links">
                    <div className="footer__column">
                        <h3>Services</h3>
                        <Link to="/doctors">Find Doctors</Link>
                        <Link to="/consultations">Video Consultations</Link>
                        <Link to="/medicines">Medicines</Link>
                    </div>
                    
                    <div className="footer__column">
                        <h3>Company</h3>
                        <Link to="/about">About Us</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/blog">Blog</Link>
                    </div>
                    
                    <div className="footer__column">
                        <h3>Contact</h3>
                        <Link to="/contact">Help Center</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
            
            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} Qlino. All rights reserved.</p>
                <div className="footer__social">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-linkedin"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;