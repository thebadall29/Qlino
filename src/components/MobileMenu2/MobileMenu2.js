import React, { useState } from 'react';
import { Link } from 'react-scroll'
import './style.css';


const MobileMenu2 = () => {

    const [menuActive, setMenuState] = useState(false);


    return (
        <div>
            <div className={`mobileMenu ${menuActive ? "show" : ""}`}>
                <div className="menu-close">
                    <div className="clox" onClick={() => setMenuState(!menuActive)}><i className="ti-close"></i></div>
                </div>

                <ul className="responsivemenu">
                    <li><Link to="home" spy={true} smooth={true} duration={500} offset={-100} className="menu-item">_home</Link></li>
                    <li><Link to="about" spy={true} smooth={true} duration={500} offset={-100} className="menu-item">_about</Link></li>
                    <li><Link to="portfolio" spy={true} smooth={true} duration={500} offset={-100} className="menu-item">_portfolio</Link></li>
                    <li><Link to="skill" spy={true} smooth={true} duration={500} offset={-100} className="menu-item">_skill</Link></li>
                    <li><Link to="blog" spy={true} smooth={true} duration={500} offset={-100} className="menu-item">_blog</Link></li>
                </ul>

            </div>

            <div className="showmenu" onClick={() => setMenuState(!menuActive)}>
                <button type="button" className="navbar-toggler open-btn">
                    <span className="icon-bar first-angle"></span>
                    <span className="icon-bar middle-angle"></span>
                    <span className="icon-bar last-angle"></span>
                </button>
            </div>
        </div>
    )
}

export default MobileMenu2;