import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'
import { Projects, Shorts } from '../../api/project';

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Footer = (props) => {
    return (
        <footer className="footer-section">
            <div className="upper-footer">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="widget about-widget">
                                <div className="logo widget-title">
                                    <img src={logo} alt="logo" />
                                </div>
                                <div className="contact-ft">
                                    <ul>
                                        <li><i className="fi flaticon-phone-call"></i>+ 1 (246) 333-0088</li>
                                        <li><i className="fi flaticon-email"></i>alma.lawson@example.com</li>
                                        <li><i className="fi flaticon-placeholder"></i>4140 Parker Rd. Allentown,
                                            <br /> New Mexico 31134
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-sm-12 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Quick Link</h3>
                                </div>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/home">Home</Link></li>
                                    <li><Link onClick={ClickHandler} to="/about">About</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog">Latest news</Link></li>
                                    <li><Link onClick={ClickHandler} to="/portfolio">Portfolio</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-2 col-md-6 col-sm-12 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Follow Us</h3>
                                </div>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/">Behance</Link></li>
                                    <li><Link onClick={ClickHandler} to="/">Instagram</Link></li>
                                    <li><Link onClick={ClickHandler} to="/">Youtube</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-sm-12 col-12">
                            <div className="widget instagram">
                                <div className="widget-title">
                                    <h3>Instagram</h3>
                                </div>
                                <ul className="d-flex">
                                    {Projects.slice(0, 6).map((project, srv) => (
                                        <li key={srv}><Link onClick={ClickHandler} to={`/project-single/${project.slug}`}> <img src={project.pImg} alt="" /></Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lower-footer">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col col-lg-6 col-12">
                            <ul className="lower-footer-link">
                                <li><Link onClick={ClickHandler} to="/contact">Privacy & Terms.</Link></li>
                                <li><Link onClick={ClickHandler} to="/contact">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div className="col col-lg-6 col-12">
                            <div className="copy-right">
                                <p className="copyright"> &copy; 2023 <Link onClick={ClickHandler} to="/">Unded</Link>, All Rights
                                    Reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;